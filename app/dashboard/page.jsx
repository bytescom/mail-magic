'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    FileText, Users, CheckCircle2, XCircle, ArrowRight, Plus,
    Mail, Calendar, ChevronRight, Clock, AlertTriangle, BarChart3,
    Send, AlertCircle, Zap, Target, TrendingUp, Building2, Briefcase,
    Sparkles, Bell, Activity, BriefcaseBusiness, MessageCircle,
    RefreshCw, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ACTION_ICONS = {
    AlertTriangle, FileText, Users, Send, Clock, AlertCircle,
    BarChart3, CheckCircle2,
};

const ACTION_STYLES = {
    urgent: {
        bg: 'bg-rose-50', border: 'border-rose-200',
        iconBg: 'bg-rose-100', iconColor: 'text-rose-600',
        badge: 'bg-rose-100 text-rose-700', badgeText: 'Urgent',
    },
    setup: {
        bg: 'bg-blue-50', border: 'border-blue-200',
        iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700', badgeText: 'Setup',
    },
    action: {
        bg: 'bg-amber-50', border: 'border-amber-200',
        iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700', badgeText: 'Action',
    },
    warning: {
        bg: 'bg-orange-50', border: 'border-orange-200',
        iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700', badgeText: 'Warning',
    },
    info: {
        bg: 'bg-slate-50', border: 'border-slate-200',
        iconBg: 'bg-slate-100', iconColor: 'text-slate-600',
        badge: 'bg-slate-100 text-slate-600', badgeText: 'Info',
    },
};

const STATUS_DOT = {
    sent: 'bg-blue-400',
    'follow-up-sent': 'bg-purple-400',
    replied: 'bg-teal-400',
    interview: 'bg-emerald-500',
    rejected: 'bg-rose-400',
    closed: 'bg-slate-300',
};
const STATUS_LABEL = {
    sent: 'Sent',
    'follow-up-sent': 'Follow-up',
    replied: 'Replied',
    interview: 'Interview 🎉',
    rejected: 'Rejected',
    closed: 'Closed',
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingReplies, setCheckingReplies] = useState(false);

    useEffect(() => {
        if (session) fetchData();
    }, [session]);

    const fetchData = async () => {
        try {
            const [statsRes, insightsRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/insights'),
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            else toast.error('Failed to load statistics');
            if (insightsRes.ok) setInsights(await insightsRes.json());
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckReplies = async () => {
        setCheckingReplies(true);
        try {
            const res = await fetch('/api/reply-checker', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                if (data.newReplies > 0) {
                    toast.success(`🎉 Found ${data.newReplies} new reply${data.newReplies > 1 ? 's' : ''}!`);
                    fetchData();
                } else {
                    toast.info(`Checked ${data.checked} applications — no new replies`);
                }
            } else {
                toast.error(data.error || 'Reply check failed');
            }
        } catch { toast.error('Failed to check replies'); }
        finally { setCheckingReplies(false); }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Preparing your command center...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const pipeline = stats?.pipeline || {};
    const hasNextActions = stats?.nextActions?.length > 0;
    const hasFollowUps = stats?.upcomingFollowUps?.length > 0;
    const hasInsights = insights && (insights.dailyActivity?.length > 0 || insights.rolePerformance?.length > 0);
    const maxDailySent = Math.max(...(insights?.dailyActivity?.map(d => d.sent) || [1]), 1);

    // Pipeline stages
    const pipelineStages = [
        { key: 'sent', label: 'Sent', value: pipeline.sent || 0, color: 'bg-blue-500', light: 'bg-blue-50 border-blue-200 text-blue-700' },
        { key: 'follow-up-sent', label: 'Follow-ups', value: pipeline.followUpSent || 0, color: 'bg-purple-500', light: 'bg-purple-50 border-purple-200 text-purple-700' },
        { key: 'replied', label: 'Replied', value: pipeline.replied || 0, color: 'bg-teal-500', light: 'bg-teal-50 border-teal-200 text-teal-700' },
        { key: 'interview', label: 'Interviews', value: pipeline.interview || 0, color: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        { key: 'rejected', label: 'Rejected', value: pipeline.rejected || 0, color: 'bg-rose-400', light: 'bg-rose-50 border-rose-200 text-rose-700' },
    ];
    const maxStageVal = Math.max(...pipelineStages.map(s => s.value), 1);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <main className="w-full max-w-7xl mx-auto overflow-x-hidden">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* ── Header ─────────────────────────── */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-1">
                                <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Command Center</h2>
                                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                    Welcome back, {session?.user?.name?.split(' ')[0] || 'there'} 👋
                                </h1>
                                <p className="text-slate-500 max-w-lg text-xs sm:text-sm leading-relaxed">
                                    {pipeline.total > 0
                                        ? <>Tracking <span className="text-slate-900 font-semibold">{pipeline.total}</span> applications · <span className="text-emerald-600 font-semibold">{pipeline.interview}</span> interview{pipeline.interview !== 1 ? 's' : ''} · <span className="text-teal-600 font-semibold">{pipeline.replyRate}%</span> reply rate</>
                                        : <>You&apos;ve sent <span className="text-slate-900 font-semibold">{stats?.stats?.weekSent || 0}</span> applications this week. Keep the momentum going!</>
                                    }
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <button
                                    onClick={handleCheckReplies}
                                    disabled={checkingReplies}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-60 cursor-pointer shadow-sm"
                                >
                                    {checkingReplies ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    {checkingReplies ? 'Checking...' : 'Check Replies'}
                                </button>
                                <Link href="/send" className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 group">
                                    <Mail className="w-4 h-4" />
                                    <span>Send Applications</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* ── Next Actions ────────────────────── */}
                        {hasNextActions && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <Zap className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 tracking-tight">What to Do Next</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Prioritized suggestions</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    {stats.nextActions.map((action) => {
                                        const style = ACTION_STYLES[action.type] || ACTION_STYLES.info;
                                        const IconComp = ACTION_ICONS[action.icon] || Zap;
                                        return (
                                            <Link key={action.id} href={action.link}
                                                className={cn('p-5 sm:p-6 rounded-xl border transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] group', style.bg, style.border)}>
                                                <div className="flex items-start gap-4">
                                                    <div className={cn('p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110', style.iconBg)}>
                                                        <IconComp className={cn('w-5 h-5', style.iconColor)} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-sm font-bold text-slate-900 truncate">{action.title}</h4>
                                                            <span className={cn('px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide shrink-0', style.badge)}>{style.badgeText}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{action.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                                                    <span>Take action</span>
                                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Stats Grid — 4 core + pipeline spotlight ── */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                { name: 'Active Templates', value: stats?.stats?.totalTemplates || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Saved email drafts' },
                                { name: 'HR Contacts', value: stats?.stats?.totalHrEmails || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', description: 'Recruiter reach list' },
                                { name: 'Applications Sent', value: stats?.stats?.totalEmailsSent || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Delivery success' },
                                { name: 'Interviews', value: pipeline.interview || 0, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50', description: 'From tracked apps', highlight: (pipeline.interview || 0) > 0 },
                            ].map((stat) => (
                                <div key={stat.name}
                                    className={cn('bg-white border p-5 sm:p-6 space-y-4 sm:space-y-5 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-lg hover:border-slate-300/80 group cursor-default',
                                        stat.highlight ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200/60'
                                    )}>
                                    <div className="flex items-start justify-between">
                                        <div className={cn('p-2.5 sm:p-3 rounded-xl transition-transform group-hover:scale-110 duration-300', stat.bg)}>
                                            <stat.icon className={cn('w-5 h-5', stat.color)} />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                            Live <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                        <p className="text-sm font-semibold text-slate-700">{stat.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">{stat.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Application Pipeline ─────────────── */}
                        {pipeline.total > 0 && (
                            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 rounded-lg">
                                            <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Application Pipeline</h3>
                                            <p className="text-xs text-slate-400 font-medium">{pipeline.total} total · {pipeline.replyRate}% reply rate · {pipeline.interviewRate}% interview rate</p>
                                        </div>
                                    </div>
                                    <Link href="/applications" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors self-start sm:self-auto">
                                        View All →
                                    </Link>
                                </div>
                                <div className="p-5 sm:p-6">
                                    <div className="space-y-3">
                                        {pipelineStages.map((stage) => {
                                            const pct = maxStageVal > 0 ? Math.round((stage.value / maxStageVal) * 100) : 0;
                                            return (
                                                <div key={stage.key} className="flex items-center gap-4">
                                                    <div className="w-24 shrink-0">
                                                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border', stage.light)}>
                                                            {stage.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                                                        <div
                                                            className={cn('h-full rounded-full transition-all duration-1000', stage.color)}
                                                            style={{ width: `${Math.max(pct, stage.value > 0 ? 3 : 0)}%` }}
                                                        />
                                                        {stage.value > 0 && pct > 15 && (
                                                            <span className="absolute inset-y-0 left-3 flex items-center text-[9px] font-bold text-white">
                                                                {stage.value}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="w-8 text-right text-sm font-display font-bold text-slate-900 shrink-0">{stage.value}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pending follow-up alert */}
                                    {(pipeline.pendingFollowUp || 0) > 0 && (
                                        <div className="mt-5 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                            <p className="text-xs font-medium text-amber-800">
                                                <strong>{pipeline.pendingFollowUp}</strong> application{pipeline.pendingFollowUp > 1 ? 's' : ''} overdue for follow-up.
                                                <Link href="/applications" className="text-amber-600 font-bold ml-1 hover:underline">View →</Link>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ Insights Row ═══════════════════════ */}
                        {hasInsights && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

                                {/* 7-Day Activity Chart */}
                                <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">7-Day Activity</h3>
                                                <p className="text-[10px] text-slate-400 font-medium">Daily applications sent</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span>Sent</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400" /><span>Failed</span></div>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-end gap-3 h-32">
                                            {insights?.dailyActivity?.map((day) => (
                                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                                                    <div className="w-full flex flex-col items-center gap-1 h-24 justify-end">
                                                        {day.failed > 0 && (
                                                            <div className="w-full max-w-6 bg-rose-100 rounded-md transition-all duration-500 group-hover:bg-rose-200"
                                                                style={{ height: `${Math.max((day.failed / maxDailySent) * 100, 8)}%` }} />
                                                        )}
                                                        <div className="w-full max-w-6 bg-blue-500 rounded-md transition-all duration-500 group-hover:bg-blue-600 relative"
                                                            style={{ height: `${Math.max((day.sent / maxDailySent) * 100, day.sent > 0 ? 8 : 2)}%` }}>
                                                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                {day.sent}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{day.day}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Performing Roles */}
                                <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                            <Target className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">Top Roles</h3>
                                            <p className="text-[10px] text-slate-400 font-medium">Most applied job roles</p>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        {insights?.rolePerformance?.length > 0 ? (
                                            <div className="space-y-1">
                                                {insights.rolePerformance.map((role, i) => {
                                                    const maxCount = insights.rolePerformance[0]?.totalSent || 1;
                                                    const percentage = Math.round((role.totalSent / maxCount) * 100);
                                                    return (
                                                        <div key={role._id} className="p-3 rounded-lg hover:bg-slate-50 transition-all group">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0',
                                                                        i === 0 ? 'bg-emerald-100 text-emerald-700' : i === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                                                    )}>{i + 1}</div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-xs font-bold text-slate-900 truncate">{role._id}</p>
                                                                        <p className="text-[9px] text-slate-400 font-medium">{role.companies?.filter(c => c).length || 0} companies</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs font-display font-bold text-slate-900 shrink-0">{role.totalSent}</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={cn('h-full rounded-full transition-all duration-1000',
                                                                    i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-slate-400'
                                                                )} style={{ width: `${percentage}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <Briefcase className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-bold text-slate-400">No role data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Main Grid: Recent + Right Column ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-6 w-full overflow-x-hidden">

                            {/* Recent Applications (left) */}
                            <div className="lg:col-span-4 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
                                    <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Recent Applications</h3>
                                    <Link href="/applications" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                                        View Tracker
                                    </Link>
                                </div>

                                <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                    {stats?.recentApplications?.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {stats.recentApplications.map((app) => (
                                                <Link key={app._id} href="/applications"
                                                    className="flex items-center gap-3 p-3 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-[10px] group-hover:scale-105 transition-transform">
                                                        {(app.companyName || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-bold text-xs text-slate-900 truncate">{app.companyName || 'Unknown'}</p>
                                                            <span className="text-[9px] text-slate-400 truncate">{app.role || ''}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{app.hrEmail}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[app.status] || 'bg-slate-300')} />
                                                        <span className="text-[9px] font-bold text-slate-500 hidden sm:inline">{STATUS_LABEL[app.status] || app.status}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 px-6">
                                            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                                <Mail className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <p className="text-slate-900 font-bold text-sm">No applications yet.</p>
                                            <Link href="/send" className="mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-[10px] inline-flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
                                                Launch Wizard
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-3 space-y-3">

                                {/* Upcoming Follow-Ups */}
                                {hasFollowUps && (
                                    <>
                                        <div className="px-1 flex items-center justify-between">
                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Upcoming Follow-Ups</h3>
                                            <Link href="/follow-ups" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">View All</Link>
                                        </div>
                                        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                            <div className="divide-y divide-slate-50">
                                                {stats.upcomingFollowUps.map((followUp) => {
                                                    const isOverdue = new Date(followUp.scheduledDate) <= new Date();
                                                    const diffDays = Math.abs(Math.floor((new Date(followUp.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24)));
                                                    return (
                                                        <Link key={followUp._id} href="/follow-ups"
                                                            className="flex items-center gap-3 p-3 hover:bg-slate-50/50 transition-colors group">
                                                            <div className={cn('w-8 h-8 rounded-md flex items-center justify-center shrink-0', isOverdue ? 'bg-rose-50' : 'bg-amber-50')}>
                                                                {isOverdue ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-slate-900 truncate">{followUp.hrEmailId?.hrName || followUp.recipient}</p>
                                                                <p className="text-[10px] text-slate-500 truncate font-medium">{followUp.hrEmailId?.company || 'Unknown'}</p>
                                                            </div>
                                                            <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0', isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')}>
                                                                {isOverdue ? `${diffDays}d overdue` : diffDays === 0 ? 'Today' : `${diffDays}d`}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Success Rate Card */}
                                <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden group shadow-xl shadow-slate-900/20">
                                    <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                        <Calendar className="w-64 h-64" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Overall Success Rate</p>
                                        <div className="flex items-end gap-2 mb-4">
                                            <span className="text-3xl font-display font-bold text-blue-400 leading-none">{stats?.stats?.successRate || 0}%</span>
                                            {pipeline.total > 0 && (
                                                <div className="flex flex-col mb-0.5">
                                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">{pipeline.replyRate}% reply</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                                            <div className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${stats?.stats?.successRate || 0}%` }} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Sent', value: stats?.stats?.totalEmailsSent || 0 },
                                                { label: 'Replies', value: pipeline.total > 0 ? (pipeline.replied + pipeline.interview + pipeline.rejected) : (stats?.stats?.respondedContacts || 0) },
                                                { label: 'Interviews', value: pipeline.interview || 0 },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-white/5 rounded-lg p-2 border border-white/5">
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                                                    <p className="text-sm font-bold">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick link cards */}
                                <div className="grid grid-cols-1 gap-2">
                                    <Link href="/applications"
                                        className="bg-white border border-slate-200/60 p-3 rounded-xl flex items-center gap-3 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                            <BriefcaseBusiness className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs text-slate-900">Application Tracker</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Track every reply & follow-up</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                    </Link>

                                    <Link href="/hr-emails"
                                        className="bg-white border border-slate-200/60 p-3 rounded-xl flex items-center gap-3 group hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Users className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs text-slate-900">Clean Your Recruiter List</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Better data, higher response rates</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ── Bottom: Company Distribution + Weekly Trends ── */}
                        {hasInsights && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                                <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg"><Building2 className="w-4 h-4 text-indigo-600" /></div>
                                        <div>
                                            <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">Companies Reached</h3>
                                            <p className="text-[10px] text-slate-400 font-medium">Application distribution</p>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        {insights?.companyDistribution?.length > 0 ? (
                                            <div className="space-y-1">
                                                {insights.companyDistribution.map((company, i) => {
                                                    const maxC = insights.companyDistribution[0]?.count || 1;
                                                    const pct = Math.round((company.count / maxC) * 100);
                                                    const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                                                    return (
                                                        <div key={company._id} className="p-2.5 rounded-lg hover:bg-slate-50 transition-all">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-xs font-bold text-slate-900 truncate flex-1">{company._id}</p>
                                                                <span className="text-xs font-display font-bold text-slate-700 shrink-0 ml-2">{company.count}</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={cn('h-full rounded-full transition-all duration-1000', colors[i % colors.length])} style={{ width: `${pct}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <Building2 className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-bold text-slate-400">No company data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {insights?.responseTrends?.length > 0 && (
                                    <div className="lg:col-span-7 bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
                                        <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none">
                                            <TrendingUp className="w-64 h-64" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="p-2 bg-white/10 rounded-lg"><TrendingUp className="w-4 h-4 text-blue-400" /></div>
                                                <div>
                                                    <h3 className="font-display font-bold text-lg text-white tracking-tight">Weekly Trends</h3>
                                                    <p className="text-[10px] text-slate-400 font-medium">Application volume over time</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {insights.responseTrends.map((week, i) => (
                                                    <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Week {week._id.week}</p>
                                                        <p className="text-xl font-display font-bold text-white">{week.total}</p>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="text-[9px] font-bold text-emerald-400">{week.sent} sent</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bottom CTAs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                            <Link href="/analytics"
                                className="bg-white border border-slate-200/60 p-5 sm:p-6 rounded-xl flex items-center gap-5 group hover:shadow-lg hover:border-slate-300/80 transition-all">
                                <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6 text-violet-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Advanced Analytics</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Deep-dive into response rates & trends</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                            </Link>
                            <Link href="/career-tools"
                                className="bg-white border border-slate-200/60 p-5 sm:p-6 rounded-xl flex items-center gap-5 group hover:shadow-lg hover:border-slate-300/80 transition-all">
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Career Tools</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Optimize your resume & cover letters with AI</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                            </Link>
                        </div>

                    </div>
                </main>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
