import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";
import User from "@/models/User";

// GET — fetch single template
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const template = await EmailTemplate.findOne({ _id: params.id, userId: user._id }).lean();
        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        return NextResponse.json({ template });
    } catch (error) {
        console.error("GET /api/outreach/templates/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH — update a template
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const body = await request.json();
        const { name, subject, body: templateBody } = body;

        const updateData = { updatedAt: new Date() };
        if (name) updateData.name = name.trim();
        if (subject) updateData.subject = subject.trim();
        if (templateBody) {
            updateData.body = templateBody;
            const variableMatches = templateBody.match(/\{\{(\w+)\}\}/g) || [];
            updateData.variables = [...new Set(variableMatches)];
        }

        const template = await EmailTemplate.findOneAndUpdate(
            { _id: params.id, userId: user._id },
            updateData,
            { new: true }
        );

        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        return NextResponse.json({ template });
    } catch (error) {
        console.error("PATCH /api/outreach/templates/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE — delete a template
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const template = await EmailTemplate.findOneAndDelete({ _id: params.id, userId: user._id });
        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/outreach/templates/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
