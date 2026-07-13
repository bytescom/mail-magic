import mongoose from 'mongoose';

const EmailTemplateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    variables: [{
        type: String,
    }],
    isDefault: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        enum: ['Cold Outreach', 'Follow-up', 'Newsletter', 'Transactional', 'Event Invite', 'Product Update'],
        default: 'Cold Outreach',
    },
    usageCount: {
        type: Number,
        default: 0,
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

// Index for faster queries
EmailTemplateSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema);
