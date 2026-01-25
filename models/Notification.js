import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
        },
        type: {
            type: String,
            enum: ['campaign', 'hr_sync', 'security', 'system', 'info'],
            default: 'info',
        },
        icon: {
            type: String,
            enum: ['Send', 'Users', 'Shield', 'Bell', 'Info'],
            default: 'Bell',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
