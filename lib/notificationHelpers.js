/**
 * Notification Helper Functions
 */

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {string} params.userEmail - User's email address
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message (optional)
 * @param {string} params.type - Notification type (campaign, hr_sync, security, system, info)
 * @param {string} params.icon - Icon name (Send, Users, Shield, Bell, Info)
 * @param {string} params.link - Link to navigate to (optional)
 */
export async function createNotification({ userEmail, title, message, type = 'info', icon = 'Bell', link = null }) {
    try {
        const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userEmail,
                title,
                message,
                type,
                icon,
                link,
            }),
        });

        if (!response.ok) {
            console.error('Failed to create notification');
            return null;
        }

        const data = await response.json();
        return data.notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Create a campaign notification
 */
export function createCampaignNotification(userEmail, recipientCount, status = 'completed') {
    return createNotification({
        userEmail,
        title: status === 'completed' ? 'Campaign Completed' : 'Campaign Started',
        message: `Successfully sent emails to ${recipientCount} recipients`,
        type: 'campaign',
        icon: 'Send',
        link: '/logs',
    });
}

/**
 * Create an HR sync notification
 */
export function createHRSyncNotification(userEmail, count) {
    return createNotification({
        userEmail,
        title: 'HR List Synced',
        message: `${count} new HR contact${count !== 1 ? 's' : ''} added`,
        type: 'hr_sync',
        icon: 'Users',
        link: '/hr-emails',
    });
}

/**
 * Create a security notification
 */
export function createSecurityNotification(userEmail, message) {
    return createNotification({
        userEmail,
        title: 'Security Alert',
        message,
        type: 'security',
        icon: 'Shield',
    });
}

/**
 * Create a system notification
 */
export function createSystemNotification(userEmail, title, message, link = null) {
    return createNotification({
        userEmail,
        title,
        message,
        type: 'system',
        icon: 'Bell',
        link,
    });
}
