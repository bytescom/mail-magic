import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();
        const template = await EmailTemplate.findOne({
            _id: id,
            userId: session.user.id,
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, subject, body: templateBody } = body;

        await dbConnect();

        // Extract variables from template
        const variableRegex = /{{([^}]+)}}/g;
        const variables = [];
        let match;
        const bodyText = templateBody || '';
        while ((match = variableRegex.exec(bodyText)) !== null) {
            if (!variables.includes(match[1])) {
                variables.push(match[1]);
            }
        }

        const template = await EmailTemplate.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            {
                name,
                subject,
                body: templateBody,
                variables,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();
        const template = await EmailTemplate.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
