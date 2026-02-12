import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import HrEmail from '@/models/HrEmail';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const hrEmail = await HrEmail.findOne({
            _id: id,
            userId: session.user.id,
        });

        if (!hrEmail) {
            return NextResponse.json({ error: 'HR email not found' }, { status: 404 });
        }

        return NextResponse.json(hrEmail);
    } catch (error) {
        console.error('Error fetching HR email:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate email format if email is being updated
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
            }
            body.email = body.email.toLowerCase();
        }

        await dbConnect();

        // Check for duplicate email if email is being changed
        if (body.email) {
            const existing = await HrEmail.findOne({
                userId: session.user.id,
                email: body.email,
                _id: { $ne: id },
            });

            if (existing) {
                return NextResponse.json({ error: 'This email already exists in your contacts' }, { status: 409 });
            }
        }

        const hrEmail = await HrEmail.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            {
                ...body,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!hrEmail) {
            return NextResponse.json({ error: 'HR email not found' }, { status: 404 });
        }

        return NextResponse.json(hrEmail);
    } catch (error) {
        console.error('Error updating HR email:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const hrEmail = await HrEmail.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        });

        if (!hrEmail) {
            return NextResponse.json({ error: 'HR email not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting HR email:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
