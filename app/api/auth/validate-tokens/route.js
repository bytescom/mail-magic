import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { google } from 'googleapis';

/**
 * API endpoint to validate and refresh OAuth tokens
 * This helps diagnose token issues in production
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({
                error: 'Not authenticated',
                requiresReauth: true
            }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({
                error: 'User not found',
                requiresReauth: true
            }, { status: 404 });
        }

        // Check if tokens exist
        const hasAccessToken = !!user.accessToken;
        const hasRefreshToken = !!user.refreshToken;
        const tokenExpiry = user.tokenExpiry;
        const isExpired = tokenExpiry ? new Date(tokenExpiry) < new Date() : true;

        // If no refresh token, user must re-authenticate
        if (!hasRefreshToken) {
            return NextResponse.json({
                valid: false,
                requiresReauth: true,
                reason: 'MISSING_REFRESH_TOKEN',
                message: 'No refresh token found. Please sign out and sign in again.',
                details: {
                    hasAccessToken,
                    hasRefreshToken,
                    tokenExpiry,
                    isExpired
                }
            });
        }

        // Try to refresh the token if expired
        if (isExpired) {
            try {
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET,
                    process.env.NEXTAUTH_URL
                );

                oauth2Client.setCredentials({
                    refresh_token: user.refreshToken,
                });

                const { credentials } = await oauth2Client.refreshAccessToken();

                // Update user tokens in database
                user.accessToken = credentials.access_token;
                if (credentials.refresh_token) {
                    user.refreshToken = credentials.refresh_token;
                }
                if (credentials.expiry_date) {
                    user.tokenExpiry = new Date(credentials.expiry_date);
                }
                user.updatedAt = new Date();
                await user.save();

                return NextResponse.json({
                    valid: true,
                    refreshed: true,
                    message: 'Token successfully refreshed',
                    details: {
                        tokenExpiry: user.tokenExpiry,
                        hasRefreshToken: !!user.refreshToken
                    }
                });

            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                return NextResponse.json({
                    valid: false,
                    requiresReauth: true,
                    reason: 'REFRESH_FAILED',
                    message: 'Failed to refresh token. Please sign out and sign in again.',
                    error: refreshError.message,
                    details: {
                        hasAccessToken,
                        hasRefreshToken,
                        tokenExpiry,
                        isExpired
                    }
                }, { status: 401 });
            }
        }

        // Token is valid and not expired
        return NextResponse.json({
            valid: true,
            refreshed: false,
            message: 'Token is valid',
            details: {
                hasAccessToken,
                hasRefreshToken,
                tokenExpiry,
                isExpired: false,
                expiresIn: tokenExpiry ? Math.round((new Date(tokenExpiry) - new Date()) / 1000 / 60) + ' minutes' : 'unknown'
            }
        });

    } catch (error) {
        console.error('Error validating tokens:', error);
        return NextResponse.json({
            error: error.message,
            requiresReauth: true
        }, { status: 500 });
    }
}
