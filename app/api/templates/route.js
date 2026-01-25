import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const templates = await EmailTemplate.find({ userId: session.user.id })
            .sort({ createdAt: -1 });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
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
        const { name, subject, body: templateBody } = body;

        if (!name || !subject || !templateBody) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Extract variables from template
        const variableRegex = /{{([^}]+)}}/g;
        const variables = [];
        let match;
        while ((match = variableRegex.exec(templateBody)) !== null) {
            if (!variables.includes(match[1])) {
                variables.push(match[1]);
            }
        }

        const template = await EmailTemplate.create({
            userId: session.user.id,
            name,
            subject,
            body: templateBody,
            variables,
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
