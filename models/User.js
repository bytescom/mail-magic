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
    // REDESIGNED: Unified Documents Library (replaces separate resume/coverLetter)
    documents: [{
        url: String,
        filename: String,
        mimeType: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
    }],
    // Backward compatibility - keep old fields (deprecated)
    resumes: [{
        url: String,
        filename: String,
        mimeType: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
    }],
    coverLetters: [{
        url: String,
        filename: String,
        mimeType: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
    }],
    resume: {
        url: String,
        filename: String,
        mimeType: String,
        size: Number,
        uploadedAt: Date,
    },
    coverLetter: {
        url: String,
        filename: String,
        mimeType: String,
        size: Number,
        uploadedAt: Date,
    },
    // User preferences
    settings: {
        emailDelay: {
            type: Number,
            default: 3000,
        },
        theme: {
            type: String,
            default: 'dark',
        },
        autoAttachResume: {
            type: Boolean,
            default: true,
        },
        // Profile enrichment fields used in AI email generation
        headline: {
            type: String,
            default: '',
        },
        portfolioLink: {
            type: String,
            default: '',
        },
        experienceSummary: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
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
