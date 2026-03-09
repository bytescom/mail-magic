import mongoose from 'mongoose';

const CoverLetterTemplateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['tech', 'finance', 'marketing', 'design', 'management', 'general', 'startup', 'consulting'],
        default: 'general',
    },
    targetRole: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    content: {
        type: String,
        required: true,
    },
    variables: [{
        type: String,
    }],
    isSystem: {
        type: Boolean,
        default: false,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    responseCount: {
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

CoverLetterTemplateSchema.index({ isSystem: 1, category: 1 });
CoverLetterTemplateSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.CoverLetterTemplate || mongoose.model('CoverLetterTemplate', CoverLetterTemplateSchema);
