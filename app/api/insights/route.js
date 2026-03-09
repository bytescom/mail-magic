import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import HrEmail from '@/models/HrEmail';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = new mongoose.Types.ObjectId(session.user.id);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Best performing job roles (roles with most sent emails)
        const rolePerformance = await EmailLog.aggregate([
            {
                $match: {
                    userId,
                    status: 'sent',
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $lookup: {
                    from: 'hremails',
                    localField: 'hrEmailId',
                    foreignField: '_id',
                    as: 'hrEmail',
                },
            },
            { $unwind: { path: '$hrEmail', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$hrEmail.jobRole', 'Unspecified'] },
                    totalSent: { $sum: 1 },
                    companies: { $addToSet: '$hrEmail.company' },
                    lastSent: { $max: '$createdAt' },
                },
            },
            { $sort: { totalSent: -1 } },
            { $limit: 5 },
        ]);

        // 2. Response trends (sent vs failed over time - last 30 days by week)
        const responseTrends = await EmailLog.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        week: { $isoWeek: '$createdAt' },
                        year: { $isoWeekYear: '$createdAt' },
                    },
                    sent: {
                        $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] },
                    },
                    failed: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
                    },
                    total: { $sum: 1 },
                    startDate: { $min: '$createdAt' },
                },
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } },
        ]);

        // 3. Inactive applications (contacts applied to but never followed up, older than 7 days)
        const inactiveApplications = await EmailLog.aggregate([
            {
                $match: {
                    userId,
                    status: 'sent',
                    createdAt: { $lte: sevenDaysAgo },
                },
            },
            {
                $lookup: {
                    from: 'hremails',
                    localField: 'hrEmailId',
                    foreignField: '_id',
                    as: 'hrEmail',
                },
            },
            { $unwind: { path: '$hrEmail', preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    'hrEmail.status': { $nin: ['responded'] },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: '$hrEmailId',
                    recipient: { $first: '$recipient' },
                    company: { $first: '$hrEmail.company' },
                    jobRole: { $first: '$hrEmail.jobRole' },
                    hrName: { $first: '$hrEmail.hrName' },
                    lastSentAt: { $first: '$createdAt' },
                    emailLogId: { $first: '$_id' },
                    totalEmails: { $sum: 1 },
                },
            },
            { $sort: { lastSentAt: 1 } }, // Oldest first - these need action
            { $limit: 10 },
        ]);

        // 4. Overall stats for insights
        const [totalSent, totalFailed, totalHrContacts] = await Promise.all([
            EmailLog.countDocuments({ userId, status: 'sent' }),
            EmailLog.countDocuments({ userId, status: 'failed' }),
            HrEmail.countDocuments({ userId }),
        ]);

        const respondedContacts = await HrEmail.countDocuments({
            userId,
            status: 'responded',
        });

        // 5. Company distribution
        const companyDistribution = await EmailLog.aggregate([
            {
                $match: {
                    userId,
                    status: 'sent',
                },
            },
            {
                $lookup: {
                    from: 'hremails',
                    localField: 'hrEmailId',
                    foreignField: '_id',
                    as: 'hrEmail',
                },
            },
            { $unwind: { path: '$hrEmail', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$hrEmail.company', 'Unknown'] },
                    count: { $sum: 1 },
                    lastSent: { $max: '$createdAt' },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);

        // 6. Daily activity (last 7 days)
        const dailyActivity = await EmailLog.aggregate([
            {
                $match: {
                    userId,
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
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing days
        const filledDaily = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const existing = dailyActivity.find(d => d._id === dateStr);
            filledDaily.push({
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                sent: existing?.sent || 0,
                failed: existing?.failed || 0,
            });
        }

        return NextResponse.json({
            rolePerformance,
            responseTrends,
            inactiveApplications,
            companyDistribution,
            dailyActivity: filledDaily,
            stats: {
                totalSent,
                totalFailed,
                totalHrContacts,
                respondedContacts,
                successRate: totalSent + totalFailed > 0
                    ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)
                    : 0,
                responseRate: totalSent > 0
                    ? ((respondedContacts / totalSent) * 100).toFixed(1)
                    : 0,
            },
        });
    } catch (error) {
        console.error('Error fetching insights:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
