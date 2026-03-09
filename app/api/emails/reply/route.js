import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import EmailLog from '@/models/EmailLog';
import User from '@/models/User';
import GmailService from '@/lib/gmail';
import { NextResponse } from 'next/server';

/**
 * POST /api/emails/reply
 *
 * Sends a reply inside an existing Gmail thread (in response to an HR reply).
 * Body: { applicationId, subject, body }
 */
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { applicationId, subject, body: replyBody } = await request.json();

        if (!applicationId || !replyBody?.trim()) {
            return NextResponse.json({ error: 'applicationId and body are required' }, { status: 400 });
        }

        await dbConnect();

        // Load application — scoped to the current user
        const application = await Application.findOne({
            _id: applicationId,
            userId: session.user.id,
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        if (!application.gmailThreadId) {
            return NextResponse.json({
                error: 'No Gmail thread linked to this application. Cannot send in-thread reply.',
            }, { status: 400 });
        }

        // Safety guard — warn if no reply detected yet
        const repliedStatuses = ['replied', 'interview', 'positive'];
        if (!repliedStatuses.includes(application.status) && application.replyType === null) {
            // Allow it but let the caller know there's no detected reply
            console.warn(`⚠️ Sending reply to application ${applicationId} with status "${application.status}" and no detected reply`);
        }

        // Load user for Gmail tokens
        const user = await User.findById(session.user.id);
        if (!user?.accessToken || !user?.refreshToken) {
            return NextResponse.json({
                error: 'Gmail authentication required. Please sign out and sign in again.',
                code: 'MISSING_GMAIL_TOKENS',
            }, { status: 401 });
        }

        const gmailService = new GmailService(user.accessToken, user.refreshToken, user._id.toString());

        const replySubject = subject || `Re: Application for ${application.role || 'the position'} at ${application.companyName || 'your company'}`;

        const result = await gmailService.sendEmailInThread({
            threadId: application.gmailThreadId,
            to: application.hrEmail,
            subject: replySubject,
            body: replyBody,
            from: `${user.name} <${user.email}>`,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send reply' }, { status: 500 });
        }

        // Log the sent reply
        await EmailLog.create({
            userId: session.user.id,
            recipient: application.hrEmail,
            subject: replySubject,
            body: replyBody,
            status: 'sent',
            gmailMessageId: result.messageId || null,
            gmailThreadId: application.gmailThreadId,
            sentAt: new Date(),
        });

        // Update application — mark last action
        await Application.findByIdAndUpdate(applicationId, {
            lastActionDate: new Date(),
            lastEmailId: result.messageId || null,
        });

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            threadId: result.threadId,
        });

    } catch (error) {
        console.error('Reply send error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
