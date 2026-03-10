import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import FollowUp from '@/models/FollowUp';
import User from '@/models/User';
import { GmailService } from '@/lib/gmail';
import { NextResponse } from 'next/server';

/**
 * POST /api/follow-ups/send
 *
 * Manually sends a follow-up email immediately via Gmail.
 * Checks the user's maxFollowUps limit per application before sending.
 */
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { followUpId } = await request.json();
        if (!followUpId) {
            return NextResponse.json({ error: 'followUpId is required' }, { status: 400 });
        }

        // Load the follow-up with its linked email log
        const followUp = await FollowUp.findOne({
            _id: followUpId,
            userId: session.user.id,
        }).populate('emailLogId', 'subject threadId recipient');

        if (!followUp) {
            return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
        }

        if (followUp.status === 'sent') {
            return NextResponse.json({ error: 'This follow-up has already been sent' }, { status: 400 });
        }

        // Load user settings + Gmail tokens
        const user = await User.findById(session.user.id);
        if (!user || !user.accessToken || !user.refreshToken) {
            return NextResponse.json(
                { error: 'Gmail not connected. Please sign out and sign in again.' },
                { status: 400 }
            );
        }

        // Check how many follow-ups have already been sent for this email log
        const maxFollowUps = user.settings?.maxFollowUps ?? 1;
        const alreadySent = await FollowUp.countDocuments({
            userId: session.user.id,
            emailLogId: followUp.emailLogId?._id,
            status: 'sent',
        });

        if (alreadySent >= maxFollowUps) {
            return NextResponse.json(
                {
                    error: `Follow-up limit reached. You can send at most ${maxFollowUps} follow-up(s) per application. Change this in Settings.`,
                    limitReached: true,
                },
                { status: 400 }
            );
        }

        // Send via Gmail
        const gmailService = new GmailService(user.accessToken, user.refreshToken, user._id.toString());

        const threadId = followUp.emailLogId?.threadId;
        let result;

        if (threadId) {
            // Reply in the same thread
            result = await gmailService.sendEmailInThread({
                threadId,
                to: followUp.recipient,
                subject: followUp.subject,
                body: followUp.message,
                from: `${user.name} <${user.email}>`,
            });
        } else {
            // Send as fresh email
            result = await gmailService.sendEmail({
                to: followUp.recipient,
                subject: followUp.subject,
                body: followUp.message,
                from: `${user.name} <${user.email}>`,
            });
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to send email via Gmail' },
                { status: 500 }
            );
        }

        // Mark follow-up as sent
        followUp.status = 'sent';
        followUp.sentAt = new Date();
        followUp.updatedAt = new Date();
        await followUp.save();

        return NextResponse.json({
            success: true,
            message: 'Follow-up sent successfully!',
            sentAt: followUp.sentAt,
        });
    } catch (error) {
        console.error('Follow-up send error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
