import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import EmailLog from '@/models/EmailLog';
import User from '@/models/User';
import GmailService from '@/lib/gmail';
import { NextResponse } from 'next/server';

/**
 * POST /api/reply-checker
 *
 * Polls Gmail for unread messages, matches them against open Applications via threadId,
 * saves received EmailLog entries, triggers AI classification, and updates Application status.
 *
 * Can be called:
 * - Manually by user clicking "Check Replies" button
 * - Automatically via Vercel Cron job
 */
export async function POST(request) {
    try {
        // Support both authenticated user calls AND cron job calls (with secret)
        const { searchParams } = new URL(request.url);
        const cronSecret = searchParams.get('secret');
        const isCronJob = cronSecret === process.env.CRON_SECRET;

        let userId;

        if (isCronJob) {
            // Cron job: process all users with active applications
            return await processAllUsers();
        } else {
            // Authenticated user: process only their account
            const session = await getServerSession(authOptions);
            if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            userId = session.user.id;
            return await processUser(userId);
        }
    } catch (error) {
        console.error('Reply checker error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Also allow GET for manual trigger from browser
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return await processUser(session.user.id);
}

// Process a single user's Gmail inbox
async function processUser(userId) {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user || !user.accessToken || !user.refreshToken) {
        return NextResponse.json({
            error: 'Gmail tokens not found. Please re-authenticate.',
        }, { status: 401 });
    }

    // Find all open applications (sent or follow-up-sent) that have a threadId
    const openApplications = await Application.find({
        userId,
        status: { $in: ['sent', 'follow-up-sent'] },
        gmailThreadId: { $exists: true, $ne: null },
    });

    if (openApplications.length === 0) {
        return NextResponse.json({
            message: 'No open applications to check',
            checked: 0,
            newReplies: 0,
        });
    }

    console.log(`📬 Checking ${openApplications.length} open applications for user ${userId}`);

    // Build a threadId → Application map for fast lookup
    const threadMap = {};
    openApplications.forEach(app => {
        threadMap[app.gmailThreadId] = app;
    });

    const gmailService = new GmailService(user.accessToken, user.refreshToken, userId);

    let newRepliesFound = 0;
    const results = [];

    // For each open application, check if there are new messages in the thread
    for (const application of openApplications) {
        try {
            // Get full thread from Gmail
            const threadData = await getGmailThread(gmailService, application.gmailThreadId);

            if (!threadData || !threadData.messages || threadData.messages.length <= 1) {
                // Only the original sent email — no reply yet
                continue;
            }

            // Look for messages that are NOT from the user (i.e., replies from HR)
            const userEmail = user.email.toLowerCase();
            const replies = threadData.messages.filter(msg => {
                const from = getHeader(msg, 'From') || '';
                return !from.toLowerCase().includes(userEmail);
            });

            if (replies.length === 0) continue;

            // Get the latest reply
            const latestReply = replies[replies.length - 1];
            const messageId = latestReply.id;

            // Check if we already logged this message
            const alreadyLogged = await EmailLog.findOne({
                userId,
                gmailMessageId: messageId,
            });

            if (alreadyLogged) continue;

            // Extract reply content
            const from = getHeader(latestReply, 'From') || '';
            const subject = getHeader(latestReply, 'Subject') || '';
            const bodyPreview = extractBodyPreview(latestReply);

            // Save EmailLog entry for the received reply
            await EmailLog.create({
                userId,
                recipient: user.email, // it's incoming; "recipient" here means the user received it
                subject: subject || `Re: Application to ${application.companyName}`,
                body: bodyPreview || '(no body)',
                status: 'sent', // reusing status field; direction distinguishes it
                gmailMessageId: messageId,
                gmailThreadId: application.gmailThreadId,
                sentAt: new Date(),
            });

            // AI Classify the reply
            let replyType = 'neutral';
            let confidence = 0.5;

            try {
                const classifyRes = await fetch(
                    `${process.env.NEXTAUTH_URL}/api/ai-classify`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ emailBody: bodyPreview }),
                    }
                );

                if (classifyRes.ok) {
                    const classification = await classifyRes.json();
                    replyType = classification.replyType || 'neutral';
                    confidence = classification.confidenceScore || 0.5;
                }
            } catch (classifyErr) {
                console.warn('AI classification failed (non-fatal):', classifyErr.message);
            }

            // Map replyType to status
            const statusMap = {
                interview: 'interview',
                positive: 'replied',
                negative: 'rejected',
                neutral: 'replied',
            };

            const newStatus = statusMap[replyType] || 'replied';

            // Update application
            await Application.findByIdAndUpdate(application._id, {
                status: newStatus,
                replyType,
                replyConfidence: confidence,
                lastReplyPreview: bodyPreview?.substring(0, 300) || null,
                lastEmailId: messageId,
                lastActionDate: new Date(),
                // Cancel pending follow-up
                followUpDate: null,
            });

            newRepliesFound++;
            results.push({
                applicationId: application._id,
                company: application.companyName,
                replyType,
                newStatus,
            });

            console.log(`✅ Reply found for ${application.companyName} → ${replyType} → ${newStatus}`);
        } catch (appError) {
            console.error(`Error checking application ${application._id}:`, appError.message);
        }
    }

    return NextResponse.json({
        message: `Checked ${openApplications.length} applications, found ${newRepliesFound} new replies`,
        checked: openApplications.length,
        newReplies: newRepliesFound,
        results,
    });
}

// Process all users (for cron job)
async function processAllUsers() {
    await dbConnect();

    // Find all users who have open applications
    const activeUserIds = await Application.distinct('userId', {
        status: { $in: ['sent', 'follow-up-sent'] },
    });

    console.log(`🔄 Cron: Processing ${activeUserIds.length} users`);

    let totalReplies = 0;
    for (const userId of activeUserIds) {
        try {
            const result = await processUser(userId.toString());
            const data = await result.json();
            totalReplies += data.newReplies || 0;
        } catch (err) {
            console.error(`Failed to process user ${userId}:`, err.message);
        }
    }

    return NextResponse.json({
        message: `Cron complete: processed ${activeUserIds.length} users, found ${totalReplies} new replies`,
        usersProcessed: activeUserIds.length,
        totalNewReplies: totalReplies,
    });
}

// ── Gmail helpers ──────────────────────────────────────────────────────────────

async function getGmailThread(gmailService, threadId) {
    try {
        const response = await gmailService.gmail.users.threads.get({
            userId: 'me',
            id: threadId,
            format: 'full',
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Gmail thread:', error.message);
        return null;
    }
}

function getHeader(message, name) {
    const headers = message.payload?.headers || [];
    const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
    return header?.value || null;
}

function extractBodyPreview(message) {
    try {
        const payload = message.payload;
        if (!payload) return '';

        // Try plain text first
        let body = extractBody(payload, 'text/plain');
        if (!body) body = extractBody(payload, 'text/html');

        if (!body) return '';

        // Decode base64
        const decoded = Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');

        // Strip HTML tags if needed
        const stripped = decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        return stripped.substring(0, 500);
    } catch (e) {
        return '';
    }
}

function extractBody(payload, mimeType) {
    if (payload.mimeType === mimeType && payload.body?.data) {
        return payload.body.data;
    }

    if (payload.parts) {
        for (const part of payload.parts) {
            const found = extractBody(part, mimeType);
            if (found) return found;
        }
    }

    return null;
}
