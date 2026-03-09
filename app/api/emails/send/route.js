import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import EmailTemplate from '@/models/EmailTemplate';
import HrEmail from '@/models/HrEmail';
import User from '@/models/User';
import Notification from '@/models/Notification';
import Application from '@/models/Application';
import GmailService from '@/lib/gmail';
import { replaceVariables } from '@/lib/utils';
import { NextResponse } from 'next/server';

// ============================================
// SPAM PREVENTION CONFIGURATION
// ============================================
const SPAM_PREVENTION = {
    MAX_EMAILS_PER_BATCH: 15,      // Maximum emails per single request
    MAX_EMAILS_PER_DAY: 50,        // Daily limit to avoid Gmail throttling
    BASE_DELAY_MS: 3000,           // Starting delay between emails (3 seconds)
    DELAY_INCREMENT_MS: 500,       // Add 500ms per email sent in batch
    MAX_DELAY_MS: 15000,           // Maximum delay cap (15 seconds)
    RANDOMIZE_DELAY: true,         // Add random variance to appear more human
};

// Calculate dynamic delay based on position in batch
function calculateDynamicDelay(emailIndex, baseDelay) {
    let delay = baseDelay + (emailIndex * SPAM_PREVENTION.DELAY_INCREMENT_MS);
    delay = Math.min(delay, SPAM_PREVENTION.MAX_DELAY_MS);

    // Add random variance (±20%) to appear more natural
    if (SPAM_PREVENTION.RANDOMIZE_DELAY) {
        const variance = delay * 0.2;
        delay = delay + (Math.random() * variance * 2 - variance);
    }

    return Math.round(delay);
}

export async function POST(request) {
    try {
        console.log('📧 Email send request received');
        const session = await getServerSession(authOptions);

        console.log('🔐 Session check:', {
            hasSession: !!session,
            userEmail: session?.user?.email,
            userId: session?.user?.id,
            hasAccessToken: !!session?.accessToken,
        });

        if (!session) {
            console.error('❌ No session found - user not authenticated');
            return NextResponse.json({
                error: 'Unauthorized - Please sign in again',
                code: 'NO_SESSION'
            }, { status: 401 });
        }

        const body = await request.json();
        const { templateId, hrEmailIds, variables, documentIds } = body;

        console.log('📦 Payload received:', {
            templateId,
            hrEmailCount: hrEmailIds?.length,
            documentIds,
            documentCount: documentIds?.length || 0,
        });

        if (!templateId || !hrEmailIds || hrEmailIds.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ============================================
        // SPAM PREVENTION CHECK #1: Batch Size Limit
        // ============================================
        if (hrEmailIds.length > SPAM_PREVENTION.MAX_EMAILS_PER_BATCH) {
            return NextResponse.json({
                error: `Spam Prevention: Maximum ${SPAM_PREVENTION.MAX_EMAILS_PER_BATCH} emails per batch. You selected ${hrEmailIds.length}. Please reduce selection to protect your account.`,
                code: 'BATCH_LIMIT_EXCEEDED',
                limit: SPAM_PREVENTION.MAX_EMAILS_PER_BATCH,
                requested: hrEmailIds.length
            }, { status: 429 });
        }

        await dbConnect();

        // ============================================
        // SPAM PREVENTION CHECK #2: Daily Rate Limit
        // ============================================
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const emailsSentToday = await EmailLog.countDocuments({
            userId: session.user.id,
            status: 'sent',
            createdAt: { $gte: today }
        });

        const remainingDaily = SPAM_PREVENTION.MAX_EMAILS_PER_DAY - emailsSentToday;

        if (remainingDaily <= 0) {
            return NextResponse.json({
                error: `Daily limit reached! You've sent ${emailsSentToday} emails today. Gmail allows a maximum of ${SPAM_PREVENTION.MAX_EMAILS_PER_DAY} per day to prevent spam detection. Try again tomorrow.`,
                code: 'DAILY_LIMIT_EXCEEDED',
                sentToday: emailsSentToday,
                limit: SPAM_PREVENTION.MAX_EMAILS_PER_DAY
            }, { status: 429 });
        }

        if (hrEmailIds.length > remainingDaily) {
            return NextResponse.json({
                error: `You can only send ${remainingDaily} more emails today. Please reduce your selection from ${hrEmailIds.length} to ${remainingDaily} recipients.`,
                code: 'DAILY_LIMIT_PARTIAL',
                remaining: remainingDaily,
                requested: hrEmailIds.length
            }, { status: 429 });
        }

        // Get template
        const template = await EmailTemplate.findOne({
            _id: templateId,
            userId: session.user.id,
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Get HR emails
        const hrEmails = await HrEmail.find({
            _id: { $in: hrEmailIds },
            userId: session.user.id,
        });

        if (hrEmails.length === 0) {
            return NextResponse.json({ error: 'No valid recipients found' }, { status: 404 });
        }

        // Get user for Gmail API
        const user = await User.findById(session.user.id);

        console.log('👤 User token status:', {
            userFound: !!user,
            hasAccessToken: !!user?.accessToken,
            hasRefreshToken: !!user?.refreshToken,
            tokenExpiry: user?.tokenExpiry,
        });

        if (!user || !user.accessToken || !user.refreshToken) {
            console.error('❌ Gmail tokens missing from database');

            // Check token expiry if available
            const tokenExpired = user?.tokenExpiry ? new Date(user.tokenExpiry) < new Date() : true;

            return NextResponse.json({
                error: 'Gmail authentication required. Please sign out and sign in again to authorize Gmail access.',
                code: 'MISSING_GMAIL_TOKENS',
                details: {
                    userFound: !!user,
                    hasAccessToken: !!user?.accessToken,
                    hasRefreshToken: !!user?.refreshToken,
                    tokenExpiry: user?.tokenExpiry,
                    tokenExpired: tokenExpired,
                },
                action: {
                    message: 'Visit /token-diagnostics to check your token status',
                    diagnosticsUrl: '/token-diagnostics'
                }
            }, { status: 401 });
        }

        // ============================================
        // FETCH MULTIPLE ATTACHMENTS BY IDS
        // ============================================
        const attachments = [];

        if (documentIds && documentIds.length > 0) {
            console.log(`📎 Fetching ${documentIds.length} document(s)...`);
            console.log('👤 User documents:', user.documents?.length || 0);

            for (const documentId of documentIds) {
                try {
                    // Find document in the documents array
                    let document = null;

                    if (user.documents && user.documents.length > 0) {
                        document = user.documents.find(d => d._id?.toString() === documentId);
                    }

                    if (!document) {
                        console.warn('⚠️ Document not found for ID:', documentId);
                        continue;
                    }

                    if (!document.url) {
                        console.warn('⚠️ Document URL missing for:', document.filename);
                        continue;
                    }

                    console.log('📥 Fetching document from Blob:', document.filename);
                    const response = await fetch(document.url);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch: ${response.statusText}`);
                    }

                    const arrayBuffer = await response.arrayBuffer();
                    const base64Data = Buffer.from(arrayBuffer).toString('base64');

                    attachments.push({
                        filename: document.filename,
                        mimeType: document.mimeType || 'application/octet-stream',
                        data: base64Data,
                    });

                    console.log('✅ Attached:', document.filename);
                } catch (error) {
                    console.error(`❌ Failed to fetch document ${documentId}:`, error.message);
                }
            }
        }

        console.log(`📎 Total attachments: ${attachments.length}`);

        // Initialize Gmail service with userId for token refresh
        const gmailService = new GmailService(user.accessToken, user.refreshToken, user._id.toString());

        const results = {
            sent: [],
            failed: [],
            total: hrEmails.length,
            spamPrevention: {
                batchSize: hrEmails.length,
                dailyRemaining: remainingDaily - hrEmails.length,
                delayStrategy: 'dynamic_scaling'
            }
        };

        // Get base delay setting from user preferences
        const baseDelay = user.settings?.emailDelay || SPAM_PREVENTION.BASE_DELAY_MS;

        // ============================================
        // SEND EMAILS WITH DYNAMIC DELAYS
        // ============================================
        for (let i = 0; i < hrEmails.length; i++) {
            const hrEmail = hrEmails[i];

            try {
                // Prepare variables for this email
                const emailVariables = {
                    ...variables,
                    hr_name: hrEmail.hrName || 'Hiring Manager',
                    hrName: hrEmail.hrName || 'Hiring Manager',
                    company: hrEmail.company || '',
                    company_name: hrEmail.company || '',
                    job_role: hrEmail.jobRole || '',
                    jobRole: hrEmail.jobRole || '',
                    your_name: variables.your_name || session.user.name || '',
                    resume_link: variables.resume_link || '',
                    portfolio_link: variables.portfolio_link || '',
                };

                // Replace variables in subject and body
                const subject = replaceVariables(template.subject, emailVariables);
                const emailBody = replaceVariables(template.body, emailVariables);

                // Send email with optional attachments
                // Format sender as "Name <email>" for proper display
                const senderName = user.name || variables.your_name || 'Job Applicant';
                const fromHeader = `${senderName} <${user.email}>`;

                const result = await gmailService.sendEmail({
                    to: hrEmail.email,
                    subject,
                    body: emailBody,
                    from: fromHeader,
                    attachments,
                });

                // Create log entry
                const log = await EmailLog.create({
                    userId: session.user.id,
                    templateId: template._id,
                    hrEmailId: hrEmail._id,
                    recipient: hrEmail.email,
                    subject,
                    body: emailBody,
                    status: result.success ? 'sent' : 'failed',
                    errorMessage: result.error || null,
                    gmailMessageId: result.messageId || null,
                    gmailThreadId: result.threadId || null,
                    sentAt: result.success ? new Date() : null,
                });

                if (result.success) {
                    results.sent.push({
                        email: hrEmail.email,
                        logId: log._id,
                    });

                    // Update HR email lastContacted
                    hrEmail.lastContacted = new Date();
                    hrEmail.status = 'contacted';
                    await hrEmail.save();

                    // ============================================
                    // CREATE APPLICATION TRACKING RECORD
                    // ============================================
                    try {
                        const followUpDate = new Date();
                        followUpDate.setDate(followUpDate.getDate() + 4); // Follow up in 4 days

                        await Application.create({
                            userId: session.user.id,
                            companyName: hrEmail.company || '',
                            role: hrEmail.jobRole || '',
                            hrName: hrEmail.hrName || '',
                            hrEmail: hrEmail.email,
                            emailLogId: log._id,
                            hrEmailId: hrEmail._id,
                            gmailThreadId: result.threadId || null,
                            lastEmailId: result.messageId || null,
                            status: 'sent',
                            followUpDate,
                            followUpCount: 0,
                            lastActionDate: new Date(),
                        });
                        console.log('✅ Application record created for:', hrEmail.email);
                    } catch (appError) {
                        console.error('⚠️ Failed to create Application record (non-fatal):', appError.message);
                    }
                } else {
                    results.failed.push({
                        email: hrEmail.email,
                        error: result.error,
                        logId: log._id,
                    });
                }

                // ============================================
                // DYNAMIC DELAY: Increases with each email
                // ============================================
                if (i < hrEmails.length - 1) {
                    const dynamicDelay = calculateDynamicDelay(i, baseDelay);
                    await new Promise(resolve => setTimeout(resolve, dynamicDelay));
                }
            } catch (error) {
                console.error(`Error sending to ${hrEmail.email}:`, error);
                results.failed.push({
                    email: hrEmail.email,
                    error: error.message,
                });
            }
        }

        // Update template usage count
        template.usageCount += 1;
        await template.save();

        // Create notification for campaign completion
        if (results.sent.length > 0) {
            try {
                await Notification.create({
                    userId: user._id,
                    userEmail: user.email,
                    title: results.failed.length > 0
                        ? 'Campaign Partially Completed'
                        : 'Campaign Completed',
                    message: `Successfully sent ${results.sent.length} email${results.sent.length !== 1 ? 's' : ''}${results.failed.length > 0 ? `, ${results.failed.length} failed` : ''}`,
                    type: 'campaign',
                    icon: 'Send',
                    link: '/logs',
                    isRead: false,
                });
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
                // Don't fail the request if notification creation fails
            }
        }

        return NextResponse.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error('Error sending emails:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
