import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import FollowUp from '@/models/FollowUp';
import EmailLog from '@/models/EmailLog';
import HrEmail from '@/models/HrEmail';
import { NextResponse } from 'next/server';

// GET - Fetch follow-ups for the current user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');

        const query = { userId: session.user.id };
        if (status && status !== 'all') {
            query.status = status;
        }

        const followUps = await FollowUp.find(query)
            .sort({ scheduledDate: 1 })
            .limit(limit)
            .populate('emailLogId', 'subject status createdAt')
            .populate('hrEmailId', 'email hrName company jobRole');

        // Count by status
        const [pendingCount, sentCount, skippedCount] = await Promise.all([
            FollowUp.countDocuments({ userId: session.user.id, status: 'pending' }),
            FollowUp.countDocuments({ userId: session.user.id, status: 'sent' }),
            FollowUp.countDocuments({ userId: session.user.id, status: 'skipped' }),
        ]);

        // Get overdue follow-ups (pending and past their scheduled date)
        const overdueCount = await FollowUp.countDocuments({
            userId: session.user.id,
            status: 'pending',
            scheduledDate: { $lte: new Date() },
        });

        return NextResponse.json({
            followUps,
            counts: {
                pending: pendingCount,
                sent: sentCount,
                skipped: skippedCount,
                overdue: overdueCount,
                total: pendingCount + sentCount + skippedCount,
            },
        });
    } catch (error) {
        console.error('Error fetching follow-ups:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new follow-up
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { emailLogId, scheduledDate, subject, message, priority } = body;

        if (!emailLogId) {
            return NextResponse.json({ error: 'emailLogId is required' }, { status: 400 });
        }

        // Get the email log to extract details
        const emailLog = await EmailLog.findOne({
            _id: emailLogId,
            userId: session.user.id,
        }).populate('hrEmailId', 'email hrName company jobRole');

        if (!emailLog) {
            return NextResponse.json({ error: 'Email log not found' }, { status: 404 });
        }

        // Default follow-up date: 7 days from the original email
        const defaultDate = new Date(emailLog.createdAt);
        defaultDate.setDate(defaultDate.getDate() + 7);

        const followUp = await FollowUp.create({
            userId: session.user.id,
            emailLogId,
            hrEmailId: emailLog.hrEmailId?._id,
            recipient: emailLog.recipient,
            company: emailLog.hrEmailId?.company || '',
            jobRole: emailLog.hrEmailId?.jobRole || '',
            subject: subject || `Follow-up: ${emailLog.subject}`,
            message: message || generateDefaultFollowUpMessage(
                emailLog.hrEmailId?.hrName || 'Hiring Manager',
                emailLog.hrEmailId?.company || 'your company',
                emailLog.hrEmailId?.jobRole || 'the position'
            ),
            scheduledDate: scheduledDate ? new Date(scheduledDate) : defaultDate,
            priority: priority || 'medium',
        });

        return NextResponse.json({ followUp }, { status: 201 });
    } catch (error) {
        console.error('Error creating follow-up:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update a follow-up (status, snooze, edit message)
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { followUpId, status, subject, message, snoozeDays, scheduledDate } = body;

        if (!followUpId) {
            return NextResponse.json({ error: 'followUpId is required' }, { status: 400 });
        }

        const followUp = await FollowUp.findOne({
            _id: followUpId,
            userId: session.user.id,
        });

        if (!followUp) {
            return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
        }

        // Update fields
        if (status) {
            followUp.status = status;
            if (status === 'sent') {
                followUp.sentAt = new Date();
            }
        }
        if (subject !== undefined) followUp.subject = subject;
        if (message !== undefined) followUp.message = message;
        if (scheduledDate) followUp.scheduledDate = new Date(scheduledDate);
        if (snoozeDays) {
            const newDate = new Date(followUp.scheduledDate);
            newDate.setDate(newDate.getDate() + snoozeDays);
            followUp.scheduledDate = newDate;
            followUp.snoozedUntil = newDate;
            followUp.status = 'pending';
        }
        followUp.updatedAt = new Date();

        await followUp.save();

        return NextResponse.json({ followUp });
    } catch (error) {
        console.error('Error updating follow-up:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a single follow-up OR bulk delete all (with optional status filter)
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const followUpId = searchParams.get('id');
        const deleteAll = searchParams.get('all') === 'true';
        const statusFilter = searchParams.get('status'); // optional: only delete this status

        // ── BULK DELETE ──────────────────────────────────────────────
        if (deleteAll) {
            const query = { userId: session.user.id };
            if (statusFilter && statusFilter !== 'all') {
                query.status = statusFilter;
            }

            const result = await FollowUp.deleteMany(query);

            return NextResponse.json({
                success: true,
                deleted: result.deletedCount,
            });
        }

        // ── SINGLE DELETE ─────────────────────────────────────────────
        if (!followUpId) {
            return NextResponse.json({ error: 'Follow-up ID is required' }, { status: 400 });
        }

        const result = await FollowUp.deleteOne({
            _id: followUpId,
            userId: session.user.id,
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deleted: 1 });
    } catch (error) {
        console.error('Error deleting follow-up:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper: Generate default follow-up message
function generateDefaultFollowUpMessage(hrName, company, jobRole) {
    return `Dear ${hrName},

I hope this message finds you well. I wanted to follow up on my application for ${jobRole} at ${company} that I submitted recently.

I remain very interested in this opportunity and would welcome the chance to discuss how my skills and experience align with the requirements of the role.

Please let me know if you need any additional information from my end.

Thank you for your time and consideration.

Best regards`;
}
