'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Users,
    Send,
    ListChecks,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    Plus,
    ChevronRight,
    Zap,
    Clock,
    Sparkles,
    Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'HR Emails', href: '/hr-emails', icon: Users },
    { name: 'Send Emails', href: '/send', icon: Send },
    { name: 'Logs', href: '/logs', icon: ListChecks },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const response = await fetch('/api/notifications?limit=20');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true }),
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Get icon component from string
    const getIconComponent = (iconName) => {
        const iconMap = {
            Send,
            Users,
            Shield,
            Bell,
            Sparkles,
            Zap,
        };
        return iconMap[iconName] || Bell;
    };

    // Get color classes for notification type
    const getNotificationStyle = (type) => {
        const styles = {
            campaign: { color: 'text-blue-600', bg: 'bg-blue-50' },
            hr_sync: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
            security: { color: 'text-amber-600', bg: 'bg-amber-50' },
            system: { color: 'text-purple-600', bg: 'bg-purple-50' },
            info: { color: 'text-slate-600', bg: 'bg-slate-50' },
        };
        return styles[type] || styles.info;
    };

    // Format time ago
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' mins ago';

        return 'just now';
    };

    // Fetch notifications on mount and when notifications open
    useEffect(() => {
        if (session?.user) {
            fetchNotifications();
        }
    }, [session]);

    useEffect(() => {
        if (notificationsOpen && session?.user) {
            fetchNotifications();
        }
    }, [notificationsOpen]);

    return (
        <div className="min-h-screen bg-[#FDFDFF] selection:bg-blue-100 selection:text-blue-900 font-sans">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-slate-200/60 bg-white z-50">
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="h-20 px-7 flex items-center border-b border-slate-50">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-lg shadow-blue-200 overflow-hidden">
                                <img src="/icon.png" alt="MailMagic Logo" className="w-8 h-8 text-white" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                                MailMagic
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Section */}
                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 active:scale-[0.97] active:bg-blue-100/50',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 group'
                                    )}
                                >
                                    <item.icon className={cn('w-5 h-5', isActive ? 'text-blue-600' : 'text-slate-400 transition-colors group-hover:text-slate-600 group-active:text-slate-700')} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer / Upgrade Card */}
                    <div className="p-5 mt-auto border-t border-slate-50">
                        <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden group shadow-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                                <Plus className="w-16 h-16 text-white" />
                            </div>
                            <div className="relative z-10 space-y-3">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Premium</p>
                                <p className="text-xs font-bold text-white leading-relaxed">Unlock unlimited templates and smarter analytics.</p>
                                <button className="w-full text-xs font-bold py-2.5 bg-white rounded-xl text-slate-900 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 h-16 flex items-center justify-between">
                <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 active:bg-slate-100 active:scale-90 rounded-xl transition-all cursor-pointer">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Send className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-display font-bold text-lg text-slate-900">MailMagic</span>
                </div>
                <div className="flex items-center gap-3">
                    <img
                        src={session?.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                        className="w-8 h-8 rounded-xl border border-slate-200 shadow-sm"
                        alt=""
                    />
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setSidebarOpen(false)} />
                    <nav className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl p-7 flex flex-col transform transition-transform duration-300 animate-[slideIn_0.3s_ease-out]">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Send className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-display font-bold text-xl text-slate-900 tracking-tight">MailMagic</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            'flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 active:bg-blue-100/30',
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        )}
                                    >
                                        <item.icon className={cn('w-5 h-5', isActive ? 'text-blue-600' : 'text-slate-400')} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="mt-6 flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 active:bg-rose-100 active:scale-95 transition-all cursor-pointer"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                {/* Desktop Top Header */}
                <header className="hidden lg:flex sticky top-0 z-30 h-20 bg-white/70 backdrop-blur-md border-b border-slate-100/50 items-center justify-between px-10">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-900">{navigation.find(n => n.href === pathname)?.name || 'Dashboard'}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all group relative cursor-pointer",
                                    notificationsOpen ? "bg-blue-50 text-blue-600 shadow-inner" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">
                                                    {unreadCount} New
                                                </span>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {loadingNotifications ? (
                                                <div className="p-8 text-center">
                                                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                                                    <p className="text-sm text-slate-400">Loading notifications...</p>
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <Bell className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900 mb-1">All caught up!</p>
                                                    <p className="text-xs text-slate-400">No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map((notification) => {
                                                    const NotifIcon = getIconComponent(notification.icon);
                                                    const style = getNotificationStyle(notification.type);

                                                    return (
                                                        <div
                                                            key={notification._id}
                                                            onClick={() => {
                                                                if (!notification.isRead) {
                                                                    markAsRead(notification._id);
                                                                }
                                                                if (notification.link) {
                                                                    router.push(notification.link);
                                                                    setNotificationsOpen(false);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "p-5 border-b border-slate-50 last:border-0 cursor-pointer group transition-all",
                                                                notification.isRead
                                                                    ? "hover:bg-slate-50 active:bg-slate-100 opacity-60"
                                                                    : "bg-blue-50/30 hover:bg-blue-50/50 active:bg-blue-50"
                                                            )}
                                                        >
                                                            <div className="flex gap-4 active:scale-[0.98] transition-transform">
                                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm", style.bg)}>
                                                                    <NotifIcon className={cn("w-5 h-5", style.color)} />
                                                                </div>
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <p className="text-sm font-bold text-slate-900 leading-tight">
                                                                            {notification.title}
                                                                            {!notification.isRead && (
                                                                                <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    {notification.message && (
                                                                        <p className="text-xs text-slate-600 leading-relaxed">{notification.message}</p>
                                                                    )}
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                        <Clock className="w-3 h-3" />
                                                                        {formatTimeAgo(notification.createdAt)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                                                <button
                                                    onClick={markAllAsRead}
                                                    disabled={unreadCount === 0}
                                                    className={cn(
                                                        "text-[11px] font-bold uppercase tracking-widest transition-all",
                                                        unreadCount > 0
                                                            ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                                                            : "text-slate-300 cursor-not-allowed"
                                                    )}
                                                >
                                                    Mark All as Read
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <button
                                onClick={() => router.push('/settings')}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all cursor-pointer active:scale-90",
                                    pathname === '/settings' ? "bg-blue-50 text-blue-600 shadow-inner" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-100" />

                        <div className="flex items-center gap-4 pl-2 group cursor-default">
                            <div className="text-right flex flex-col justify-center">
                                <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">
                                    {session?.user?.name || 'User'}
                                </p>
                                <p className="text-[11px] font-bold text-slate-400 leading-none">{session?.user?.email}</p>
                            </div>
                            <div className="relative">
                                <img
                                    src={session?.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                                    className="w-10 h-10 rounded-2xl ring-4 ring-slate-50 object-cover shadow-sm group-hover:shadow-md transition-all duration-300"
                                    alt=""
                                />
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="ml-2 p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-12 pt-20 sm:pt-24 lg:pt-12">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
