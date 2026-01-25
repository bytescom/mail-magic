'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing notifications
 * Usage:
 * 
 * const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async (limit = 20, unreadOnly = false) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (limit) params.append('limit', limit.toString());
            if (unreadOnly) params.append('unreadOnly', 'true');

            const response = await fetch(`/api/notifications?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);

            return data;
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Mark a specific notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            // Update local state optimistically
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            return await response.json();
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError(err.message);
            return null;
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark all as read');
            }

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

            return await response.json();
        } catch (err) {
            console.error('Error marking all as read:', err);
            setError(err.message);
            return null;
        }
    }, []);

    // Delete a specific notification
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Update local state
            setNotifications(prev => prev.filter(n => n._id !== notificationId));

            return await response.json();
        } catch (err) {
            console.error('Error deleting notification:', err);
            setError(err.message);
            return null;
        }
    }, []);

    // Delete all read notifications
    const deleteAllRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications?deleteAll=true', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notifications');
            }

            // Update local state
            setNotifications(prev => prev.filter(n => !n.isRead));

            return await response.json();
        } catch (err) {
            console.error('Error deleting notifications:', err);
            setError(err.message);
            return null;
        }
    }, []);

    // Create a new notification (for testing or manual creation)
    const createNotification = useCallback(async (notificationData) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData),
            });

            if (!response.ok) {
                throw new Error('Failed to create notification');
            }

            const data = await response.json();

            // Optionally refresh notifications
            await fetchNotifications();

            return data;
        } catch (err) {
            console.error('Error creating notification:', err);
            setError(err.message);
            return null;
        }
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        createNotification,
    };
}

export default useNotifications;
