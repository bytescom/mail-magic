import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.js";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.send",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    signUp: "/signup"
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: profile.email_verified ? new Date() : null,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          tokenExpiry: new Date(account.expires_at * 1000),
        });
      } else {
        existingUser.accessToken = account.access_token;
        existingUser.tokenExpiry = new Date(account.expires_at * 1000);

        if (account.refresh_token) {
          existingUser.refreshToken = account.refresh_token;
        }

        await existingUser.save();
      }

      return true;
    },

    async signUp({ user, account, profile }) {
      await connectDB();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: profile.email_verified ? new Date() : null,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          tokenExpiry: new Date(account.expires_at * 1000),
        });
      } else {
        existingUser.accessToken = account.access_token;
        existingUser.tokenExpiry = new Date(account.expires_at * 1000);

        if (account.refresh_token) {
          existingUser.refreshToken = account.refresh_token;
        }

        await existingUser.save();
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.email = token.email;
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}