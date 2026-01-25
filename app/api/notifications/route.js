import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function GET(request) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get user
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        const query = { userId: user._id };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const unreadCount = await Notification.countDocuments({
            userId: user._id,
            isRead: false
        });

        return NextResponse.json({
            notifications,
            unreadCount,
            total: notifications.length
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { title, message, type, icon, link } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const notification = await Notification.create({
            userId: user._id,
            userEmail: user.email,
            title,
            message,
            type: type || 'info',
            icon: icon || 'Bell',
            link,
            isRead: false,
        });

        return NextResponse.json({
            notification,
            message: 'Notification created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { notificationId, markAllAsRead } = body;

        if (markAllAsRead) {
            // Mark all notifications as read
            const result = await Notification.updateMany(
                { userId: user._id, isRead: false },
                { isRead: true }
            );

            return NextResponse.json({
                message: 'All notifications marked as read',
                modifiedCount: result.modifiedCount
            });
        }

        if (notificationId) {
            // Mark specific notification as read
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId: user._id },
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }

            return NextResponse.json({
                notification,
                message: 'Notification marked as read'
            });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');
        const deleteAll = searchParams.get('deleteAll') === 'true';

        if (deleteAll) {
            // Delete all read notifications
            const result = await Notification.deleteMany({
                userId: user._id,
                isRead: true
            });

            return NextResponse.json({
                message: 'All read notifications deleted',
                deletedCount: result.deletedCount
            });
        }

        if (notificationId) {
            // Delete specific notification
            const result = await Notification.findOneAndDelete({
                _id: notificationId,
                userId: user._id
            });

            if (!result) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }

            return NextResponse.json({
                message: 'Notification deleted successfully'
            });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
