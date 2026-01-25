import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import HrEmail from '@/models/HrEmail';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const hrEmails = await HrEmail.find({ userId: session.user.id })
            .sort({ createdAt: -1 });

        return NextResponse.json(hrEmails);
    } catch (error) {
        console.error('Error fetching HR emails:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, hrName, company, jobRole, tags, notes } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        await dbConnect();

        // Check for duplicate
        const existing = await HrEmail.findOne({
            userId: session.user.id,
            email: email.toLowerCase(),
        });

        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const hrEmail = await HrEmail.create({
            userId: session.user.id,
            email: email.toLowerCase(),
            hrName: hrName || '',
            company: company || '',
            jobRole: jobRole || '',
            tags: tags || [],
            notes: notes || '',
        });

        return NextResponse.json(hrEmail, { status: 201 });
    } catch (error) {
        console.error('Error creating HR email:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
