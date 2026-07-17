import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";
import User from "@/models/User";

// GET — fetch single campaign
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const campaign = await Campaign.findOne({ _id: params.id, userId: user._id }).lean();
        if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

        return NextResponse.json({ campaign });
    } catch (error) {
        console.error("GET /api/outreach/campaigns/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH — update a campaign (edit, launch, duplicate)
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const body = await request.json();

        // If launching, set status to Running and record launchedAt
        if (body.status === 'Running') {
            body.launchedAt = new Date();
        }

        const campaign = await Campaign.findOneAndUpdate(
            { _id: params.id, userId: user._id },
            { ...body, updatedAt: new Date() },
            { new: true }
        );

        if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

        return NextResponse.json({ campaign });
    } catch (error) {
        console.error("PATCH /api/outreach/campaigns/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE — delete a campaign
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const campaign = await Campaign.findOneAndDelete({ _id: params.id, userId: user._id });
        if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/outreach/campaigns/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
