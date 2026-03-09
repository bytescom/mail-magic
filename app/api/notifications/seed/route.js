import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

/**
 * Seed sample notifications for testing
 * DELETE THIS FILE IN PRODUCTION
 */
export async function POST(request) {
    try {
        // 🔒 SECURITY: Seed route is only for development/testing. Block in production.
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create sample notifications
        const sampleNotifications = [
            {
                userId: user._id,
                userEmail: user.email,
                title: 'Campaign Completed',
                message: 'Successfully sent 12 emails to HR managers at top tech companies',
                type: 'campaign',
                icon: 'Send',
                link: '/logs',
                isRead: false,
                createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
            },
            {
                userId: user._id,
                userEmail: user.email,
                title: 'New HR List Synced',
                message: 'Imported 25 new HR contacts from your CSV file',
                type: 'hr_sync',
                icon: 'Users',
                link: '/hr-emails',
                isRead: false,
                createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            },
            {
                userId: user._id,
                userEmail: user.email,
                title: 'Security Protocol Verified',
                message: 'Your Gmail API credentials have been successfully verified',
                type: 'security',
                icon: 'Shield',
                isRead: false,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            },
            {
                userId: user._id,
                userEmail: user.email,
                title: 'Welcome to MailMagic',
                message: 'Start by adding your HR contacts and creating email templates',
                type: 'info',
                icon: 'Bell',
                link: '/dashboard',
                isRead: true,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            },
        ];

        // Clear existing sample notifications for this user
        await Notification.deleteMany({ userId: user._id });

        // Insert sample notifications
        const created = await Notification.insertMany(sampleNotifications);

        return NextResponse.json({
            message: 'Sample notifications created successfully',
            count: created.length,
            notifications: created
        });
    } catch (error) {
        console.error('Error seeding notifications:', error);
        return NextResponse.json(
            { error: 'Failed to seed notifications', details: error.message },
            { status: 500 }
        );
    }
}
