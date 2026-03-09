'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Building2, User2, Mail, Clock, RefreshCw, ChevronDown,
    CheckCircle2, XCircle, Calendar, MessageCircle, Inbox,
    TrendingUp, AlertCircle, Filter, Search, X, Pencil,
    Loader2, Sparkles, SendHorizontal, BarChart3, ArrowUpRight,
    BriefcaseBusiness, Zap, Reply, ChevronRight, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Reply Templates ─────────────────────────────────────────────────────────────
const REPLY_TEMPLATES = {
    interview: [
        {
            id: 'interview_confirm',
            label: '✅ Confirm Interview',
            subject: 'Re: Interview Confirmation',
            body: `Dear {hrName},

Thank you so much for the interview opportunity! I am very excited about the prospect of joining {company}.

I confirm my availability for the interview. Please let me know the date, time, and format (in-person/video call) that works best for your team.

I look forward to speaking with you and learning more about the {role} role.

Best regards,
{yourName}`,
        },
        {
            id: 'interview_reschedule',
            label: '📅 Request Reschedule',
            subject: 'Re: Interview Schedule',
            body: `Dear {hrName},

Thank you for the interview invitation! I am very interested in the {role} position at {company}.

Unfortunately, I have a prior commitment at the suggested time. Could we possibly reschedule to another slot? I am flexible and available most mornings or afternoons — whatever works best for you.

I apologize for any inconvenience and look forward to our conversation.

Best regards,
{yourName}`,
        },
    ],
    positive: [
        {
            id: 'positive_thanks',
            label: '🙏 Thank You for Interest',
            subject: 'Re: Application Follow-up',
            body: `Dear {hrName},

Thank you for your kind response and for considering my application for the {role} role at {company}.

I remain very enthusiastic about this opportunity and would love to discuss how my experience can contribute to your team. Please feel free to reach out if you need any additional information.

Looking forward to the next steps!

Best regards,
{yourName}`,
        },
    ],
    negative: [
        {
            id: 'rejection_graceful',
            label: '🤝 Graceful Rejection Reply',
            subject: 'Re: Application Status',
            body: `Dear {hrName},

Thank you for taking the time to inform me about the decision regarding the {role} position at {company}.

While I am disappointed, I truly appreciate the opportunity to have been considered. I have great respect for your organization and would welcome the chance to be considered for future opportunities that may be a better fit.

Thank you again for your time and consideration.

Best regards,
{yourName}`,
        },
        {
            id: 'rejection_feedback',
            label: '💬 Ask for Feedback',
            subject: 'Re: Application Status — Feedback Request',
            body: `Dear {hrName},

Thank you for letting me know about the outcome of my application for the {role} position at {company}.

I completely understand and respect your decision. If it's not too much trouble, I would greatly appreciate any feedback on my application or interview that could help me improve for future opportunities.

Thank you for your time, and I hope our paths cross again.

Best regards,
{yourName}`,
        },
    ],
    neutral: [
        {
            id: 'neutral_followup',
            label: '📩 Acknowledge & Follow Up',
            subject: 'Re: Application for {role}',
            body: `Dear {hrName},

Thank you for your reply regarding my application for the {role} role at {company}.

I remain very interested in this opportunity and am happy to provide any additional information or materials you may need.

Looking forward to hearing from you.

Best regards,
{yourName}`,
        },
    ],
    generic: [
        {
            id: 'generic_custom',
            label: '✏️ Write Custom Reply',
            subject: 'Re: Application for {role} at {company}',
            body: '',
        },
    ],
};

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    sent: {
        label: 'Sent',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        icon: SendHorizontal,
    },
    'follow-up-sent': {
        label: 'Follow-up Sent',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
        icon: RefreshCw,
    },
    replied: {
        label: 'Replied',
        color: 'bg-teal-100 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
        icon: MessageCircle,
    },
    interview: {
        label: 'Interview',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-rose-100 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        icon: XCircle,
    },
    closed: {
        label: 'Closed',
        color: 'bg-slate-100 text-slate-500 border-slate-200',
        dot: 'bg-slate-400',
        icon: X,
    },
    draft: {
        label: 'Draft',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-400',
        icon: Pencil,
    },
};

const REPLY_TYPE_CONFIG = {
    interview: { label: 'Interview Invite', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    positive: { label: 'Positive', color: 'text-teal-600 bg-teal-50 border-teal-200' },
    negative: { label: 'Rejection', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    neutral: { label: 'Neutral Reply', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const ALL_STATUSES = ['all', 'sent', 'follow-up-sent', 'replied', 'interview', 'rejected', 'closed'];

// ── Reply Modal ─────────────────────────────────────────────────────────────────
function ReplyModal({ app, onClose, onSent }) {
    const replyType = app.replyType || 'generic';
    const templates = [
        ...(REPLY_TEMPLATES[replyType] || []),
        ...REPLY_TEMPLATES.generic,
    ];

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    // Fill variables in template text
    const fillTemplate = (text) => {
        return text
            .replace(/{hrName}/g, app.hrName || 'Hiring Manager')
            .replace(/{company}/g, app.companyName || 'your company')
            .replace(/{role}/g, app.role || 'the position')
            .replace(/{yourName}/g, ''); // user fills this
    };

    const selectTemplate = (tpl) => {
        setSelectedTemplate(tpl.id);
        setSubject(fillTemplate(tpl.subject));
        setBody(fillTemplate(tpl.body));
    };

    const handleSend = async () => {
        if (!body.trim()) {
            toast.error('Please write your reply message');
            return;
        }
        if (!app.gmailThreadId) {
            toast.error('No Gmail thread linked — cannot send in-thread reply');
            return;
        }

        setSending(true);
        try {
            const res = await fetch('/api/emails/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: app._id,
                    subject,
                    body,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`✅ Reply sent to ${app.hrEmail}!`);
                onSent();
                onClose();
            } else {
                toast.error(data.error || 'Failed to send reply');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="bg-white max-w-3xl w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-6 duration-400 flex flex-col max-h-[92vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Reply className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Reply to HR</h2>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                {app.hrName || app.hrEmail} · {app.companyName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

                    {/* Template Sidebar */}
                    <div className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-y-auto p-4 space-y-2 bg-slate-50/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
                            {replyType !== 'generic' ? `Templates for "${REPLY_TYPE_CONFIG[replyType]?.label || replyType}" replies` : 'Reply Templates'}
                        </p>
                        {templates.map((tpl) => (
                            <button
                                key={tpl.id}
                                onClick={() => selectTemplate(tpl)}
                                className={cn(
                                    'w-full text-left px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                                    selectedTemplate === tpl.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                                )}
                            >
                                {tpl.label}
                            </button>
                        ))}

                        {/* Reply preview */}
                        {app.lastReplyPreview && (
                            <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" /> HR&apos;s Reply
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-6 italic">
                                    &quot;{app.lastReplyPreview}&quot;
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Compose Area */}
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
                            {!selectedTemplate && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                                    <p className="text-xs text-amber-700 font-medium">
                                        Pick a template from the left, or write a custom reply below.
                                    </p>
                                </div>
                            )}

                            {/* To field */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">To</span>
                                <span className="text-sm text-slate-700 font-medium">{app.hrEmail}</span>
                                {app.gmailThreadId && (
                                    <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        In Thread ✓
                                    </span>
                                )}
                                {!app.gmailThreadId && (
                                    <span className="ml-auto text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        No Thread ✗
                                    </span>
                                )}
                            </div>

                            {/* Subject */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="Subject line..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-300 placeholder:font-normal"
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                                <textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    rows={12}
                                    placeholder="Write your reply here... Remember to add your name at the bottom."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium leading-relaxed focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all resize-none placeholder:text-slate-300 placeholder:font-normal"
                                />
                                <p className="text-[10px] text-slate-400 ml-1">
                                    {body.length} characters · Remember to add your name at the end
                                </p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 sm:p-8 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending || !body.trim() || !app.gmailThreadId}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl text-sm transition-all active:scale-95 cursor-pointer shadow-lg",
                                    sending || !body.trim() || !app.gmailThreadId
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                                )}
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <SendHorizontal className="w-4 h-4" />
                                        Send Reply via Gmail
                                    </>
                                )}
                            </button>
                            {!app.gmailThreadId && (
                                <p className="text-xs text-rose-500 mt-1 w-full text-center">
                                    ⚠️ No Gmail thread linked — open Gmail to reply manually
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [checkingReplies, setCheckingReplies] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingApp, setEditingApp] = useState(null);
    const [expandedApp, setExpandedApp] = useState(null);
    const [replyModalApp, setReplyModalApp] = useState(null); // App to reply to

    const fetchApplications = useCallback(async (filter = statusFilter) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('status', filter);
            const res = await fetch(`/api/applications?${params}`);
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
                setStats(data.stats || {});
            }
        } catch (err) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCheckReplies = async () => {
        setCheckingReplies(true);
        try {
            const res = await fetch('/api/reply-checker', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                if (data.newReplies > 0) {
                    toast.success(`🎉 Found ${data.newReplies} new reply${data.newReplies > 1 ? 's' : ''}!`);
                    fetchApplications(statusFilter);
                } else {
                    toast.info(`Checked ${data.checked} applications — no new replies yet`);
                }
            } else {
                toast.error(data.error || 'Reply check failed');
            }
        } catch {
            toast.error('Failed to check replies');
        } finally {
            setCheckingReplies(false);
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        try {
            const res = await fetch(`/api/applications/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success('Status updated');
                setApplications(prev =>
                    prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
                );
                fetchApplications(statusFilter);
            } else {
                toast.error('Failed to update status');
            }
        } catch {
            toast.error('Something went wrong');
        }
        setEditingApp(null);
    };

    const handleNotesChange = async (appId, notes) => {
        try {
            const res = await fetch(`/api/applications/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            if (res.ok) {
                toast.success('Notes saved');
                setApplications(prev =>
                    prev.map(app => app._id === appId ? { ...app, notes } : app)
                );
            }
        } catch {
            toast.error('Failed to save notes');
        }
        setEditingApp(null);
    };

    const handleDelete = async (appId) => {
        if (!confirm('Delete this application tracking record?')) return;
        try {
            const res = await fetch(`/api/applications/${appId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Application removed');
                setApplications(prev => prev.filter(app => app._id !== appId));
                fetchApplications(statusFilter);
            }
        } catch {
            toast.error('Failed to delete');
        }
    };

    const filteredApps = applications.filter(app => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            app.companyName?.toLowerCase().includes(q) ||
            app.role?.toLowerCase().includes(q) ||
            app.hrEmail?.toLowerCase().includes(q) ||
            app.hrName?.toLowerCase().includes(q)
        );
    });

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    };

    const daysAgo = (date) => {
        if (!date) return '';
        const diff = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return '1d ago';
        return `${diff}d ago`;
    };

    const isStale = (app) => {
        if (app.status !== 'sent' && app.status !== 'follow-up-sent') return false;
        const diff = (Date.now() - new Date(app.lastActionDate || app.createdAt)) / (1000 * 60 * 60 * 24);
        return diff >= 7;
    };

    // Show Reply button for apps that have received a reply
    const canReply = (app) => ['replied', 'interview', 'rejected'].includes(app.status) || app.replyType !== null;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* ── Page Header ─────────────────────────────────── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                                Tracking
                            </h2>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                Applications
                            </h1>
                            <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
                                Track every application, reply, and follow-up in one place.
                            </p>
                        </div>

                        <button
                            onClick={handleCheckReplies}
                            disabled={checkingReplies}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 cursor-pointer"
                        >
                            {checkingReplies
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <RefreshCw className="w-4 h-4" />}
                            {checkingReplies ? 'Checking Gmail...' : 'Check Replies'}
                        </button>
                    </div>

                    {/* ── Stats Row ────────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Total', value: stats.total || 0, icon: BarChart3, color: 'text-slate-700 bg-slate-50 border-slate-200' },
                            { label: 'Sent', value: stats.sent || 0, icon: SendHorizontal, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                            { label: 'Follow-ups', value: stats['follow-up-sent'] || 0, icon: RefreshCw, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                            { label: 'Replied', value: stats.replied || 0, icon: MessageCircle, color: 'text-teal-700 bg-teal-50 border-teal-200' },
                            { label: 'Interviews', value: stats.interview || 0, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                            { label: 'Rejected', value: stats.rejected || 0, icon: XCircle, color: 'text-rose-700 bg-rose-50 border-rose-200' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className={cn('border rounded-2xl p-4 flex flex-col gap-2', color)}>
                                <Icon className="w-4 h-4 opacity-60" />
                                <span className="text-2xl font-bold">{value}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pending follow-up alert */}
                    {stats.pendingFollowUp > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-sm font-medium text-amber-800">
                                <strong>{stats.pendingFollowUp}</strong> application{stats.pendingFollowUp > 1 ? 's' : ''} overdue for follow-up.
                                <span className="text-amber-600 ml-1">Follow-ups will be sent automatically by the daily cron job.</span>
                            </p>
                        </div>
                    )}

                    {/* ── Filters ──────────────────────────────────────── */}
                    <div className="flex flex-col gap-3">
                        {/* Scroll-scrollable status strip */}
                        <div className="overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-max min-w-full sm:w-auto">
                                {ALL_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setStatusFilter(s);
                                            fetchApplications(s);
                                        }}
                                        className={cn(
                                            'whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer',
                                            statusFilter === s
                                                ? 'bg-white shadow-sm text-slate-900 border border-slate-200'
                                                : 'text-slate-500 hover:text-slate-700'
                                        )}
                                    >
                                        {s === 'all' ? `All (${stats.total || 0})` : STATUS_CONFIG[s]?.label || s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search company, role, HR..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Applications List ─────────────────────────────── */}
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <BriefcaseBusiness className="w-7 h-7 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-600">No applications found</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {statusFilter === 'all'
                                            ? 'Send your first email from the Send page to start tracking.'
                                            : `No applications with status "${statusFilter}".`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile Card List (hidden on md+) ── */}
                                <div className="md:hidden divide-y divide-slate-50">
                                    {filteredApps.map(app => {
                                        const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.sent;
                                        const StatusIcon = statusCfg.icon;
                                        const replyTypeCfg = app.replyType ? REPLY_TYPE_CONFIG[app.replyType] : null;
                                        const stale = isStale(app);
                                        const isExpanded = expandedApp === app._id;
                                        const showReplyBtn = canReply(app);
                                        return (
                                            <div key={app._id} className={cn('p-4 transition-colors', stale && 'bg-amber-50/30')}>
                                                {/* Card header */}
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer"
                                                    onClick={() => setExpandedApp(isExpanded ? null : app._id)}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-sm">
                                                        {(app.companyName || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-bold text-slate-900 text-sm truncate">
                                                                {app.companyName || <span className="text-slate-400 italic">No Company</span>}
                                                            </p>
                                                            {stale && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Stale</span>}
                                                        </div>
                                                        <p className="text-xs text-slate-400 truncate">{app.role || '—'} · {app.hrName || app.hrEmail}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer hover:opacity-80', statusCfg.color)}
                                                            onClick={e => { e.stopPropagation(); setEditingApp({ id: app._id, field: 'status' }); }}
                                                        >
                                                            <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
                                                            {statusCfg.label}
                                                        </span>
                                                        <ChevronDown className={cn('w-4 h-4 text-slate-300 transition-transform', isExpanded && 'rotate-180')} />
                                                    </div>
                                                </div>

                                                {/* Status edit dropdown */}
                                                {editingApp?.id === app._id && editingApp?.field === 'status' && (
                                                    <div className="mt-3 px-1">
                                                        <select
                                                            autoFocus
                                                            defaultValue={app.status}
                                                            onChange={e => handleStatusChange(app._id, e.target.value)}
                                                            onBlur={() => setEditingApp(null)}
                                                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                                        >
                                                            {Object.keys(STATUS_CONFIG).map(s => (
                                                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Expanded detail */}
                                                {isExpanded && (
                                                    <div className="mt-3 space-y-3">
                                                        {/* Reply type badge */}
                                                        {replyTypeCfg && (
                                                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border', replyTypeCfg.color)}>
                                                                <Sparkles className="w-2.5 h-2.5" />
                                                                {replyTypeCfg.label}
                                                            </span>
                                                        )}
                                                        {/* HR reply preview */}
                                                        {app.lastReplyPreview && (
                                                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                                    <MessageCircle className="w-3 h-3" /> HR Reply
                                                                </p>
                                                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{app.lastReplyPreview}</p>
                                                            </div>
                                                        )}
                                                        {/* Notes */}
                                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                                <Pencil className="w-3 h-3" /> Notes
                                                            </p>
                                                            {editingApp?.id === app._id && editingApp?.field === 'notes' ? (
                                                                <div className="space-y-1">
                                                                    <textarea autoFocus defaultValue={app.notes} rows={3}
                                                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white"
                                                                        onBlur={e => handleNotesChange(app._id, e.target.value)}
                                                                    />
                                                                    <p className="text-[10px] text-slate-400">Click outside to save</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-slate-600 cursor-pointer hover:text-slate-800 min-h-[32px]"
                                                                    onClick={() => setEditingApp({ id: app._id, field: 'notes' })}>
                                                                    {app.notes || <span className="text-slate-300 italic">Tap to add notes...</span>}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {/* Meta chips + actions */}
                                                        <div className="flex flex-wrap gap-2">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                                                                <Mail className="w-3 h-3 text-slate-400" />
                                                                <span className="truncate max-w-[160px]">{app.hrEmail}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                                {formatDate(app.createdAt)}
                                                            </div>
                                                            {showReplyBtn && (
                                                                <button
                                                                    onClick={() => setReplyModalApp(app)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 cursor-pointer"
                                                                >
                                                                    <Reply className="w-3 h-3" /> Reply
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(app._id)}
                                                                className="ml-auto flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-2.5 py-1.5 hover:bg-rose-100 transition-all"
                                                            >
                                                                <XCircle className="w-3 h-3" /> Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ── Desktop Table (hidden below md) ── */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Company &amp; Role</th>
                                                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-4 hidden md:table-cell">HR Contact</th>
                                                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-4">Status</th>
                                                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-4 hidden lg:table-cell">Reply</th>
                                                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-4 hidden lg:table-cell">Sent</th>
                                                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-4 hidden xl:table-cell">Follow-up</th>
                                                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredApps.map(app => {
                                                const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.sent;
                                                const StatusIcon = statusCfg.icon;
                                                const replyTypeCfg = app.replyType ? REPLY_TYPE_CONFIG[app.replyType] : null;
                                                const stale = isStale(app);
                                                const isExpanded = expandedApp === app._id;
                                                const showReplyBtn = canReply(app);

                                                return (
                                                    <>
                                                        <tr
                                                            key={app._id}
                                                            className={cn(
                                                                'group hover:bg-slate-50/80 transition-colors cursor-pointer',
                                                                stale && 'bg-amber-50/30'
                                                            )}
                                                            onClick={() => setExpandedApp(isExpanded ? null : app._id)}
                                                        >
                                                            {/* Company & Role */}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-sm">
                                                                        {(app.companyName || '?')[0].toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-900 text-sm">
                                                                            {app.companyName || <span className="text-slate-400 italic">No Company</span>}
                                                                            {stale && <span className="ml-2 text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Stale</span>}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 mt-0.5">{app.role || '—'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* HR Contact */}
                                                            <td className="px-4 py-4 hidden md:table-cell">
                                                                <p className="text-sm font-medium text-slate-700">{app.hrName || '—'}</p>
                                                                <p className="text-xs text-slate-400 truncate max-w-[160px]">{app.hrEmail}</p>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="px-4 py-4">
                                                                {editingApp?.id === app._id && editingApp?.field === 'status' ? (
                                                                    <select
                                                                        autoFocus
                                                                        defaultValue={app.status}
                                                                        onChange={e => handleStatusChange(app._id, e.target.value)}
                                                                        onBlur={() => setEditingApp(null)}
                                                                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                                        onClick={e => e.stopPropagation()}
                                                                    >
                                                                        {Object.keys(STATUS_CONFIG).map(s => (
                                                                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer hover:opacity-80 transition-opacity',
                                                                            statusCfg.color
                                                                        )}
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setEditingApp({ id: app._id, field: 'status' });
                                                                        }}
                                                                        title="Click to change status"
                                                                    >
                                                                        <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
                                                                        {statusCfg.label}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Reply Type */}
                                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                                {replyTypeCfg ? (
                                                                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border', replyTypeCfg.color)}>
                                                                        <Sparkles className="w-2.5 h-2.5" />
                                                                        {replyTypeCfg.label}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-slate-300">—</span>
                                                                )}
                                                            </td>

                                                            {/* Sent date */}
                                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                                <p className="text-xs text-slate-500">{formatDate(app.createdAt)}</p>
                                                                <p className="text-[10px] text-slate-400">{daysAgo(app.createdAt)}</p>
                                                            </td>

                                                            {/* Follow-up date */}
                                                            <td className="px-4 py-4 hidden xl:table-cell">
                                                                {app.followUpDate && (app.status === 'sent' || app.status === 'follow-up-sent') ? (
                                                                    <div>
                                                                        <p className="text-xs text-slate-500">{formatDate(app.followUpDate)}</p>
                                                                        <p className="text-[10px] text-purple-500 font-medium">#{app.followUpCount + 1}</p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-slate-300">—</span>
                                                                )}
                                                            </td>

                                                            {/* Actions Column */}
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    {showReplyBtn && (
                                                                        <button
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                setReplyModalApp(app);
                                                                            }}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-blue-500/20 cursor-pointer uppercase tracking-wide"
                                                                            title="Reply to HR's email"
                                                                        >
                                                                            <Reply className="w-3 h-3" />
                                                                            Reply
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); setExpandedApp(isExpanded ? null : app._id); }}
                                                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                                    >
                                                                        <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* Expanded Detail Row */}
                                                        {isExpanded && (
                                                            <tr key={`${app._id}-detail`} className="bg-slate-50/60">
                                                                <td colSpan={7} className="px-6 py-5">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                        {/* Reply preview */}
                                                                        {app.lastReplyPreview && (
                                                                            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                                                    <MessageCircle className="w-3 h-3" /> Latest Reply from HR
                                                                                </p>
                                                                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                                                                                    {app.lastReplyPreview}
                                                                                </p>
                                                                                {showReplyBtn && (
                                                                                    <button
                                                                                        onClick={() => setReplyModalApp(app)}
                                                                                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                                                                                    >
                                                                                        <Reply className="w-3.5 h-3.5" />
                                                                                        Reply to this message →
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* Notes */}
                                                                        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                                                <Pencil className="w-3 h-3" /> Notes
                                                                            </p>
                                                                            {editingApp?.id === app._id && editingApp?.field === 'notes' ? (
                                                                                <div className="space-y-2">
                                                                                    <textarea
                                                                                        autoFocus
                                                                                        defaultValue={app.notes}
                                                                                        rows={3}
                                                                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                                                                        onBlur={e => handleNotesChange(app._id, e.target.value)}
                                                                                    />
                                                                                    <p className="text-[10px] text-slate-400">Click outside to save</p>
                                                                                </div>
                                                                            ) : (
                                                                                <p
                                                                                    className="text-sm text-slate-600 cursor-pointer hover:text-slate-800 min-h-[40px]"
                                                                                    onClick={() => setEditingApp({ id: app._id, field: 'notes' })}
                                                                                >
                                                                                    {app.notes || <span className="text-slate-300 italic">Click to add notes...</span>}
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        {/* Meta info */}
                                                                        <div className="flex flex-wrap gap-3 md:col-span-2">
                                                                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
                                                                                <Mail className="w-3 h-3 text-slate-400" />
                                                                                {app.hrEmail}
                                                                            </div>
                                                                            {app.gmailThreadId && (
                                                                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
                                                                                    <Zap className="w-3 h-3 text-blue-400" />
                                                                                    Thread tracked
                                                                                </div>
                                                                            )}
                                                                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
                                                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                                                Sent {formatDate(app.createdAt)}
                                                                            </div>
                                                                            {app.replyConfidence && (
                                                                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
                                                                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                                                                    AI confidence: {Math.round((app.replyConfidence || 0) * 100)}%
                                                                                </div>
                                                                            )}

                                                                            {/* Delete button */}
                                                                            <button
                                                                                onClick={() => handleDelete(app._id)}
                                                                                className="ml-auto flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 hover:bg-rose-100 transition-all"
                                                                            >
                                                                                <XCircle className="w-3 h-3" />
                                                                                Remove Record
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    <p className="text-xs text-slate-400 text-center pb-4">
                        Applications are auto-created when you send emails. Click status badges to update. Click <strong>Reply</strong> to respond to HR directly from Mail Magic.
                    </p>
                </div>

                {/* Reply Modal */}
                {replyModalApp && (
                    <ReplyModal
                        app={replyModalApp}
                        onClose={() => setReplyModalApp(null)}
                        onSent={() => fetchApplications(statusFilter)}
                    />
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
