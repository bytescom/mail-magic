import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import { NextResponse } from 'next/server';

// GET /api/applications/:id
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { id } = await params;

        const application = await Application.findOne({
            _id: id,
            userId: session.user.id,
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ application });
    } catch (error) {
        console.error('Error fetching application:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/applications/:id — update status, notes, replyType
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { id } = await params;

        const body = await request.json();
        const allowedFields = ['status', 'notes', 'replyType', 'followUpDate', 'lastActionDate'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (body[field] !== undefined) updateData[field] = body[field];
        });

        updateData.lastActionDate = new Date();

        const application = await Application.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: updateData },
            { new: true }
        );

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ application });
    } catch (error) {
        console.error('Error updating application:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/applications/:id
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { id } = await params;

        const result = await Application.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        });

        if (!result) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Application deleted' });
    } catch (error) {
        console.error('Error deleting application:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
