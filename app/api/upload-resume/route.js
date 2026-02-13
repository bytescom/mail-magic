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

        // Upload to Vercel Blob
        console.log('☁️ Uploading to Vercel Blob...');
        const blob = await put(`resumes/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        console.log('✅ Uploaded to Blob:', blob.url);

        // Add to resumes array (NEW: Support multiple resumes)
        const newResume = {
            url: blob.url,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
        };

        // Initialize resumes array if it doesn't exist
        if (!user.resumes) {
            user.resumes = [];
        }

        // Add new resume to array
        user.resumes.push(newResume);

        // Also update the old single resume field for backward compatibility
        user.resume = newResume;

        await user.save();

        console.log('💾 Database updated - Resume added to array');

        // Return the new resume with its MongoDB _id
        // Refresh the user to get the populated resumes array
        const savedUser = await User.findById(session.user.id).select('resumes');

        // Get the last added resume (the one we just added)
        const resumesArray = savedUser.resumes || [];
        const addedResume = resumesArray[resumesArray.length - 1];

        if (!addedResume) {
            // Fallback: return without _id
            return NextResponse.json({
                success: true,
                message: 'Resume uploaded successfully',
                resume: {
                    url: blob.url,
                    filename: file.name,
                    size: file.size,
                    uploadedAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Resume uploaded successfully',
            resume: {
                _id: addedResume._id,
                url: addedResume.url,
                filename: addedResume.filename,
                size: addedResume.size,
                uploadedAt: addedResume.uploadedAt,
            },
        });

    } catch (error) {
        console.error('❌ Resume upload error:', error);
        return NextResponse.json({
            error: 'Upload failed. Please try again.'
        }, { status: 500 });
    }
}

// Get all resumes
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('resumes resume');

        // Return array of resumes (new system) with backward compatibility
        const resumes = user.resumes || (user.resume ? [user.resume] : []);

        return NextResponse.json({
            resumes,
            // Backward compatibility: also return single resume
            resume: user.resume || (resumes.length > 0 ? resumes[0] : null),
        });

    } catch (error) {
        console.error('Error fetching resumes:', error);
        return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
    }
}

// Delete specific resume by ID
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { resumeId } = body;

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the resume to delete
        let resumeToDelete = null;

        if (user.resumes && user.resumes.length > 0) {
            resumeToDelete = user.resumes.find(r =>
                r._id?.toString() === resumeId || r.filename === resumeId
            );
        }

        // Fallback to old single resume field
        if (!resumeToDelete && user.resume && (user.resume._id?.toString() === resumeId || user.resume.filename === resumeId)) {
            resumeToDelete = user.resume;
        }

        if (!resumeToDelete) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Delete from Blob storage
        if (resumeToDelete.url) {
            try {
                console.log('🗑️ Deleting from Blob:', resumeToDelete.url);
                await del(resumeToDelete.url);
            } catch (err) {
                console.log('⚠️ File not found in Blob or already deleted');
            }
        }

        // Remove from resumes array
        if (user.resumes && user.resumes.length > 0) {
            user.resumes = user.resumes.filter(r =>
                r._id?.toString() !== resumeId && r.filename !== resumeId
            );
        }

        // If deleting the single resume field
        if (user.resume && (user.resume._id?.toString() === resumeId || user.resume.filename === resumeId)) {
            user.resume = undefined;
        }

        await user.save();

        console.log('✅ Resume deleted successfully');

        return NextResponse.json({
            success: true,
            message: 'Resume deleted successfully',
        });

    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
    }
}
