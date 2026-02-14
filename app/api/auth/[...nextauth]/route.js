import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Refreshes an expired access token using the refresh token
 */
async function refreshAccessToken(token) {
    try {
        console.log('🔄 Attempting to refresh access token...');

        const url = 'https://oauth2.googleapis.com/token';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw new Error(refreshedTokens.error || 'Failed to refresh token');
        }

        console.log('✅ Access token refreshed successfully');

        // Update database with new access token
        await dbConnect();
        await User.findOneAndUpdate(
            { email: token.email },
            {
                accessToken: refreshedTokens.access_token,
                tokenExpiry: new Date(Date.now() + refreshedTokens.expires_in * 1000),
                updatedAt: new Date(),
            }
        );

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            // Keep the same refresh token, or use new one if provided
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error('❌ Error refreshing access token:', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    access_type: 'offline',     // Required for refresh token
                    prompt: 'select_account',   // Show account selector (better UX than forcing consent every time)
                    response_type: 'code',
                    scope: [
                        'openid',
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/gmail.send',
                        'https://www.googleapis.com/auth/gmail.readonly',
                    ].join(' '),
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                console.log('🔐 SignIn callback started for:', user.email);
                console.log('📦 Account data:', JSON.stringify({
                    provider: account?.provider,
                    type: account?.type,
                    expires_at: account?.expires_at,
                    expires_in: account?.expires_in,
                    has_access_token: !!account?.access_token,
                    has_refresh_token: !!account?.refresh_token,
                }, null, 2));

                await dbConnect();
                console.log('✅ Database connected');

                // Calculate token expiry - handle different formats
                let tokenExpiry = null;
                if (account?.expires_at) {
                    // expires_at is a Unix timestamp in seconds
                    tokenExpiry = new Date(account.expires_at * 1000);
                } else if (account?.expires_in) {
                    // expires_in is seconds from now
                    tokenExpiry = new Date(Date.now() + account.expires_in * 1000);
                } else {
                    // Default: 1 hour from now
                    tokenExpiry = new Date(Date.now() + 3600 * 1000);
                }
                console.log('⏰ Token expiry calculated:', tokenExpiry);

                // Warning if refresh token is missing
                if (!account?.refresh_token) {
                    console.warn('⚠️ WARNING: No refresh token received from Google!');
                    console.warn('⚠️ User will not be able to send emails after access token expires.');
                    console.warn('⚠️ This usually means the user needs to revoke access and sign in again.');
                }

                // Find or create user
                let dbUser = await User.findOne({ email: user.email });
                console.log('👤 User found:', dbUser ? 'Yes' : 'No - creating new user');

                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        accessToken: account?.access_token || null,
                        refreshToken: account?.refresh_token || null,
                        tokenExpiry: tokenExpiry,
                    });
                    console.log('✅ New user created:', dbUser._id);
                } else {
                    // Update tokens - keep existing refresh token if new one not provided
                    dbUser.accessToken = account?.access_token || dbUser.accessToken;
                    dbUser.refreshToken = account?.refresh_token || dbUser.refreshToken;
                    dbUser.tokenExpiry = tokenExpiry;
                    dbUser.image = user.image;
                    dbUser.name = user.name;
                    dbUser.updatedAt = new Date();
                    await dbUser.save();
                    console.log('✅ User updated:', dbUser._id);
                    console.log('📝 Tokens updated:', {
                        hasAccessToken: !!dbUser.accessToken,
                        hasRefreshToken: !!dbUser.refreshToken,
                    });
                }

                console.log('✅ SignIn callback completed successfully');
                return true;
            } catch (error) {
                console.error('❌ Error in signIn callback:');
                console.error('   Error name:', error.name);
                console.error('   Error message:', error.message);
                console.error('   Full error:', error);
                return false;
            }
        },
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                // Calculate expiry properly
                let expiresAt = Date.now() + 3600 * 1000; // Default 1 hour
                if (account.expires_at) {
                    expiresAt = account.expires_at * 1000;
                } else if (account.expires_in) {
                    expiresAt = Date.now() + account.expires_in * 1000;
                }

                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: expiresAt,
                };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpires) {
                return token;
            }

            // Access token has expired, refresh it
            console.log('⚠️ Access token expired, refreshing...');
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            if (token) {
                session.accessToken = token.accessToken;
                session.refreshToken = token.refreshToken;
                session.error = token.error;

                // Get user from database
                await dbConnect();
                const dbUser = await User.findOne({ email: session.user.email });
                if (dbUser) {
                    session.user.id = dbUser._id.toString();
                    session.user.settings = dbUser.settings;

                    // Use database tokens if token refresh failed
                    if (token.error === 'RefreshAccessTokenError') {
                        session.accessToken = dbUser.accessToken;
                        session.refreshToken = dbUser.refreshToken;
                    }
                }
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Always redirect to dashboard after sign-in
            return `${baseUrl}/dashboard`;
        },
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
