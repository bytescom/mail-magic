import mongoose from 'mongoose';

const HrEmailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
    },
    hrName: {
        type: String,
        default: '',
    },
    company: {
        type: String,
        default: '',
    },
    jobRole: {
        type: String,
        default: '',
    },
    tags: [{
        type: String,
    }],
    notes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'contacted', 'responded', 'archived'],
        default: 'active',
    },
    lastContacted: {
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

// Compound index for user and email uniqueness
HrEmailSchema.index({ userId: 1, email: 1 }, { unique: true });

export default mongoose.models.HrEmail || mongoose.model('HrEmail', HrEmailSchema);
