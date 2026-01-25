import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import HrEmail from '@/models/HrEmail';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const hrEmail = await HrEmail.findOne({
            _id: params.id,
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

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        await dbConnect();
        const hrEmail = await HrEmail.findOneAndUpdate(
            { _id: params.id, userId: session.user.id },
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

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const hrEmail = await HrEmail.findOneAndDelete({
            _id: params.id,
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
