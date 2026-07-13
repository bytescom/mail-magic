import { connectDB } from "@/lib/db";
import User from "@/models/User.js";

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

  user.accessToken = data.access_token;
  user.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
  await user.save();

  return user.accessToken;
}