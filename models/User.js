import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
    emailVerified: {
        type: Date,
    },
    // OAuth tokens
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    tokenExpiry: {
        type: Date,
    },
    // Resume file (stored in Vercel Blob)
    resume: {
        url: String,           // Vercel Blob URL (e.g., https://xxx.blob.vercel.com/resume.pdf)
        filename: String,      // Original filename
        mimeType: String,      // MIME type (e.g., application/pdf)
        size: Number,          // File size in bytes
        uploadedAt: Date,      // Upload timestamp
    },
    // Cover Letter file (stored in Vercel Blob)
    coverLetter: {
        url: String,           // Vercel Blob URL
        filename: String,
        mimeType: String,
        size: Number,
        uploadedAt: Date,
    },
    // User preferences
    settings: {
        emailDelay: {
            type: Number,
            default: 3000, // 3 seconds delay between emails
        },
        theme: {
            type: String,
            default: 'dark',
        },
        autoAttachResume: {
            type: Boolean,
            default: true,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
