import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Company & Role Info
        companyName: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            default: '',
        },
        hrName: {
            type: String,
            default: '',
        },
        hrEmail: {
            type: String,
            required: true,
        },
        // Linked records
        emailLogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EmailLog',
        },
        hrEmailId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HrEmail',
        },
        // Gmail tracking
        gmailThreadId: {
            type: String,
            index: true,
        },
        lastEmailId: {
            type: String,
        },
        // Application Status Lifecycle
        // Draft → Sent → Replied → Interview → Rejected → Closed
        // follow-up-sent is a temporary overlay state
        status: {
            type: String,
            enum: ['draft', 'sent', 'follow-up-sent', 'replied', 'interview', 'rejected', 'closed'],
            default: 'sent',
            index: true,
        },
        // AI-classified reply type
        replyType: {
            type: String,
            enum: ['positive', 'negative', 'interview', 'neutral', null],
            default: null,
        },
        // AI classification confidence
        replyConfidence: {
            type: Number,
            default: null,
        },
        // The actual reply preview text
        lastReplyPreview: {
            type: String,
            default: null,
        },
        // Follow-up automation
        followUpDate: {
            type: Date,
            default: null,
        },
        followUpCount: {
            type: Number,
            default: 0,
        },
        // Last action timestamp (used for staleness tracking)
        lastActionDate: {
            type: Date,
            default: Date.now,
        },
        // Notes (user can manually add context)
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

// Compound indexes for efficient dashboard queries
ApplicationSchema.index({ userId: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ userId: 1, followUpDate: 1, status: 1 });
ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ gmailThreadId: 1 }, { sparse: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
