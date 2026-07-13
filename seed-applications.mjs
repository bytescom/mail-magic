import { connect } from 'mongoose';
import 'dotenv/config';
import Application from './models/Application.js';
import ActivityLog from './models/ActivityLog.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

async function seed() {
    try {
        await connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // We need a user ID. Let's find one or use a dummy.
        // Assuming we have a dummy userId for now or we just hardcode an ObjectId.
        const mongoose = await import('mongoose');
        const dummyUserId = new mongoose.default.Types.ObjectId('699f2b5a95b23d7e466f1594'); 
        // This userId matches the dev server log user ID.

        // Clean existing mock data for tracking
        await Application.deleteMany({ userId: dummyUserId });
        await ActivityLog.deleteMany({}); // Delete all logs for simplicity

        console.log('Cleared existing mock data');

        const apps = [
            {
                userId: dummyUserId,
                companyName: 'Google',
                role: 'Software Engineer',
                hrName: 'Sarah Jenkins',
                hrEmail: 'careers@google.com',
                status: 'replied',
                replyType: 'interview',
                lastReplyPreview: 'We would like to schedule an interview...',
                followUpCount: 0,
                notes: 'Applied through referral.',
            },
            {
                userId: dummyUserId,
                companyName: 'Amazon',
                role: 'SDE II',
                hrName: 'Mike Ross',
                hrEmail: 'recruiting@amazon.com',
                status: 'follow-up-sent',
                followUpCount: 1,
                followUpDate: new Date(),
                notes: '',
            },
            {
                userId: dummyUserId,
                companyName: 'Meta',
                role: 'Frontend Engineer',
                hrName: 'Jane Doe',
                hrEmail: 'jobs@meta.com',
                status: 'interview',
                replyType: 'interview',
                lastReplyPreview: 'Next round scheduled for Friday.',
                followUpCount: 0,
            },
            {
                userId: dummyUserId,
                companyName: 'Apple',
                role: 'Backend Engineer',
                hrName: 'Tim Cook',
                hrEmail: 'hr@apple.com',
                status: 'rejected',
                replyType: 'negative',
                lastReplyPreview: 'Thank you for your interest.',
            },
            {
                userId: dummyUserId,
                companyName: 'Netflix',
                role: 'Senior Engineer',
                hrName: 'Reed H.',
                hrEmail: 'careers@netflix.com',
                status: 'sent',
                followUpCount: 0,
            }
        ];

        const createdApps = await Application.insertMany(apps);
        console.log(`Inserted ${createdApps.length} applications`);

        for (const app of createdApps) {
            const logs = [
                {
                    applicationId: app._id,
                    type: 'SYSTEM',
                    title: 'Application Created',
                    description: `Added to tracking for ${app.companyName}`,
                    icon: 'FiCheckCircle',
                },
                {
                    applicationId: app._id,
                    type: 'EMAIL',
                    title: 'Email Sent',
                    description: `Primary outreach sent to ${app.hrEmail}`,
                    icon: 'FiSend',
                }
            ];

            if (app.status === 'replied' || app.status === 'interview') {
                logs.push({
                    applicationId: app._id,
                    type: 'REPLY',
                    title: 'Reply Received',
                    description: app.lastReplyPreview,
                    icon: 'FiMessageCircle',
                });
            }

            if (app.status === 'follow-up-sent') {
                logs.push({
                    applicationId: app._id,
                    type: 'EMAIL',
                    title: 'Follow-up #1 Sent',
                    description: 'Automated follow-up delivered.',
                    icon: 'FiRepeat',
                });
            }

            await ActivityLog.insertMany(logs);
        }

        console.log('Inserted activity logs');
        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seed();
