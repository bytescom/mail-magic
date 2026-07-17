import { connectDB } from "@/lib/db";
import User from "@/models/User.js";

/**
 * Returns a valid access token for the given userId,
 * refreshing it from Google if it has expired.
 */
export async function getValidAccessToken(userId) {
  await connectDB();
  const user = await User.findById(userId);

  if (new Date() < new Date(user.tokenExpiry)) {
    return user.accessToken; // still valid
  }

  // expired — use refreshToken to get a new one from Google
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Failed to refresh access token. User must re-login.");
  }

  user.accessToken = data.access_token;
  user.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
  await user.save();

  return user.accessToken;
}

/**
 * Personalise a template string by replacing {{variable}} tokens with lead data.
 */
export function personalise(template, lead) {
  if (!template) return "";
  return template
    .replace(/\{\{name\}\}/gi, lead.hrName || "there")
    .replace(/\{\{company\}\}/gi, lead.company || "")
    .replace(/\{\{job_role\}\}/gi, lead.jobRole || "")
    .replace(/\{\{location\}\}/gi, lead.location || "")
    .replace(/\{\{industry\}\}/gi, lead.industry || "");
}

/**
 * Encode an email into RFC 2822 base64url format for the Gmail API.
 */
export function makeRawEmail({ to, from, subject, body }) {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(body).toString("base64"),
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Send one email via the Gmail REST API using a valid access token.
 * @returns {{ id: string, threadId: string }} Gmail message data
 */
export async function sendGmailMessage({ accessToken, to, from, subject, body }) {
  const raw = makeRawEmail({ to, from, subject, body });

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Gmail API error ${res.status}: ${err?.error?.message || res.statusText}`
    );
  }

  return res.json();
}