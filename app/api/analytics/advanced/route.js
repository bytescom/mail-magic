import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import EmailLog from '@/models/EmailLog';
import HrEmail from '@/models/HrEmail';
import EmailTemplate from '@/models/EmailTemplate';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = new mongoose.Types.ObjectId(session.user.id);
        const now = new Date();

        // Time ranges
        const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date(now); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const ninetyDaysAgo = new Date(now); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // ═══════════════════════════════════════════════════
        // 1. APPLICATION FUNNEL
        // ═══════════════════════════════════════════════════
        const [totalContacts, contactedCount, respondedCount, totalSent, totalFailed] = await Promise.all([
            HrEmail.countDocuments({ userId }),
            HrEmail.countDocuments({ userId, status: { $in: ['contacted', 'responded'] } }),
            HrEmail.countDocuments({ userId, status: 'responded' }),
            EmailLog.countDocuments({ userId, status: 'sent' }),
            EmailLog.countDocuments({ userId, status: 'failed' }),
        ]);

        const funnel = {
            totalContacts,
            contacted: contactedCount,
            responded: respondedCount,
            deliveryRate: totalSent + totalFailed > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 100) : 0,
            responseRate: contactedCount > 0 ? Math.round((respondedCount / contactedCount) * 100) : 0,
        };

        // ═══════════════════════════════════════════════════
        // 2. RESPONSE RATE OVER TIME (weekly buckets, last 90 days)
        // ═══════════════════════════════════════════════════
        const responseRateOverTime = await EmailLog.aggregate([
            { $match: { userId, status: 'sent', createdAt: { $gte: ninetyDaysAgo } } },
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
                    _id: {
                        week: { $isoWeek: '$createdAt' },
                        year: { $isoWeekYear: '$createdAt' },
                    },
                    totalSent: { $sum: 1 },
                    responded: {
                        $sum: { $cond: [{ $eq: ['$hrEmail.status', 'responded'] }, 1, 0] },
                    },
                    weekStart: { $min: '$createdAt' },
                },
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } },
            { $limit: 12 },
        ]);

        const responseTimeline = responseRateOverTime.map(w => ({
            week: w._id.week,
            year: w._id.year,
            weekStart: w.weekStart,
            totalSent: w.totalSent,
            responded: w.responded,
            rate: w.totalSent > 0 ? Math.round((w.responded / w.totalSent) * 100) : 0,
        }));

        // ═══════════════════════════════════════════════════
        // 3. TEMPLATE PERFORMANCE
        // ═══════════════════════════════════════════════════
        const templatePerformance = await EmailLog.aggregate([
            { $match: { userId, status: 'sent', templateId: { $exists: true, $ne: null } } },
            {
                $lookup: {
                    from: 'emailtemplates',
                    localField: 'templateId',
                    foreignField: '_id',
                    as: 'template',
                },
            },
            { $unwind: { path: '$template', preserveNullAndEmptyArrays: true } },
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
                    _id: '$templateId',
                    templateName: { $first: '$template.name' },
                    totalSent: { $sum: 1 },
                    responded: {
                        $sum: { $cond: [{ $eq: ['$hrEmail.status', 'responded'] }, 1, 0] },
                    },
                    lastUsed: { $max: '$createdAt' },
                },
            },
            {
                $addFields: {
                    responseRate: {
                        $cond: [
                            { $gt: ['$totalSent', 0] },
                            { $round: [{ $multiply: [{ $divide: ['$responded', '$totalSent'] }, 100] }, 0] },
                            0,
                        ],
                    },
                },
            },
            { $sort: { totalSent: -1 } },
            { $limit: 10 },
        ]);

        // ═══════════════════════════════════════════════════
        // 4. ROLE PERFORMANCE (response rates per role)
        // ═══════════════════════════════════════════════════
        const rolePerformance = await EmailLog.aggregate([
            { $match: { userId, status: 'sent' } },
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
                    responded: {
                        $sum: { $cond: [{ $eq: ['$hrEmail.status', 'responded'] }, 1, 0] },
                    },
                    companies: { $addToSet: '$hrEmail.company' },
                },
            },
            {
                $addFields: {
                    responseRate: {
                        $cond: [
                            { $gt: ['$totalSent', 0] },
                            { $round: [{ $multiply: [{ $divide: ['$responded', '$totalSent'] }, 100] }, 0] },
                            0,
                        ],
                    },
                    companyCount: { $size: { $filter: { input: '$companies', cond: { $ne: ['$$this', ''] } } } },
                },
            },
            { $sort: { totalSent: -1 } },
            { $limit: 8 },
        ]);

        // ═══════════════════════════════════════════════════
        // 5. PEAK ACTIVITY (applications by day of week)
        // ═══════════════════════════════════════════════════
        const dayOfWeekActivity = await EmailLog.aggregate([
            { $match: { userId, status: 'sent', createdAt: { $gte: ninetyDaysAgo } } },
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' }, // 1=Sunday, 7=Saturday
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const peakActivity = dayNames.map((name, i) => {
            const data = dayOfWeekActivity.find(d => d._id === i + 1);
            return { day: name, count: data?.count || 0 };
        });

        // ═══════════════════════════════════════════════════
        // 6. HOUR OF DAY DISTRIBUTION
        // ═══════════════════════════════════════════════════
        const hourActivity = await EmailLog.aggregate([
            { $match: { userId, status: 'sent', createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const hourDistribution = Array.from({ length: 24 }, (_, i) => {
            const data = hourActivity.find(h => h._id === i);
            return { hour: i, label: `${i.toString().padStart(2, '0')}:00`, count: data?.count || 0 };
        });

        // ═══════════════════════════════════════════════════
        // 7. MONTHLY TREND (last 6 months)
        // ═══════════════════════════════════════════════════
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await EmailLog.aggregate([
            { $match: { userId, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                    failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                    total: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = monthlyTrend.map(m => ({
            month: monthNames[m._id.month - 1],
            year: m._id.year,
            sent: m.sent,
            failed: m.failed,
            total: m.total,
        }));

        // ═══════════════════════════════════════════════════
        // 8. COMPANY ENGAGEMENT DEPTH
        // ═══════════════════════════════════════════════════
        const companyEngagement = await EmailLog.aggregate([
            { $match: { userId, status: 'sent' } },
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
                    totalSent: { $sum: 1 },
                    contacts: { $addToSet: '$hrEmail.email' },
                    responded: {
                        $sum: { $cond: [{ $eq: ['$hrEmail.status', 'responded'] }, 1, 0] },
                    },
                    lastContact: { $max: '$createdAt' },
                },
            },
            {
                $addFields: {
                    contactCount: { $size: '$contacts' },
                    responseRate: {
                        $cond: [
                            { $gt: ['$totalSent', 0] },
                            { $round: [{ $multiply: [{ $divide: ['$responded', '$totalSent'] }, 100] }, 0] },
                            0,
                        ],
                    },
                },
            },
            { $sort: { totalSent: -1 } },
            { $limit: 10 },
        ]);

        // ═══════════════════════════════════════════════════
        // 9. PERIOD COMPARISON (this 30d vs prev 30d)
        // ═══════════════════════════════════════════════════
        const [currentPeriod, previousPeriod] = await Promise.all([
            EmailLog.countDocuments({ userId, status: 'sent', createdAt: { $gte: thirtyDaysAgo } }),
            EmailLog.countDocuments({ userId, status: 'sent', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
        ]);

        const periodComparison = {
            current: currentPeriod,
            previous: previousPeriod,
            change: previousPeriod > 0
                ? Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100)
                : (currentPeriod > 0 ? 100 : 0),
            trend: currentPeriod >= previousPeriod ? 'up' : 'down',
        };

        return NextResponse.json({
            funnel,
            responseTimeline,
            templatePerformance,
            rolePerformance,
            peakActivity,
            hourDistribution,
            monthlyData,
            companyEngagement,
            periodComparison,
        });

    } catch (error) {
        console.error('Error generating advanced analytics:', error);
        return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
    }
}
