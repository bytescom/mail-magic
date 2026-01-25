import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });

        if (!user || !user.resume) {
            return NextResponse.json({ resume: null });
        }

        return NextResponse.json({
            resume: {
                filename: user.resume.filename,
                mimeType: user.resume.mimeType,
                size: user.resume.size,
                uploadedAt: user.resume.uploadedAt,
            },
        });
    } catch (error) {
        console.error('Error fetching resume:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type (PDF only for now)
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');

        await dbConnect();

        // Update user with resume
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                resume: {
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    data: base64Data,
                    uploadedAt: new Date(),
                },
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            resume: {
                filename: user.resume.filename,
                mimeType: user.resume.mimeType,
                size: user.resume.size,
                uploadedAt: user.resume.uploadedAt,
            },
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $unset: { resume: '' },
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
