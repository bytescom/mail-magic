import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import Application from '@/models/Application';
import { connectDB } from '@/lib/db';

export async function GET(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email }).lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = user._id;

        // Aggregate application status counts
        const appStats = await Application.aggregate([
            { $match: { userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const totalApps = await Application.countDocuments({ userId });
        const followUpsCount = await Application.countDocuments({ userId, followUpCount: { $gt: 0 } });

        const statusMap = { sent: 0, 'follow-up-sent': 0, replied: 0, interview: 0, rejected: 0, closed: 0 };
        appStats.forEach(s => {
            if (statusMap[s._id] !== undefined) statusMap[s._id] = s.count;
        });

        // Document counts
        const docsCount = (user.documents || []).length + (user.resumes || []).length + (user.coverLetters || []).length;

        const stats = {
            totalApplications: totalApps,
            sent: statusMap['sent'] + statusMap['follow-up-sent'],
            replied: statusMap['replied'],
            interviews: statusMap['interview'],
            rejected: statusMap['rejected'],
            closed: statusMap['closed'],
            followUps: followUpsCount,
            documentsUploaded: docsCount,
            // Mocked quotas — replace with Redis later
            aiGenerationsUsed: 124,
            aiGenerationsLimit: 1000,
            emailsSentToday: statusMap['sent'],
            dailyEmailLimit: 100,
            emailsSentThisWeek: Math.min(totalApps, 500),
            weeklyEmailLimit: 500,
            geminiTokensUsed: 185420,
            geminiTokensLimit: 1000000,
        };

        return NextResponse.json({ data: stats });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
