import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
            index: true,
        },
        type: {
            type: String, // 'TIMELINE', 'NOTE', 'EMAIL', 'REPLY', 'STATUS_CHANGE', 'SYSTEM'
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        icon: {
            type: String, // E.g., 'FiMail', 'FiCheckCircle', 'FiMessageCircle'
            default: 'FiCheckCircle',
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

ActivityLogSchema.index({ applicationId: 1, createdAt: -1 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
