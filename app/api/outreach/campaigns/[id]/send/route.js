import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Campaign from "@/models/Campaign";
import HrEmail from "@/models/HrEmail";
import User from "@/models/User";
import { getValidAccessToken, personalise, sendGmailMessage } from "@/lib/gmail";

const DELAY_MS = 1500; // 1.5 s between emails — keeps under Gmail rate limits

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// POST /api/outreach/campaigns/[id]/send
// Sends the campaign emails via Gmail API and updates progress in DB.
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (!user.refreshToken) {
            return NextResponse.json(
                { error: "Gmail not connected. Please sign out and sign in again to grant Gmail access." },
                { status: 403 }
            );
        }

        // Load campaign (must belong to this user)
        const campaign = await Campaign.findOne({ _id: params.id, userId: user._id });
        if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

        if (!campaign.templateSnapshot?.subject || !campaign.templateSnapshot?.body) {
            return NextResponse.json({ error: "Campaign has no email template set." }, { status: 400 });
        }

        if (!campaign.audienceIds?.length) {
            return NextResponse.json({ error: "Campaign has no audience selected." }, { status: 400 });
        }

        // Mark as Running immediately
        campaign.status = "Running";
        campaign.launchedAt = campaign.launchedAt || new Date();
        campaign.sentCount = 0;
        await campaign.save();

        // Fetch audience leads
        const leads = await HrEmail.find({
            _id: { $in: campaign.audienceIds },
            userId: user._id,
        }).lean();

        if (!leads.length) {
            campaign.status = "Failed";
            await campaign.save();
            return NextResponse.json({ error: "No matching leads found for this campaign." }, { status: 400 });
        }

        const fromAddress = `${user.name} <${user.email}>`;
        let sentCount = 0;
        const failedEmails = [];

        // Get a fresh access token once (will refresh if needed)
        let accessToken = await getValidAccessToken(user._id);

        for (const lead of leads) {
            try {
                const subject = personalise(campaign.templateSnapshot.subject, lead);
                const body = personalise(campaign.templateSnapshot.body, lead);

                await sendGmailMessage({
                    accessToken,
                    to: lead.email,
                    from: fromAddress,
                    subject,
                    body,
                });

                sentCount++;

                // Mark lead as contacted
                await HrEmail.findByIdAndUpdate(lead._id, {
                    status: "contacted",
                    lastContacted: new Date(),
                });

                // Throttle between sends
                await sleep(DELAY_MS);
            } catch (sendErr) {
                console.error(`Failed to send to ${lead.email}:`, sendErr.message);
                failedEmails.push({ email: lead.email, error: sendErr.message });

                // If Gmail returns 401 (token expired mid-send), refresh and retry once
                if (sendErr.message?.includes("401")) {
                    try {
                        accessToken = await getValidAccessToken(user._id);
                        const subject = personalise(campaign.templateSnapshot.subject, lead);
                        const body = personalise(campaign.templateSnapshot.body, lead);
                        await sendGmailMessage({ accessToken, to: lead.email, from: fromAddress, subject, body });
                        sentCount++;
                        await HrEmail.findByIdAndUpdate(lead._id, { status: "contacted", lastContacted: new Date() });
                    } catch {
                        // Retry also failed — skip this lead
                    }
                }
            }
        }

        // Mark campaign complete (or partially failed)
        const finalStatus = failedEmails.length === leads.length ? "Failed" : "Completed";
        campaign.status = finalStatus;
        campaign.sentCount = sentCount;
        campaign.totalRecipients = leads.length;
        campaign.completedAt = new Date();
        await campaign.save();

        return NextResponse.json({
            success: true,
            sent: sentCount,
            total: leads.length,
            failed: failedEmails.length,
            status: finalStatus,
            ...(failedEmails.length > 0 && { failedEmails }),
        });
    } catch (error) {
        console.error("POST /api/outreach/campaigns/[id]/send error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
