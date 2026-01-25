import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import EmailTemplate from '@/models/EmailTemplate';
import HrEmail from '@/models/HrEmail';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get counts
        const [
            totalTemplates,
            totalHrEmails,
            totalEmailsSent,
            totalEmailsFailed,
            recentLogs,
        ] = await Promise.all([
            EmailTemplate.countDocuments({ userId: session.user.id }),
            HrEmail.countDocuments({ userId: session.user.id }),
            EmailLog.countDocuments({ userId: session.user.id, status: 'sent' }),
            EmailLog.countDocuments({ userId: session.user.id, status: 'failed' }),
            EmailLog.find({ userId: session.user.id })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('templateId', 'name')
                .populate('hrEmailId', 'email hrName'),
        ]);

        // Get email stats by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const emailsByDay = await EmailLog.aggregate([
            {
                $match: {
                    userId: session.user.id,
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    sent: {
                        $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] },
                    },
                    failed: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        return NextResponse.json({
            stats: {
                totalTemplates,
                totalHrEmails,
                totalEmailsSent,
                totalEmailsFailed,
                successRate: totalEmailsSent + totalEmailsFailed > 0
                    ? ((totalEmailsSent / (totalEmailsSent + totalEmailsFailed)) * 100).toFixed(1)
                    : 0,
            },
            recentLogs,
            emailsByDay,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
