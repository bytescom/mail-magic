import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');
        const skip = parseInt(searchParams.get('skip') || '0');

        await dbConnect();

        const query = { userId: session.user.id };
        if (status) {
            query.status = status;
        }

        const logs = await EmailLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('templateId', 'name')
            .populate('hrEmailId', 'email hrName company');

        const total = await EmailLog.countDocuments(query);

        return NextResponse.json({
            logs,
            total,
            hasMore: total > skip + logs.length,
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
