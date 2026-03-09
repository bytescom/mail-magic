import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import { NextResponse } from 'next/server';

// GET /api/applications — list all applications with optional filters
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');       // filter by status
        const replyType = searchParams.get('replyType'); // filter by reply type
        const limit = parseInt(searchParams.get('limit') || '100');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        // Build query
        const query = { userId: session.user.id };
        if (status && status !== 'all') query.status = status;
        if (replyType && replyType !== 'all') query.replyType = replyType;

        const [applications, total] = await Promise.all([
            Application.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Application.countDocuments(query),
        ]);

        // Generate pipeline stats summary
        const stats = await Application.aggregate([
            { $match: { userId: new (await import('mongoose')).default.Types.ObjectId(session.user.id) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const statsMap = {
            total: 0,
            sent: 0,
            'follow-up-sent': 0,
            replied: 0,
            interview: 0,
            rejected: 0,
            closed: 0,
            pendingFollowUp: 0,
        };

        stats.forEach(s => {
            statsMap[s._id] = s.count;
            statsMap.total += s.count;
        });

        // Count pending follow-ups (due today or overdue)
        statsMap.pendingFollowUp = await Application.countDocuments({
            userId: session.user.id,
            status: 'sent',
            followUpDate: { $lte: new Date() },
            followUpCount: { $lt: 2 },
        });

        return NextResponse.json({
            applications,
            stats: statsMap,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/applications — manually create an application (rare, usually auto-created on send)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const body = await request.json();
        const { companyName, role, hrName, hrEmail, notes } = body;

        if (!hrEmail) {
            return NextResponse.json({ error: 'hrEmail is required' }, { status: 400 });
        }

        const application = await Application.create({
            userId: session.user.id,
            companyName: companyName || '',
            role: role || '',
            hrName: hrName || '',
            hrEmail,
            notes: notes || '',
            status: 'draft',
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (error) {
        console.error('Error creating application:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
