import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmailTemplate from '@/models/EmailTemplate';
import HrEmail from '@/models/HrEmail';
import EmailLog from '@/models/EmailLog';
import mongoose from 'mongoose';

export async function GET() {
    try {
        console.log('🔍 Starting comprehensive system check...');

        // 1. Test MongoDB Connection
        await dbConnect();
        const connectionState = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

        console.log(`✅ MongoDB: ${states[connectionState]}`);

        // 2. Check Environment Variables
        const envCheck = {
            NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
            NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
            GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
            MONGODB_URI: !!process.env.MONGODB_URI,
        };

        console.log('🔐 Environment Variables:', envCheck);

        // 3. Check Database Collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`📚 Collections: ${collectionNames.join(', ')}`);

        // 4. Test Each Model
        const modelTests = {};

        // Test User Model
        try {
            const userCount = await User.countDocuments();
            console.log(`👤 Users collection: ${userCount} documents`);

            // Get sample user (without sensitive data)
            const sampleUser = await User.findOne().select('name email createdAt').lean();

            modelTests.User = {
                status: 'OK',
                count: userCount,
                sample: sampleUser ? {
                    name: sampleUser.name,
                    email: sampleUser.email?.replace(/(.{3}).*(@.*)/, '$1***$2'), // Mask email
                    createdAt: sampleUser.createdAt
                } : null
            };
        } catch (error) {
            modelTests.User = { status: 'ERROR', message: error.message };
        }

        // Test EmailTemplate Model
        try {
            const templateCount = await EmailTemplate.countDocuments();
            console.log(`📝 EmailTemplates collection: ${templateCount} documents`);

            const sampleTemplate = await EmailTemplate.findOne().select('name createdAt').lean();

            modelTests.EmailTemplate = {
                status: 'OK',
                count: templateCount,
                sample: sampleTemplate
            };
        } catch (error) {
            modelTests.EmailTemplate = { status: 'ERROR', message: error.message };
        }

        // Test HrEmail Model
        try {
            const hrEmailCount = await HrEmail.countDocuments();
            console.log(`📧 HrEmails collection: ${hrEmailCount} documents`);

            const sampleHrEmail = await HrEmail.findOne().select('company jobRole createdAt').lean();

            modelTests.HrEmail = {
                status: 'OK',
                count: hrEmailCount,
                sample: sampleHrEmail
            };
        } catch (error) {
            modelTests.HrEmail = { status: 'ERROR', message: error.message };
        }

        // Test EmailLog Model
        try {
            const logCount = await EmailLog.countDocuments();
            console.log(`📋 EmailLogs collection: ${logCount} documents`);

            const sampleLog = await EmailLog.findOne().select('status sentAt createdAt').lean();

            modelTests.EmailLog = {
                status: 'OK',
                count: logCount,
                sample: sampleLog
            };
        } catch (error) {
            modelTests.EmailLog = { status: 'ERROR', message: error.message };
        }

        // 5. Check Indexes
        const indexes = {};
        try {
            indexes.User = await User.collection.getIndexes();
            indexes.EmailTemplate = await EmailTemplate.collection.getIndexes();
            indexes.HrEmail = await HrEmail.collection.getIndexes();
            indexes.EmailLog = await EmailLog.collection.getIndexes();
        } catch (error) {
            console.error('Error getting indexes:', error);
        }

        console.log('✅ System check completed successfully!');

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            database: {
                connectionState: states[connectionState],
                databaseName: mongoose.connection.name,
                collections: collectionNames,
            },
            environment: envCheck,
            models: modelTests,
            indexes: Object.keys(indexes),
            oauth: {
                provider: 'Google OAuth',
                configured: envCheck.GOOGLE_CLIENT_ID && envCheck.GOOGLE_CLIENT_SECRET,
                scopes: [
                    'openid',
                    'userinfo.email',
                    'userinfo.profile',
                    'gmail.send',
                    'gmail.readonly'
                ]
            }
        }, { status: 200 });

    } catch (error) {
        console.error('❌ System check failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            errorName: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
