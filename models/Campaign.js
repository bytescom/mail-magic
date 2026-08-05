import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Draft', 'Running', 'Scheduled', 'Completed', 'Failed'],
        default: 'Draft',
    },
    senderEmail: {
        type: String,
        default: '',
    },
    // Reference to the EmailTemplate used
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailTemplate',
        default: null,
    },
    templateSnapshot: {
        // Snapshot at time of creation so edits don't break sent campaigns
        name: String,
        subject: String,
        body: String,
    },
    // Array of HrEmail _ids selected as audience
    audienceIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HrEmail',
    }],
    // Simple name/size list for attachments (future: store paths)
    attachments: [{
        name: String,
        size: String,
    }],
    // Progress tracking
    totalRecipients: {
        type: Number,
        default: 0,
    },
    sentCount: {
        type: Number,
        default: 0,
    },
    // Settings
    trackOpens: { type: Boolean, default: true },
    trackReplies: { type: Boolean, default: true },
    stopAfterReply: { type: Boolean, default: true },

    // Timestamps
    launchedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on save (async pattern — Mongoose 7+ compatible)
CampaignSchema.pre('save', async function () {
    this.updatedAt = new Date();
});

CampaignSchema.index({ userId: 1, createdAt: -1 });

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
export default Campaign;
