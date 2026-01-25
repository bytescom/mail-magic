import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// GET - Fetch user's stored files (resume and cover letter metadata)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select('resume coverLetter');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return file metadata without the actual data (to keep response small)
        return NextResponse.json({
            resume: user.resume ? {
                filename: user.resume.filename,
                mimeType: user.resume.mimeType,
                size: user.resume.size,
                uploadedAt: user.resume.uploadedAt,
            } : null,
            coverLetter: user.coverLetter ? {
                filename: user.coverLetter.filename,
                mimeType: user.coverLetter.mimeType,
                size: user.coverLetter.size,
                uploadedAt: user.coverLetter.uploadedAt,
            } : null,
        });
    } catch (error) {
        console.error('Error fetching user files:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Upload a file (resume or cover letter)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const type = formData.get('type'); // 'resume' or 'coverLetter'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!type || !['resume', 'coverLetter'].includes(type)) {
            return NextResponse.json({ error: 'Invalid file type. Must be "resume" or "coverLetter"' }, { status: 400 });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only PDF and Word documents are allowed' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');

        await dbConnect();

        const fileData = {
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            data: base64Data,
            uploadedAt: new Date(),
        };

        // Update user with the file
        const updateField = type === 'resume' ? 'resume' : 'coverLetter';
        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                [updateField]: fileData,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return file metadata (without the data)
        return NextResponse.json({
            success: true,
            file: {
                filename: fileData.filename,
                mimeType: fileData.mimeType,
                size: fileData.size,
                uploadedAt: fileData.uploadedAt,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a file (resume or cover letter)
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'resume' or 'coverLetter'

        if (!type || !['resume', 'coverLetter'].includes(type)) {
            return NextResponse.json({ error: 'Invalid file type. Must be "resume" or "coverLetter"' }, { status: 400 });
        }

        await dbConnect();

        // Remove the file from user document
        const updateField = type === 'resume' ? 'resume' : 'coverLetter';
        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                $unset: { [updateField]: 1 },
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `${type === 'resume' ? 'Resume' : 'Cover letter'} deleted successfully`,
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
