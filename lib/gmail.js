import { google } from 'googleapis';

export class GmailService {
    constructor(accessToken, refreshToken, userId = null) {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.NEXTAUTH_URL
        );

        this.oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        this.userId = userId; // Store user ID for token updates
    }

    /**
     * Refresh the access token if expired
     */
    async refreshAccessToken() {
        try {
            console.log('🔄 Refreshing access token...');
            const { credentials } = await this.oauth2Client.refreshAccessToken();

            // Update credentials in the OAuth2 client
            this.oauth2Client.setCredentials(credentials);

            console.log('✅ Access token refreshed successfully');

            // Update user's tokens in database if userId is provided
            if (this.userId && credentials.access_token) {
                try {
                    const dbConnect = (await import('@/lib/mongodb')).default;
                    const User = (await import('@/models/User')).default;

                    await dbConnect();

                    const updateData = {
                        accessToken: credentials.access_token,
                        updatedAt: new Date(),
                    };

                    // Update refresh token if provided
                    if (credentials.refresh_token) {
                        updateData.refreshToken = credentials.refresh_token;
                    }

                    // Update token expiry
                    if (credentials.expiry_date) {
                        updateData.tokenExpiry = new Date(credentials.expiry_date);
                    }

                    await User.findByIdAndUpdate(this.userId, updateData);
                    console.log('✅ Updated tokens in database');
                } catch (dbError) {
                    console.error('⚠️ Failed to update tokens in database:', dbError.message);
                    // Don't throw - token refresh succeeded, DB update is optional
                }
            }

            return credentials;
        } catch (error) {
            console.error('❌ Error refreshing access token:', error);
            throw new Error('Failed to refresh access token. Please re-authenticate.');
        }
    }

    /**
     * Send an email using Gmail API with optional attachments
     */
    async sendEmail({ to, subject, body, from, attachments = [] }) {
        try {
            return await this._sendEmailInternal({ to, subject, body, from, attachments });
        } catch (error) {
            // If we get a 401 or 403, the token might be expired - try refreshing
            if (error.code === 401 || error.code === 403 || error.message?.includes('invalid_grant')) {
                console.log('🔑 Token appears expired, attempting refresh...');
                try {
                    await this.refreshAccessToken();
                    // Retry sending the email with refreshed token
                    console.log('🔄 Retrying email send with refreshed token...');
                    return await this._sendEmailInternal({ to, subject, body, from, attachments });
                } catch (refreshError) {
                    console.error('❌ Failed to refresh token and retry:', refreshError);
                    return {
                        success: false,
                        error: 'Authentication failed. Please sign out and sign in again to refresh your credentials.',
                    };
                }
            }

            // For other errors, return the error
            console.error('Gmail API Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to send email',
            };
        }
    }

    /**
     * Internal method to actually send the email
     */
    async _sendEmailInternal({ to, subject, body, from, attachments = [] }) {
        // Standardize line endings to CRLF for RFC 2822
        const CRLF = '\r\n';

        // Format body for HTML display while preserving whitespace/newlines
        const formattedBody = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #222222; white-space: pre-wrap;">${body}</div>`;

        const message = attachments.length > 0
            ? this.createMessageWithAttachments({ to, subject, body: formattedBody, from, attachments, CRLF })
            : this.createMessage({ to, subject, body: formattedBody, from, CRLF });

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await this.gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        return {
            success: true,
            messageId: response.data.id,
            threadId: response.data.threadId,
        };
    }

    /**
     * Create RFC 2822 formatted email message (without attachment)
     */
    createMessage({ to, subject, body, from, CRLF = '\r\n' }) {
        const messageParts = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            body,
        ];

        return messageParts.join(CRLF);
    }

    /**
     * Create RFC 2822 formatted email message with attachments
     */
    createMessageWithAttachments({ to, subject, body, from, attachments, CRLF = '\r\n' }) {
        const boundary = '----=_Part_' + Math.random().toString(36).substring(7);

        let messageParts = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            body,
            '',
        ];

        // Add each attachment
        for (const attachment of attachments) {
            messageParts.push(`--${boundary}`);
            messageParts.push(`Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`);
            messageParts.push('Content-Transfer-Encoding: base64');
            messageParts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
            messageParts.push('');

            // Gmail API expects the base64 data to be clean
            const base64Data = attachment.data.includes('base64,')
                ? attachment.data.split('base64,')[1]
                : attachment.data;

            messageParts.push(base64Data);
            messageParts.push('');
        }

        messageParts.push(`--${boundary}--`);

        return messageParts.join(CRLF);
    }

    /**
     * Get user profile
     */
    async getProfile() {
        try {
            const response = await this.gmail.users.getProfile({ userId: 'me' });
            return response.data;
        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    }

    /**
     * Check if credentials are valid
     */
    async validateCredentials() {
        try {
            await this.getProfile();
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default GmailService;
