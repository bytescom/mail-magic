import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import EmailTemplate from '@/models/EmailTemplate';
import HrEmail from '@/models/HrEmail';
import FollowUp from '@/models/FollowUp';
import Application from '@/models/Application';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const userId = session.user.id;

        const [
            totalTemplates,
            totalHrEmails,
            totalEmailsSent,
            totalEmailsFailed,
            recentLogs,
            todaySent,
            weekSent,
            pendingFollowUps,
            overdueFollowUps,
            respondedContacts,
            // Application tracking
            appStats,
        ] = await Promise.all([
            EmailTemplate.countDocuments({ userId }),
            HrEmail.countDocuments({ userId }),
            EmailLog.countDocuments({ userId, status: 'sent' }),
            EmailLog.countDocuments({ userId, status: 'failed' }),
            EmailLog.find({ userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('templateId', 'name')
                .populate('hrEmailId', 'email hrName company jobRole'),
            EmailLog.countDocuments({ userId, status: 'sent', createdAt: { $gte: todayStart } }),
            EmailLog.countDocuments({ userId, status: 'sent', createdAt: { $gte: sevenDaysAgo } }),
            FollowUp.countDocuments({ userId, status: 'pending' }),
            FollowUp.countDocuments({ userId, status: 'pending', scheduledDate: { $lte: now } }),
            HrEmail.countDocuments({ userId, status: 'responded' }),
            // Aggregate application stats in one go
            Application.aggregate([
                { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                        followUpSent: { $sum: { $cond: [{ $eq: ['$status', 'follow-up-sent'] }, 1, 0] } },
                        replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
                        interview: { $sum: { $cond: [{ $eq: ['$status', 'interview'] }, 1, 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
                        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
                        pendingFollowUpApps: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $in: ['$status', ['sent', 'follow-up-sent']] },
                                            { $lte: ['$followUpDate', new Date()] },
                                            { $ne: ['$followUpDate', null] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
        ]);

        const apps = appStats[0] || {
            total: 0, sent: 0, followUpSent: 0, replied: 0,
            interview: 0, rejected: 0, closed: 0, pendingFollowUpApps: 0,
        };

        // Reply rate from applications
        const totalTracked = apps.total || 0;
        const totalReplied = apps.replied + apps.interview + apps.rejected;
        const replyRate = totalTracked > 0 ? ((totalReplied / totalTracked) * 100).toFixed(1) : 0;
        const interviewRate = totalTracked > 0 ? ((apps.interview / totalTracked) * 100).toFixed(1) : 0;

        // Upcoming follow-ups (old system)
        const upcomingFollowUps = await FollowUp.find({ userId, status: 'pending' })
            .sort({ scheduledDate: 1 })
            .limit(3)
            .populate('hrEmailId', 'email hrName company jobRole');

        // Recent applications with basic info
        const recentApplications = await Application.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Next actions
        const nextActions = generateNextActions({
            totalEmailsSent, totalEmailsFailed, totalHrEmails, totalTemplates,
            pendingFollowUps, overdueFollowUps, todaySent, respondedContacts,
            appInterviews: apps.interview, appPendingFollowUp: apps.pendingFollowUpApps,
        });

        return NextResponse.json({
            stats: {
                totalTemplates,
                totalHrEmails,
                totalEmailsSent,
                totalEmailsFailed,
                successRate: totalEmailsSent + totalEmailsFailed > 0
                    ? ((totalEmailsSent / (totalEmailsSent + totalEmailsFailed)) * 100).toFixed(1)
                    : 0,
                todaySent,
                weekSent,
                pendingFollowUps,
                overdueFollowUps,
                respondedContacts,
            },
            // New: Application pipeline stats
            pipeline: {
                total: apps.total,
                sent: apps.sent,
                followUpSent: apps.followUpSent,
                replied: apps.replied,
                interview: apps.interview,
                rejected: apps.rejected,
                closed: apps.closed,
                pendingFollowUp: apps.pendingFollowUpApps,
                replyRate,
                interviewRate,
            },
            recentLogs,
            recentApplications,
            upcomingFollowUps,
            nextActions,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function generateNextActions({
    totalEmailsSent, totalEmailsFailed, totalHrEmails, totalTemplates,
    pendingFollowUps, overdueFollowUps, todaySent, respondedContacts,
    appInterviews, appPendingFollowUp,
}) {
    const actions = [];

    if (appInterviews > 0) {
        actions.push({
            id: 'interviews',
            title: `🎉 ${appInterviews} Interview${appInterviews > 1 ? 's' : ''} Scheduled!`,
            description: 'Check your applications tracker to prepare and take action.',
            type: 'urgent',
            link: '/applications',
            icon: 'CheckCircle2',
        });
    }

    if (overdueFollowUps > 0 || appPendingFollowUp > 0) {
        const count = Math.max(overdueFollowUps, appPendingFollowUp);
        actions.push({
            id: 'overdue-followups',
            title: `${count} Follow-up${count > 1 ? 's' : ''} Overdue`,
            description: 'Your follow-up emails are overdue. Send them to stay top-of-mind.',
            type: 'urgent',
            link: '/applications',
            icon: 'AlertTriangle',
        });
    }

    if (totalTemplates === 0) {
        actions.push({
            id: 'create-template',
            title: 'Create Your First Template',
            description: 'Set up an email template to start sending professional applications quickly.',
            type: 'setup',
            link: '/templates',
            icon: 'FileText',
        });
    }

    if (totalHrEmails === 0) {
        actions.push({
            id: 'add-contacts',
            title: 'Add HR Contacts',
            description: 'Import or add recruiter contacts to start your outreach campaign.',
            type: 'setup',
            link: '/hr-emails',
            icon: 'Users',
        });
    }

    if (todaySent === 0 && totalTemplates > 0 && totalHrEmails > 0) {
        actions.push({
            id: 'send-today',
            title: 'Send Applications Today',
            description: "You haven't sent any applications today. Consistency improves your chances.",
            type: 'action',
            link: '/send',
            icon: 'Send',
        });
    }

    if (pendingFollowUps > 0 && overdueFollowUps === 0) {
        actions.push({
            id: 'pending-followups',
            title: `${pendingFollowUps} Follow-up${pendingFollowUps > 1 ? 's' : ''} Scheduled`,
            description: 'Review upcoming follow-ups to stay on top of your pipeline.',
            type: 'info',
            link: '/applications',
            icon: 'Clock',
        });
    }

    if (totalEmailsFailed > 0 && totalEmailsSent > 0) {
        const failRate = (totalEmailsFailed / (totalEmailsSent + totalEmailsFailed)) * 100;
        if (failRate > 20) {
            actions.push({
                id: 'fix-failures',
                title: 'Review Failed Deliveries',
                description: `${failRate.toFixed(0)}% of your emails failed. Check your contact list.`,
                type: 'warning',
                link: '/logs?status=failed',
                icon: 'AlertCircle',
            });
        }
    }

    if (totalEmailsSent >= 10) {
        actions.push({
            id: 'review-analytics',
            title: 'Review Analytics',
            description: 'Analyze which roles and companies are performing best.',
            type: 'info',
            link: '/analytics',
            icon: 'BarChart3',
        });
    }

    return actions.slice(0, 3);
}
