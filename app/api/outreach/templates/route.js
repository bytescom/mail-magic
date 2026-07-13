import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";
import User from "@/models/User";

// GET — fetch all templates for logged-in user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const templates = await EmailTemplate.find({ userId: user._id })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({ templates });
    } catch (error) {
        console.error("GET /api/outreach/templates error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST — create a new template
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const body = await request.json();
        const { name, subject, body: templateBody, category } = body;

        if (!name || !subject || !templateBody) {
            return NextResponse.json({ error: "Name, subject, and body are required" }, { status: 400 });
        }

        // Extract variables like {{name}}, {{company}} from body
        const variableMatches = templateBody.match(/\{\{(\w+)\}\}/g) || [];
        const variables = [...new Set(variableMatches)];

        const template = await EmailTemplate.create({
            userId: user._id,
            name: name.trim(),
            subject: subject.trim(),
            body: templateBody,
            variables,
            category: category || 'Cold Outreach',
        });

        return NextResponse.json({ template }, { status: 201 });
    } catch (error) {
        console.error("POST /api/outreach/templates error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
