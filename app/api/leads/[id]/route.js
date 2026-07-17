import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import HrEmail from "@/models/HrEmail";
import User from "@/models/User";

// DELETE — remove a contact by id
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { id } = await params;

        const deleted = await HrEmail.findOneAndDelete({
            _id: id,
            userId: user._id,
        });

        if (!deleted) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("DELETE /api/leads/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT — update a contact by id
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { id } = await params;
        const body = await request.json();
        const { email, company, jobRole, hrName, jobDescription, tags } = body;

        const updated = await HrEmail.findOneAndUpdate(
            { _id: id, userId: user._id },
            {
                ...(email && { email: email.trim() }),
                ...(company && { company: company.trim() }),
                ...(jobRole && { jobRole: jobRole.trim() }),
                ...(hrName !== undefined && { hrName: hrName.trim() }),
                ...(jobDescription !== undefined && { notes: jobDescription.trim() }),
                ...(tags !== undefined && { tags }),
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json({ contact: updated });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "This HR email already exists in your contacts" },
                { status: 409 }
            );
        }
        console.error("PUT /api/leads/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
