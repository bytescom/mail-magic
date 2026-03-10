'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Clock,
    Send,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Bell,
    SkipForward,
    Edit3,
    Trash2,
    Plus,
    Timer,
    Calendar,
    Building2,
    Briefcase,
    ArrowRight,
    RefreshCw,
    Sparkles,
    Zap,
    X,
    ChevronRight,
    Mail,
    Eye,
    MessageCircle,
    ShieldAlert,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FollowUpsPage() {
    const { data: session } = useSession();
    const [followUps, setFollowUps] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, sent: 0, skipped: 0, overdue: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [editingFollowUp, setEditingFollowUp] = useState(null);
    const [editForm, setEditForm] = useState({ subject: '', message: '' });
    const [generatingFollowUps, setGeneratingFollowUps] = useState(false);
    const [sendingFollowUpId, setSendingFollowUpId] = useState(null);

    // Two-click delete state
    // pendingDeleteId = the follow-up ID armed for single delete (null = idle)
    // pendingDeleteAll = true means the global delete is armed
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [pendingDeleteAll, setPendingDeleteAll] = useState(false);
    const deleteTimerRef = useRef(null);

    // Auto-reset the armed state after 3 seconds of inactivity
    const armDelete = useCallback((id) => {
        // Clear any existing timer
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        setPendingDeleteId(id);
        setPendingDeleteAll(false);
        deleteTimerRef.current = setTimeout(() => {
            setPendingDeleteId(null);
        }, 3000);
    }, []);

    const armDeleteAll = useCallback(() => {
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        setPendingDeleteAll(true);
        setPendingDeleteId(null);
        deleteTimerRef.current = setTimeout(() => {
            setPendingDeleteAll(false);
        }, 3000);
    }, []);

    const resetDelete = useCallback(() => {
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        setPendingDeleteId(null);
        setPendingDeleteAll(false);
    }, []);

    // Cleanup timer on unmount
    useEffect(() => () => { if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current); }, []);

    useEffect(() => {
        if (session) {
            fetchFollowUps();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, filter]);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/follow-ups?status=${filter}&limit=50`);
            if (response.ok) {
                const data = await response.json();
                setFollowUps(data.followUps || []);
                setCounts(data.counts || {});
            }
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
            toast.error('Failed to load follow-ups');
        } finally {
            setLoading(false);
        }
    };

    const autoGenerateFollowUps = async () => {
        try {
            setGeneratingFollowUps(true);
            const response = await fetch('/api/follow-ups/auto-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followUpDays: 7 }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.created > 0) {
                    toast.success(`Created ${data.created} follow-up reminders!`);
                } else {
                    toast.info('No new follow-ups to create. All applications are covered!');
                }
                fetchFollowUps();
            } else {
                toast.error('Failed to generate follow-ups');
            }
        } catch (error) {
            console.error('Error generating follow-ups:', error);
            toast.error('Failed to generate follow-ups');
        } finally {
            setGeneratingFollowUps(false);
        }
    };

    const sendFollowUp = async (followUpId) => {
        try {
            setSendingFollowUpId(followUpId);
            const response = await fetch('/api/follow-ups/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followUpId }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Follow-up email sent successfully!');
                fetchFollowUps();
            } else if (data.limitReached) {
                toast.error(data.error);
            } else {
                toast.error(data.error || 'Failed to send follow-up');
            }
        } catch (error) {
            console.error('Error sending follow-up:', error);
            toast.error('Failed to send follow-up');
        } finally {
            setSendingFollowUpId(null);
        }
    };

    const updateFollowUp = async (followUpId, updates) => {
        try {
            const response = await fetch('/api/follow-ups', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followUpId, ...updates }),
            });
            if (response.ok) {
                toast.success(
                    updates.status === 'sent' ? 'Marked as sent!' :
                        updates.status === 'skipped' ? 'Follow-up skipped' :
                            updates.snoozeDays ? `Snoozed for ${updates.snoozeDays} days` :
                                'Follow-up updated!'
                );
                fetchFollowUps();
            } else {
                toast.error('Failed to update follow-up');
            }
        } catch (error) {
            console.error('Error updating follow-up:', error);
            toast.error('Failed to update follow-up');
        }
    };

    // ── Single delete — two-click confirmation ───────────────────────────────
    const handleDeleteClick = async (followUpId) => {
        if (pendingDeleteId === followUpId) {
            // Second click — execute
            resetDelete();
            try {
                const response = await fetch(`/api/follow-ups?id=${followUpId}`, { method: 'DELETE' });
                if (response.ok) {
                    toast.success('Follow-up deleted');
                    fetchFollowUps();
                } else {
                    toast.error('Failed to delete follow-up');
                }
            } catch (error) {
                console.error('Error deleting follow-up:', error);
                toast.error('Failed to delete follow-up');
            }
        } else {
            // First click — arm
            armDelete(followUpId);
        }
    };

    // ── Bulk delete all — two-click confirmation ─────────────────────────────
    const handleDeleteAllClick = async () => {
        if (pendingDeleteAll) {
            // Second click — execute
            resetDelete();
            try {
                const statusParam = filter !== 'all' ? `&status=${filter}` : '';
                const response = await fetch(`/api/follow-ups?all=true${statusParam}`, { method: 'DELETE' });
                if (response.ok) {
                    const data = await response.json();
                    toast.success(`Deleted ${data.deleted} follow-up${data.deleted !== 1 ? 's' : ''}`);
                    fetchFollowUps();
                } else {
                    toast.error('Failed to delete follow-ups');
                }
            } catch (error) {
                console.error('Error deleting all follow-ups:', error);
                toast.error('Failed to delete follow-ups');
            }
        } else {
            // First click — arm
            armDeleteAll();
        }
    };

    const handleEditSave = async () => {
        if (!editingFollowUp) return;
        await updateFollowUp(editingFollowUp._id, {
            subject: editForm.subject,
            message: editForm.message,
        });
        setEditingFollowUp(null);
    };

    const openEditModal = (followUp) => {
        setEditingFollowUp(followUp);
        setEditForm({
            subject: followUp.subject,
            message: followUp.message,
        });
    };

    const isOverdue = (date) => new Date(date) <= new Date();

    const getTimeDiff = (date) => {
        const now = new Date();
        const target = new Date(date);
        const diff = target - now;
        const days = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));

        if (diff < 0) return `${days}d overdue`;
        if (days === 0) return 'Due today';
        if (days === 1) return 'Due tomorrow';
        return `In ${days} days`;
    };

    // Detect if the application linked to this follow-up has already received a reply
    const hasHrReplied = (followUp) => {
        // The follow-up's emailLog status of 'replied'/'interview'/'rejected' indicates HR replied
        const repliedStatuses = ['replied', 'interview', 'rejected'];
        return repliedStatuses.includes(followUp.emailLogId?.status);
    };

    if (loading && followUps.length === 0) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse font-sans">Loading follow-ups...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <main className="w-full max-w-7xl mx-auto overflow-x-hidden">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-1">
                                <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] font-sans">Automation</h2>
                                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                    Follow-Up Manager
                                </h1>
                                <p className="text-slate-500 max-w-lg text-xs sm:text-sm leading-relaxed font-sans">
                                    Gentle reminders for applications with no reply yet. Never follow up on a conversation already in progress.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap self-start">
                                {/* Delete All — two-click confirmation */}
                                {followUps.length > 0 && (
                                    <button
                                        onClick={handleDeleteAllClick}
                                        className={cn(
                                            "font-semibold px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer border",
                                            pendingDeleteAll
                                                ? "bg-rose-600 text-white border-rose-700 animate-pulse shadow-lg shadow-rose-500/30 hover:bg-rose-700"
                                                : "bg-white text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                                        )}
                                        title={pendingDeleteAll ? "Click again to confirm — deletes all visible follow-ups" : "Delete all follow-ups in current view"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {pendingDeleteAll ? "Confirm Delete All?" : `Delete All (${filter === 'all' ? counts.total : counts[filter] || 0})`}
                                    </button>
                                )}

                                {/* Auto-Generate */}
                                <button
                                    onClick={autoGenerateFollowUps}
                                    disabled={generatingFollowUps}
                                    className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.25)] flex items-center gap-2 font-sans cursor-pointer disabled:opacity-50"
                                >
                                    {generatingFollowUps ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    <span>Auto-Generate</span>
                                </button>
                            </div>
                        </div>

                        {/* Follow-up policy info banner */}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 leading-relaxed">
                                <strong>Manual Follow-Ups Only:</strong> Click <strong>Send Now</strong> on any pending follow-up to send it via Gmail instantly.
                                Follow-ups are limited per application — configure the limit in{' '}
                                <strong>Settings → Max Follow-Ups</strong>. If HR has already replied, use the <strong>Reply</strong> button in Applications instead.
                            </div>
                        </div>

                        {/* Status Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Pending', value: counts.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: 'Overdue', value: counts.overdue, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { label: 'Completed', value: counts.sent, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Skipped', value: counts.skipped, icon: SkipForward, color: 'text-slate-500', bg: 'bg-slate-50' },

                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="bg-white border border-slate-200/60 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center gap-4 group hover:shadow-md hover:border-slate-300 transition-all"
                                >
                                    <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{stat.value}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filter Tabs */}
                        <div className="bg-white border border-slate-200/60 p-2 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                                {[
                                    { key: 'pending', label: 'Pending', count: counts.pending },
                                    { key: 'sent', label: 'Completed', count: counts.sent },
                                    { key: 'skipped', label: 'Skipped', count: counts.skipped },
                                    { key: 'all', label: 'All', count: counts.total },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setFilter(tab.key)}
                                        className={cn(
                                            "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest cursor-pointer",
                                            filter === tab.key
                                                ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {tab.label} ({tab.count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Follow-Up Cards */}
                        {followUps.length === 0 ? (
                            <div className="bg-white border border-slate-200/60 border-dashed rounded-3xl py-20 text-center px-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                                    <Bell className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
                                    {filter === 'pending' ? 'No pending follow-ups' : 'No follow-ups found'}
                                </h3>
                                <p className="text-slate-500 max-w-sm mx-auto font-medium text-sm mb-6">
                                    {filter === 'pending'
                                        ? 'Click "Auto-Generate Follow-Ups" to create reminders for your sent applications.'
                                        : 'Change filter to view different follow-up statuses.'}
                                </p>
                                <button
                                    onClick={autoGenerateFollowUps}
                                    disabled={generatingFollowUps}
                                    className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl text-sm inline-flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generate Follow&#8209;Ups
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {followUps.map((followUp) => {
                                    const overdue = followUp.status === 'pending' && isOverdue(followUp.scheduledDate);
                                    const replied = hasHrReplied(followUp);

                                    return (
                                        <div
                                            key={followUp._id}
                                            className={cn(
                                                "bg-white border rounded-2xl lg:rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-md",
                                                replied ? "border-violet-200 bg-violet-50/20" :
                                                    overdue ? "border-rose-200 bg-rose-50/20" : "border-slate-200/60",
                                                followUp.status === 'sent' && "opacity-60",
                                                followUp.status === 'skipped' && "opacity-40"
                                            )}
                                        >
                                            {/* HR Replied Warning Banner */}
                                            {replied && followUp.status === 'pending' && (
                                                <div className="flex items-center gap-2.5 px-5 py-3 bg-violet-100/70 border-b border-violet-200">
                                                    <ShieldAlert className="w-4 h-4 text-violet-600 shrink-0" />
                                                    <p className="text-xs font-semibold text-violet-800">
                                                        HR has already replied to this application. Sending a follow-up now may be unnecessary or annoying.
                                                        Use the <strong>Reply</strong> button in Applications to respond instead.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="p-4 sm:p-6">
                                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                                    {/* Status Indicator */}
                                                    <div className={cn(
                                                        "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                                                        replied ? "bg-violet-100" :
                                                            overdue ? "bg-rose-100" :
                                                                followUp.status === 'sent' ? "bg-emerald-100" :
                                                                    followUp.status === 'skipped' ? "bg-slate-100" :
                                                                        "bg-amber-100"
                                                    )}>
                                                        {replied ? <MessageCircle className="w-5 h-5 text-violet-600" /> :
                                                            overdue ? <AlertTriangle className="w-5 h-5 text-rose-600" /> :
                                                                followUp.status === 'sent' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                                                                    followUp.status === 'skipped' ? <SkipForward className="w-5 h-5 text-slate-500" /> :
                                                                        <Clock className="w-5 h-5 text-amber-600" />
                                                        }
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                            <h4 className="text-sm font-bold text-slate-900 truncate flex-1">{followUp.recipient}</h4>
                                                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                                                {replied && (
                                                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight bg-violet-100 text-violet-700">
                                                                        HR Replied
                                                                    </span>
                                                                )}
                                                                <span className={cn(
                                                                    "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight",
                                                                    overdue ? "bg-rose-100 text-rose-700" :
                                                                        followUp.status === 'sent' ? "bg-emerald-100 text-emerald-700" :
                                                                            followUp.status === 'skipped' ? "bg-slate-100 text-slate-600" :
                                                                                "bg-amber-100 text-amber-700"
                                                                )}>
                                                                    {overdue ? 'Overdue' : followUp.status}
                                                                </span>
                                                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight bg-slate-100 text-slate-500">
                                                                    {getTimeDiff(followUp.scheduledDate)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                                                            {followUp.company && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                                    {followUp.company}
                                                                </div>
                                                            )}
                                                            {followUp.jobRole && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                                    {followUp.jobRole}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                {new Date(followUp.scheduledDate).toLocaleDateString('en-US', {
                                                                    month: 'short', day: 'numeric',
                                                                })}
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-slate-500 italic truncate">
                                                            &quot;{followUp.subject}&quot;
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    {followUp.status === 'pending' && (
                                                        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                                                            {replied ? (
                                                                /* If HR replied — show a disabled send + suggestion to use Reply instead */
                                                                <>
                                                                    <button
                                                                        disabled
                                                                        title="HR has already replied — send a Reply instead from Applications"
                                                                        className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-tight cursor-not-allowed flex items-center gap-1.5 border border-slate-200"
                                                                    >
                                                                        <Send className="w-3.5 h-3.5" />
                                                                        Blocked · HR Replied
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateFollowUp(followUp._id, { status: 'skipped' })}
                                                                        className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer border border-slate-200"
                                                                        title="Skip this follow-up"
                                                                    >
                                                                        <SkipForward className="w-4 h-4" />
                                                                    </button>
                                                                    {/* Individual Delete — two clicks */}
                                                                    <button
                                                                        onClick={() => handleDeleteClick(followUp._id)}
                                                                        className={cn(
                                                                            "p-2 rounded-xl transition-all cursor-pointer border text-xs font-bold flex items-center gap-1",
                                                                            pendingDeleteId === followUp._id
                                                                                ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                                                                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                                                        )}
                                                                        title={pendingDeleteId === followUp._id ? "Click again to confirm delete" : "Delete this follow-up"}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        {pendingDeleteId === followUp._id && <span className="text-[9px] uppercase tracking-tight">Confirm?</span>}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                /* Normal pending — show all actions */
                                                                <>
                                                                    <button
                                                                        onClick={() => sendFollowUp(followUp._id)}
                                                                        disabled={sendingFollowUpId === followUp._id}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-tight hover:bg-blue-700 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                                                    >
                                                                        {sendingFollowUpId === followUp._id ? (
                                                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                        ) : (
                                                                            <Send className="w-3.5 h-3.5" />
                                                                        )}
                                                                        {sendingFollowUpId === followUp._id ? 'Sending...' : 'Send Now'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openEditModal(followUp)}
                                                                        className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all cursor-pointer border border-slate-200"
                                                                        title="Edit message"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateFollowUp(followUp._id, { snoozeDays: 3 })}
                                                                        className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all cursor-pointer border border-slate-200"
                                                                        title="Snooze 3 days"
                                                                    >
                                                                        <Timer className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateFollowUp(followUp._id, { status: 'skipped' })}
                                                                        className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer border border-slate-200"
                                                                        title="Skip this follow-up"
                                                                    >
                                                                        <SkipForward className="w-4 h-4" />
                                                                    </button>
                                                                    {/* Individual Delete — two clicks */}
                                                                    <button
                                                                        onClick={() => handleDeleteClick(followUp._id)}
                                                                        className={cn(
                                                                            "p-2 rounded-xl transition-all cursor-pointer border text-xs font-bold flex items-center gap-1",
                                                                            pendingDeleteId === followUp._id
                                                                                ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                                                                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                                                        )}
                                                                        title={pendingDeleteId === followUp._id ? "Click again to confirm delete" : "Delete this follow-up"}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        {pendingDeleteId === followUp._id && <span className="text-[9px] uppercase tracking-tight">Confirm?</span>}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Delete button visible on all non-pending cards too */}
                                                    {followUp.status !== 'pending' && (
                                                        <button
                                                            onClick={() => handleDeleteClick(followUp._id)}
                                                            className={cn(
                                                                "shrink-0 p-2 rounded-xl transition-all cursor-pointer border flex items-center gap-1 text-xs font-bold",
                                                                pendingDeleteId === followUp._id
                                                                    ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                                                                    : "bg-slate-50 text-slate-300 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                                            )}
                                                            title={pendingDeleteId === followUp._id ? "Click again to confirm delete" : "Delete this follow-up"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            {pendingDeleteId === followUp._id && <span className="text-[9px] uppercase tracking-tight">Confirm?</span>}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Edit Modal */}
                    {editingFollowUp && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setEditingFollowUp(null)} />
                            <div className="bg-white max-w-2xl w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-5 duration-500 flex flex-col max-h-[90vh] overflow-hidden">
                                <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                            <Edit3 className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Edit Follow-Up</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingFollowUp.recipient}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEditingFollowUp(null)}
                                        className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Line</label>
                                        <input
                                            type="text"
                                            value={editForm.subject}
                                            onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                                        <textarea
                                            value={editForm.message}
                                            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                                            rows={10}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8 bg-white border-t border-slate-100 flex items-center gap-3 justify-end">
                                    <button
                                        onClick={() => setEditingFollowUp(null)}
                                        className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSave}
                                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
