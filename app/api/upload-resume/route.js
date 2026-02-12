import { put, del } from '@vercel/blob';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request) {
    try {
        console.log('📄 Resume upload request received');

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
            }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only PDF and DOC/DOCX files are allowed.'
            }, { status: 400 });
        }

        console.log(`📦 File details: ${file.name} (${file.size} bytes, ${file.type})`);

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete old resume from Blob storage if exists
        if (user.resume?.url) {
            try {
                console.log('🗑️ Deleting old resume from Blob storage');
                await del(user.resume.url);
            } catch (err) {
                console.log('⚠️ Old file not found or already deleted');
            }
        }

        // Upload to Vercel Blob
        console.log('☁️ Uploading to Vercel Blob...');
        const blob = await put(`resumes/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        console.log('✅ Uploaded to Blob:', blob.url);

        // Update user in database with URL only (not the file!)
        user.resume = {
            url: blob.url,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
        };
        await user.save();

        console.log('💾 Database updated with resume URL');

        return NextResponse.json({
            success: true,
            message: 'Resume uploaded successfully',
            resume: {
                url: blob.url,
                filename: file.name,
                size: file.size,
            },
        });

    } catch (error) {
        console.error('❌ Resume upload error:', error);
        return NextResponse.json({
            error: 'Upload failed. Please try again.'
        }, { status: 500 });
    }
}

// Get current resume info
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('resume');

        return NextResponse.json({
            resume: user.resume || null,
        });

    } catch (error) {
        console.error('Error fetching resume:', error);
        return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
    }
}

// Delete resume
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (user.resume?.url) {
            try {
                await del(user.resume.url);
            } catch (err) {
                console.log('File already deleted or not found');
            }
        }

        user.resume = undefined;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Resume deleted successfully',
        });

    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
    }
}
