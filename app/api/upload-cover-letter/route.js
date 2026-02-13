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
        console.log('📝 Cover letter upload request received');

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
        const blob = await put(`cover-letters/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        console.log('✅ Uploaded to Blob:', blob.url);

        // Add to coverLetters array (NEW: Support multiple cover letters)
        const newCoverLetter = {
            url: blob.url,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
        };

        // Initialize coverLetters array if it doesn't exist
        if (!user.coverLetters) {
            user.coverLetters = [];
        }

        // Add new cover letter to array
        user.coverLetters.push(newCoverLetter);

        // Also update the old single coverLetter field for backward compatibility
        user.coverLetter = newCoverLetter;

        await user.save();

        console.log('💾 Database updated - Cover letter added to array');

        // Return the new cover letter with its MongoDB _id
        // Refresh the user to get the populated coverLetters array
        const savedUser = await User.findById(session.user.id).select('coverLetters');

        // Get the last added cover letter (the one we just added)
        const coverLettersArray = savedUser.coverLetters || [];
        const addedCoverLetter = coverLettersArray[coverLettersArray.length - 1];

        if (!addedCoverLetter) {
            // Fallback: return without _id
            return NextResponse.json({
                success: true,
                message: 'Cover letter uploaded successfully',
                coverLetter: {
                    url: blob.url,
                    filename: file.name,
                    size: file.size,
                    uploadedAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Cover letter uploaded successfully',
            coverLetter: {
                _id: addedCoverLetter._id,
                url: addedCoverLetter.url,
                filename: addedCoverLetter.filename,
                size: addedCoverLetter.size,
                uploadedAt: addedCoverLetter.uploadedAt,
            },
        });

    } catch (error) {
        console.error('❌ Cover letter upload error:', error);
        return NextResponse.json({
            error: 'Upload failed. Please try again.'
        }, { status: 500 });
    }
}

// Get all cover letters
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('coverLetters coverLetter');

        // Return array of cover letters (new system) with backward compatibility
        const coverLetters = user.coverLetters || (user.coverLetter ? [user.coverLetter] : []);

        return NextResponse.json({
            coverLetters,
            // Backward compatibility: also return single cover letter
            coverLetter: user.coverLetter || (coverLetters.length > 0 ? coverLetters[0] : null),
        });

    } catch (error) {
        console.error('Error fetching cover letters:', error);
        return NextResponse.json({ error: 'Failed to fetch cover letters' }, { status: 500 });
    }
}

// Delete specific cover letter by ID
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { coverLetterId } = body;

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the cover letter to delete
        let coverLetterToDelete = null;

        if (user.coverLetters && user.coverLetters.length > 0) {
            coverLetterToDelete = user.coverLetters.find(c =>
                c._id?.toString() === coverLetterId || c.filename === coverLetterId
            );
        }

        // Fallback to old single coverLetter field
        if (!coverLetterToDelete && user.coverLetter && (user.coverLetter._id?.toString() === coverLetterId || user.coverLetter.filename === coverLetterId)) {
            coverLetterToDelete = user.coverLetter;
        }

        if (!coverLetterToDelete) {
            return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
        }

        // Delete from Blob storage
        if (coverLetterToDelete.url) {
            try {
                console.log('🗑️ Deleting from Blob:', coverLetterToDelete.url);
                await del(coverLetterToDelete.url);
            } catch (err) {
                console.log('⚠️ File not found in Blob or already deleted');
            }
        }

        // Remove from coverLetters array
        if (user.coverLetters && user.coverLetters.length > 0) {
            user.coverLetters = user.coverLetters.filter(c =>
                c._id?.toString() !== coverLetterId && c.filename !== coverLetterId
            );
        }

        // If deleting the single coverLetter field
        if (user.coverLetter && (user.coverLetter._id?.toString() === coverLetterId || user.coverLetter.filename === coverLetterId)) {
            user.coverLetter = undefined;
        }

        await user.save();

        console.log('✅ Cover letter deleted successfully');

        return NextResponse.json({
            success: true,
            message: 'Cover letter deleted successfully',
        });

    } catch (error) {
        console.error('Error deleting cover letter:', error);
        return NextResponse.json({ error: 'Failed to delete cover letter' }, { status: 500 });
    }
}
