import { google } from 'googleapis';

export class GmailService {
    constructor(accessToken, refreshToken) {
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
    }

    /**
     * Send an email using Gmail API with optional attachments
     */
    async sendEmail({ to, subject, body, from, attachments = [] }) {
        try {
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
        } catch (error) {
            console.error('Gmail API Error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
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
