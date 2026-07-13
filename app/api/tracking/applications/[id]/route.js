import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Application from '../../../../../models/Application';
import ActivityLog from '../../../../../models/ActivityLog';
import User from '../../../../../models/User';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const User = mongoose.models.User || mongoose.model('User');
        const dbUser = await User.findOne({ email: session.user.email });
        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const userId = dbUser._id;
        const { id } = await params;

        const application = await Application.findOne({ _id: id, userId }).lean();
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Fetch timeline and activity logs
        const activityLogs = await ActivityLog.find({ applicationId: id })
            .sort({ createdAt: -1 })
            .lean();

        // Format timeline specifically for the vertical timeline component
        const timeline = activityLogs.map(log => ({
            id: log._id.toString(),
            icon: log.icon,
            title: log.title,
            description: log.description,
            timestamp: new Date(log.createdAt).toLocaleString('en-GB', { 
                day: '2-digit', month: 'short', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            })
        }));

        const statusMap = {
            'draft': 'Draft',
            'sent': 'Sent',
            'follow-up-sent': 'Sent',
            'replied': 'Replied',
            'interview': 'Interview',
            'rejected': 'Rejected',
            'closed': 'Closed'
        };

        const detailedData = {
            id: application._id.toString(),
            company: application.companyName || 'Unknown',
            role: application.role || 'General Application',
            letter: (application.companyName || 'U').charAt(0).toUpperCase(),
            hrName: application.hrName || '—',
            hrEmail: application.hrEmail,
            status: statusMap[application.status] || 'Sent',
            dateCreated: new Date(application.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            lastUpdated: new Date(application.lastActionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            campaignName: 'Q3 Outbound Strategy', // Mocked as it might require another lookup
            campaignStatus: 'Active',
            gmailAccount: session.user.email,
            templateUsed: 'Outreach V2', // Mocked
            followUp: {
                enabled: true,
                total: 4,
                completed: application.followUpCount,
                nextDate: application.followUpDate ? new Date(application.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
            },
            reply: {
                status: application.replyType ? 'Received' : 'No Reply Yet',
                preview: application.lastReplyPreview || '',
                type: application.replyType || ''
            },
            timeline,
            notes: application.notes || ''
        };

        return NextResponse.json({ data: detailedData });
    } catch (error) {
        console.error('Error fetching application details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
