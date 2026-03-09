import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import FollowUp from '@/models/FollowUp';
import EmailLog from '@/models/EmailLog';
import { NextResponse } from 'next/server';

// POST - Auto-generate follow-ups for sent emails that don't have one yet
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { followUpDays = 7 } = body;

        // Find sent emails that don't have follow-ups yet
        const existingFollowUpLogIds = await FollowUp.distinct('emailLogId', {
            userId: session.user.id,
        });

        const sentEmails = await EmailLog.find({
            userId: session.user.id,
            status: 'sent',
            _id: { $nin: existingFollowUpLogIds },
        })
            .populate('hrEmailId', 'email hrName company jobRole status')
            .sort({ createdAt: -1 })
            .limit(50);

        // Only create follow-ups for applications that haven't been responded to
        const eligibleEmails = sentEmails.filter(
            email => email.hrEmailId && email.hrEmailId.status !== 'responded'
        );

        const followUps = [];
        for (const email of eligibleEmails) {
            const scheduledDate = new Date(email.createdAt);
            scheduledDate.setDate(scheduledDate.getDate() + followUpDays);

            const hrName = email.hrEmailId?.hrName || 'Hiring Manager';
            const company = email.hrEmailId?.company || 'your company';
            const jobRole = email.hrEmailId?.jobRole || 'the position';

            const followUp = await FollowUp.create({
                userId: session.user.id,
                emailLogId: email._id,
                hrEmailId: email.hrEmailId?._id,
                recipient: email.recipient,
                company,
                jobRole,
                subject: `Follow-up: ${email.subject}`,
                message: `Dear ${hrName},\n\nI hope this message finds you well. I wanted to follow up on my application for ${jobRole} at ${company} that I submitted recently.\n\nI remain very interested in this opportunity and would welcome the chance to discuss how my skills and experience align with the requirements of the role.\n\nPlease let me know if you need any additional information from my end.\n\nThank you for your time and consideration.\n\nBest regards`,
                scheduledDate,
                priority: scheduledDate <= new Date() ? 'high' : 'medium',
            });

            followUps.push(followUp);
        }

        return NextResponse.json({
            created: followUps.length,
            followUps,
            message: `Created ${followUps.length} follow-up reminders`,
        });
    } catch (error) {
        console.error('Error auto-generating follow-ups:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
