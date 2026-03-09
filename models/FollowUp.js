import mongoose from 'mongoose';

const FollowUpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    emailLogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailLog',
        required: true,
    },
    hrEmailId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HrEmail',
    },
    recipient: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        default: '',
    },
    jobRole: {
        type: String,
        default: '',
    },
    subject: {
        type: String,
        default: 'Follow-up on my application',
    },
    message: {
        type: String,
        default: '',
    },
    scheduledDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'skipped', 'snoozed'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    sentAt: {
        type: Date,
    },
    snoozedUntil: {
        type: Date,
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

// Indexes for efficient queries
FollowUpSchema.index({ userId: 1, status: 1, scheduledDate: 1 });
FollowUpSchema.index({ userId: 1, scheduledDate: 1 });

export default mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);
