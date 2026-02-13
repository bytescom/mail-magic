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
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
];

// Upload a new document (any type)
export async function POST(request) {
    try {
        console.log('📄 Document upload request received');

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
                error: 'Invalid file type. Only PDF, DOC/DOCX, TXT, and Excel files are allowed.'
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
        const blob = await put(`documents/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        console.log('✅ Uploaded to Blob:', blob.url);

        // Add to documents array
        const newDocument = {
            url: blob.url,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
        };

        // Initialize documents array if it doesn't exist
        if (!user.documents) {
            user.documents = [];
        }

        // Add new document to array
        user.documents.push(newDocument);
        await user.save();

        console.log('💾 Database updated - Document added to array');

        // Return the new document with its MongoDB _id
        const savedUser = await User.findById(session.user.id).select('documents');
        const documentsArray = savedUser.documents || [];
        const addedDocument = documentsArray[documentsArray.length - 1];

        if (!addedDocument) {
            return NextResponse.json({
                success: true,
                message: 'Document uploaded successfully',
                document: {
                    url: blob.url,
                    filename: file.name,
                    size: file.size,
                    mimeType: file.type,
                    uploadedAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Document uploaded successfully',
            document: {
                _id: addedDocument._id.toString(),
                url: addedDocument.url,
                filename: addedDocument.filename,
                size: addedDocument.size,
                mimeType: addedDocument.mimeType,
                uploadedAt: addedDocument.uploadedAt,
            },
        });

    } catch (error) {
        console.error('❌ Document upload error:', error);
        return NextResponse.json({
            error: 'Upload failed. Please try again.'
        }, { status: 500 });
    }
}

// Get all documents
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('documents');

        const documents = user.documents || [];

        return NextResponse.json({
            documents: documents.map(doc => ({
                _id: doc._id.toString(),
                url: doc.url,
                filename: doc.filename,
                size: doc.size,
                mimeType: doc.mimeType,
                uploadedAt: doc.uploadedAt,
            })),
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

// Delete specific document by ID
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { documentId } = body;

        if (!documentId) {
            return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the document to delete
        const documentToDelete = user.documents?.find(d => d._id.toString() === documentId);

        if (!documentToDelete) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Delete from Blob storage
        if (documentToDelete.url) {
            try {
                console.log('🗑️ Deleting from Blob:', documentToDelete.url);
                await del(documentToDelete.url);
            } catch (err) {
                console.log('⚠️ File not found in Blob or already deleted');
            }
        }

        // Remove from documents array
        user.documents = user.documents.filter(d => d._id.toString() !== documentId);
        await user.save();

        console.log('✅ Document deleted successfully');

        return NextResponse.json({
            success: true,
            message: 'Document deleted successfully',
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
