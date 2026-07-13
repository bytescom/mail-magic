import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Application from '../../../../models/Application';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        
        // Pagination
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 15;
        const skip = (page - 1) * limit;

        // Filters
        const tab = searchParams.get('tab') || 'ALL';
        const search = searchParams.get('search') || '';
        
        let query = { userId };

        // Apply Tab Filter
        if (tab !== 'ALL') {
            const statusMap = {
                'SENT': 'sent',
                'FOLLOW-UP SENT': 'follow-up-sent',
                'REPLIED': 'replied',
                'INTERVIEW': 'interview',
                'REJECTED': 'rejected',
                'CLOSED': 'closed'
            };
            if (statusMap[tab]) {
                query.status = statusMap[tab];
            } else if (tab === 'FOLLOW-UP SENT') {
                query.followUpCount = { $gt: 0 };
            }
        }

        // Apply Search
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
                { hrEmail: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute queries
        const totalItems = await Application.countDocuments(query);
        const applications = await Application.find(query)
            .sort({ lastActionDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate Metrics
        const metricsRaw = await Application.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const followUpsCount = await Application.countDocuments({ userId, followUpCount: { $gt: 0 } });
        
        const metrics = {
            total: 0, sent: 0, followUps: followUpsCount, replied: 0, interviews: 0, rejected: 0, closed: 0
        };

        metricsRaw.forEach(m => {
            metrics.total += m.count;
            if (m._id === 'sent') metrics.sent = m.count;
            if (m._id === 'replied') metrics.replied = m.count;
            if (m._id === 'interview') metrics.interviews = m.count;
            if (m._id === 'rejected') metrics.rejected = m.count;
            if (m._id === 'closed') metrics.closed = m.count;
            if (m._id === 'follow-up-sent') metrics.sent += m.count; // Follow ups are originally sent
        });

        // Format data to match UI expectations
        const formattedApps = applications.map(app => {
            const statusMap = {
                'draft': 'Draft',
                'sent': 'Sent',
                'follow-up-sent': 'Sent', // Follow up sent is still "Sent" status with a followUpCount
                'replied': 'Replied',
                'interview': 'Interview',
                'rejected': 'Rejected',
                'closed': 'Closed'
            };

            return {
                id: app._id.toString(),
                company: app.companyName || 'Unknown',
                role: app.role || 'General Application',
                letter: (app.companyName || 'U').charAt(0).toUpperCase(),
                hrEmail: app.hrEmail,
                hrName: app.hrName || '—',
                status: statusMap[app.status] || 'Sent',
                reply: app.lastReplyPreview || '—',
                sentDate: new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                sentRelative: 'Recently', // You could use a proper relative time library here
                followUpDate: app.followUpDate ? new Date(app.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
                followUpCount: app.followUpCount > 0 ? `#${app.followUpCount}` : ''
            };
        });

        return NextResponse.json({
            data: formattedApps,
            metrics,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching tracking applications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
