import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            emailDelay: user.settings?.emailDelay || 3000,
            autoAttachResume: user.settings?.autoAttachResume ?? true,
            theme: user.settings?.theme || 'light',
            portfolioLink: user.portfolioLink || '',
            yourName: user.name || '',
            maxFollowUps: user.settings?.maxFollowUps ?? 1,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { emailDelay, autoAttachResume, theme, portfolioLink, yourName, maxFollowUps } = body;

        await dbConnect();

        const updateData = {
            'settings.emailDelay': emailDelay,
            'settings.autoAttachResume': autoAttachResume,
            'settings.theme': theme,
            'portfolioLink': portfolioLink,
            'name': yourName,
            'settings.maxFollowUps': maxFollowUps ?? 1,
            updatedAt: new Date(),
        };

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
