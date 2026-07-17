import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import Application from '@/models/Application';
import ActivityLog from '@/models/ActivityLog';
import { connectDB } from '@/lib/db';

export async function DELETE(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = user._id;

        // Delete all applications and their activity logs
        const apps = await Application.find({ userId }).select('_id').lean();
        const appIds = apps.map(a => a._id);
        
        await ActivityLog.deleteMany({ applicationId: { $in: appIds } });
        await Application.deleteMany({ userId });

        return NextResponse.json({ success: true, message: 'Workspace data cleared.' });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
