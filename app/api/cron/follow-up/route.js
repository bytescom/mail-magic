import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import GmailService from '@/lib/gmail';
import { NextResponse } from 'next/server';

/**
 * GET /api/cron/follow-up
 *
 * Daily cron job that:
 * 1. Finds all applications that are due for a follow-up
 * 2. Sends follow-up email via same Gmail thread
 * 3. Updates application status to follow-up-sent
 *
 * Called by Vercel Cron at 09:00 IST daily (03:30 UTC)
 * Protected by CRON_SECRET env variable
 */
export async function GET(request) {
    try {
        // Validate cron secret via Authorization header (Vercel standard pattern)
        // Vercel sends: Authorization: Bearer <CRON_SECRET>
        const authHeader = request.headers.get('authorization');
        const expectedSecret = process.env.CRON_SECRET;

        if (!expectedSecret) {
            console.error('❌ CRON_SECRET env variable is not set');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        if (authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const now = new Date();

        // Find applications due for follow-up:
        // - status is 'sent' (no reply yet)
        // - followUpDate has passed
        // - followUpCount < 2 (max 2 follow-ups)
        const dueApplications = await Application.find({
            status: 'sent',
            followUpDate: { $lte: now },
            followUpCount: { $lt: 2 },
        }).populate('userId');

        console.log(`📅 Cron: Found ${dueApplications.length} applications due for follow-up`);

        const results = { sent: [], failed: [], skipped: [] };

        for (const application of dueApplications) {
            try {
                const user = await User.findById(application.userId);

                if (!user || !user.accessToken || !user.refreshToken) {
                    results.skipped.push({
                        applicationId: application._id,
                        reason: 'No Gmail tokens',
                    });
                    continue;
                }

                if (!application.gmailThreadId) {
                    results.skipped.push({
                        applicationId: application._id,
                        reason: 'No Gmail threadId',
                    });
                    continue;
                }

                // Generate follow-up email body
                const followUpBody = generateFollowUpEmail({
                    hrName: application.hrName,
                    companyName: application.companyName,
                    role: application.role,
                    followUpCount: application.followUpCount,
                });

                const gmailService = new GmailService(
                    user.accessToken,
                    user.refreshToken,
                    user._id.toString()
                );

                // Send follow-up in the same thread
                const result = await gmailService.sendEmailInThread({
                    threadId: application.gmailThreadId,
                    to: application.hrEmail,
                    subject: `Re: Application for ${application.role || 'the position'} at ${application.companyName || 'your company'}`,
                    body: followUpBody,
                    from: `${user.name} <${user.email}>`,
                });

                if (result.success) {
                    // Update application
                    const nextFollowUpDate = new Date();
                    nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 5); // next follow-up in 5 days

                    await Application.findByIdAndUpdate(application._id, {
                        status: 'follow-up-sent',
                        followUpCount: application.followUpCount + 1,
                        followUpDate: application.followUpCount + 1 < 2 ? nextFollowUpDate : null,
                        lastEmailId: result.messageId,
                        lastActionDate: new Date(),
                    });

                    results.sent.push({
                        applicationId: application._id,
                        company: application.companyName,
                        email: application.hrEmail,
                        followUpNumber: application.followUpCount + 1,
                    });

                    console.log(`✅ Follow-up sent to ${application.hrEmail} (follow-up #${application.followUpCount + 1})`);
                } else {
                    results.failed.push({
                        applicationId: application._id,
                        company: application.companyName,
                        error: result.error,
                    });
                }

                // Small delay between sends
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (err) {
                console.error(`Error sending follow-up for ${application._id}:`, err.message);
                results.failed.push({
                    applicationId: application._id,
                    error: err.message,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Follow-up cron complete: ${results.sent.length} sent, ${results.failed.length} failed, ${results.skipped.length} skipped`,
            results,
        });
    } catch (error) {
        console.error('Follow-up cron error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ── Follow-up email generator ─────────────────────────────────────────────────

function generateFollowUpEmail({ hrName, companyName, role, followUpCount }) {
    const greeting = hrName ? `Hi ${hrName}` : 'Hi';
    const roleText = role ? ` for the ${role} role` : '';
    const companyText = companyName ? ` at ${companyName}` : '';

    if (followUpCount === 0) {
        // First follow-up (day 4)
        return `${greeting},

I hope you're doing well. I wanted to follow up on my application${roleText}${companyText} that I sent a few days ago.

I remain very excited about the opportunity and I'm confident that my skills and experience would be a great fit for your team. I'd love to discuss how I can contribute to ${companyName || 'your organization'}.

Could you please let me know the status of my application when you get a chance?

Thank you for your time and consideration.

Best regards`;
    } else {
        // Second follow-up (day 9)
        return `${greeting},

I hope you're having a great week. I'm reaching out regarding my application${roleText}${companyText}.

I understand you may be busy reviewing many applications, but I wanted to express once more how interested I am in this opportunity. I believe I can bring real value to your team.

If the position has already been filled or if my profile isn't a match, please do let me know — I completely understand.

Thank you again for your time.

Best regards`;
    }
}
