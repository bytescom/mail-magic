'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart3, TrendingUp, TrendingDown, Target, Activity, Clock,
    FileText, Building2, ArrowUp, ArrowDown, CheckCircle2, Users,
    Mail, ChevronRight, Sparkles, Zap, Calendar, Filter,
    BriefcaseBusiness, MessageCircle, ThumbsUp, ThumbsDown, Minus,
    RefreshCw, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FUNNEL_COLORS = [
    { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
    { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700' },
    { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
];

export default function AnalyticsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState(null);
    const [appData, setAppData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pipeline');

    useEffect(() => {
        if (session) fetchAll();
    }, [session]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [analyticsRes, appsRes] = await Promise.all([
                fetch('/api/analytics/advanced'),
                fetch('/api/applications?limit=100'),
            ]);
            if (analyticsRes.ok) setData(await analyticsRes.json());
            if (appsRes.ok) {
                const d = await appsRes.json();
                setAppData(d);
            }
        } catch { toast.error('Failed to load analytics'); }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Crunching your analytics...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const maxPeakCount = Math.max(...(data?.peakActivity?.map(d => d.count) || [1]), 1);
    const maxHourCount = Math.max(...(data?.hourDistribution?.map(h => h.count) || [1]), 1);
    const maxMonthly = Math.max(...(data?.monthlyData?.map(m => m.total) || [1]), 1);

    const funnel = data?.funnel || {};
    const appStats = appData?.stats || {};

    // Pipeline breakdown for application tracker
    const pipelineData = [
        { key: 'sent', label: 'Awaiting Reply', value: appStats.sent || 0, color: 'bg-blue-500', textColor: 'text-blue-700', lightBg: 'bg-blue-50', desc: 'Sent, no reply yet' },
        { key: 'followUpSent', label: 'Follow-up Sent', value: appStats.followUpSent || 0, color: 'bg-purple-500', textColor: 'text-purple-700', lightBg: 'bg-purple-50', desc: 'Follow-up dispatched' },
        { key: 'replied', label: 'Replied', value: appStats.replied || 0, color: 'bg-teal-500', textColor: 'text-teal-700', lightBg: 'bg-teal-50', desc: 'Got a response' },
        { key: 'interview', label: 'Interview', value: appStats.interview || 0, color: 'bg-emerald-500', textColor: 'text-emerald-700', lightBg: 'bg-emerald-50', desc: '🎉 Interview secured' },
        { key: 'rejected', label: 'Rejected', value: appStats.rejected || 0, color: 'bg-rose-400', textColor: 'text-rose-700', lightBg: 'bg-rose-50', desc: 'Not moving forward' },
        { key: 'closed', label: 'Closed', value: appStats.closed || 0, color: 'bg-slate-400', textColor: 'text-slate-600', lightBg: 'bg-slate-50', desc: 'Marked as closed' },
    ];
    const totalApps = appStats.total || 0;
    const totalReplied = (appStats.replied || 0) + (appStats.interview || 0) + (appStats.rejected || 0);
    const replyRate = totalApps > 0 ? ((totalReplied / totalApps) * 100).toFixed(1) : 0;
    const interviewRate = totalApps > 0 ? (((appStats.interview || 0) / totalApps) * 100).toFixed(1) : 0;
    const maxPipeVal = Math.max(...pipelineData.map(s => s.value), 1);

    const tabs = [
        { id: 'pipeline', label: 'Pipeline', icon: BriefcaseBusiness },
        { id: 'delivery', label: 'Delivery', icon: Mail },
        { id: 'timing', label: 'Timing', icon: Clock },
        { id: 'monthly', label: 'Monthly', icon: TrendingUp },
    ];

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <main className="w-full max-w-7xl mx-auto overflow-x-hidden">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* ── Header ── */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Intelligence</h2>
                                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                    Analytics &amp; Insights
                                </h1>
                                <p className="text-slate-500 max-w-xl text-xs sm:text-sm leading-relaxed">
                                    Deep insights into your application pipeline, response rates, and send timing.
                                </p>
                            </div>
                            <button onClick={fetchAll} className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all self-start">
                                <RefreshCw className="w-4 h-4" /> Refresh
                            </button>
                        </div>

                        {/* ── KPI Row ── */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                {
                                    label: 'Total Tracked', value: totalApps, icon: BriefcaseBusiness,
                                    color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Applications in tracker',
                                },
                                {
                                    label: 'Reply Rate', value: `${replyRate}%`, icon: MessageCircle,
                                    color: 'text-teal-600', bg: 'bg-teal-50', desc: 'Of tracked applications',
                                },
                                {
                                    label: 'Interview Rate', value: `${interviewRate}%`, icon: Sparkles,
                                    color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Secured from all apps',
                                    highlight: parseFloat(interviewRate) > 0,
                                },
                                {
                                    label: 'Delivery Rate', value: `${funnel.deliveryRate || 0}%`, icon: CheckCircle2,
                                    color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Email delivery success',
                                },
                            ].map((kpi) => (
                                <div key={kpi.label} className={cn(
                                    'bg-white border p-4 sm:p-5 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md',
                                    kpi.highlight ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/60'
                                )}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                                        <div className={cn('p-1.5 rounded-lg', kpi.bg)}>
                                            <kpi.icon className={cn('w-3.5 h-3.5', kpi.color)} />
                                        </div>
                                    </div>
                                    <p className={cn('text-2xl sm:text-3xl font-display font-bold', kpi.highlight ? 'text-emerald-600' : 'text-slate-900')}>{kpi.value}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">{kpi.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* ── Tabs ── */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
                                        activeTab === tab.id
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    )}
                                >
                                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* ── Tab: Pipeline ── */}
                        {activeTab === 'pipeline' && (
                            <div className="space-y-6">

                                {/* Pipeline Funnel Bars */}
                                <div className="bg-white border border-slate-200/60 rounded-2xl lg:rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 rounded-xl"><BriefcaseBusiness className="w-5 h-5 text-blue-600" /></div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Application Pipeline</h3>
                                            <p className="text-xs text-slate-400 font-medium">{totalApps} applications tracked · stages breakdown</p>
                                        </div>
                                    </div>
                                    <div className="p-5 sm:p-6 lg:p-8">
                                        {totalApps > 0 ? (
                                            <div className="space-y-4">
                                                {pipelineData.map((stage) => {
                                                    const pct = Math.round((stage.value / maxPipeVal) * 100);
                                                    const ofTotal = totalApps > 0 ? Math.round((stage.value / totalApps) * 100) : 0;
                                                    return (
                                                        <div key={stage.key}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn('w-3 h-3 rounded-full', stage.color)} />
                                                                    <span className="text-sm font-bold text-slate-900">{stage.label}</span>
                                                                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">— {stage.desc}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm font-display font-bold text-slate-900">{stage.value}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400">{ofTotal}%</span>
                                                                </div>
                                                            </div>
                                                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn('h-full rounded-full transition-all duration-1000', stage.color)}
                                                                    style={{ width: `${Math.max(pct, stage.value > 0 ? 2 : 0)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-16 text-center">
                                                <BriefcaseBusiness className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-slate-400">No tracked applications yet</p>
                                                <p className="text-xs text-slate-400 mt-1">Applications are auto-created when you send emails</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reply Classification + Conversion */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* Conversion Rates */}
                                    <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                                        <div className="absolute -bottom-10 -right-10 opacity-[0.04] pointer-events-none">
                                            <TrendingUp className="w-64 h-64" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">Conversion Funnel</p>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Sent → Replied', from: totalApps, to: totalReplied, color: 'bg-teal-500' },
                                                    { label: 'Replied → Interview', from: totalReplied, to: appStats.interview || 0, color: 'bg-emerald-500' },
                                                ].map(({ label, from, to, color }) => {
                                                    const rate = from > 0 ? ((to / from) * 100).toFixed(1) : 0;
                                                    return (
                                                        <div key={label}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-xs font-bold text-slate-400">{label}</p>
                                                                <p className="text-xl font-display font-bold text-white">{rate}%</p>
                                                            </div>
                                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div className={cn('h-full rounded-full transition-all duration-1000', color)}
                                                                    style={{ width: `${Math.max(parseFloat(rate), rate > 0 ? 2 : 0)}%` }} />
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 mt-1">{to} of {from}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Template Performance */}
                                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                            <div className="p-2.5 bg-violet-50 rounded-xl"><FileText className="w-5 h-5 text-violet-600" /></div>
                                            <div>
                                                <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Template Performance</h3>
                                                <p className="text-xs text-slate-400 font-medium">Best response-generating templates</p>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {data?.templatePerformance?.length > 0 ? (
                                                data.templatePerformance.map((tmpl) => (
                                                    <div key={tmpl._id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-all">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <p className="text-sm font-bold text-slate-900 truncate flex-1">{tmpl.templateName || 'Unnamed'}</p>
                                                            <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-bold',
                                                                tmpl.responseRate > 20 ? 'bg-emerald-100 text-emerald-700'
                                                                    : tmpl.responseRate > 0 ? 'bg-amber-100 text-amber-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                            )}>
                                                                {tmpl.responseRate}% response
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                                            <span>{tmpl.totalSent} sent</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span>{tmpl.responded} responded</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center">
                                                    <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-slate-400">No template data yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Role + Company Performance */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-2xl lg:rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                            <div className="p-2.5 bg-amber-50 rounded-xl"><Target className="w-5 h-5 text-amber-600" /></div>
                                            <div>
                                                <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Role Performance</h3>
                                                <p className="text-xs text-slate-400 font-medium">Response rates by job role</p>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {data?.rolePerformance?.length > 0 ? (
                                                data.rolePerformance.map((role, i) => (
                                                    <div key={role._id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-all">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0',
                                                                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                                                )}>{i + 1}</div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold text-slate-900 truncate">{role._id}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium">{role.companyCount} companies · {role.totalSent} sent</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0 ml-3">
                                                                <p className="text-sm font-display font-bold text-slate-900">{role.responseRate}%</p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase">response</p>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={cn('h-full rounded-full transition-all duration-1000',
                                                                role.responseRate > 20 ? 'bg-emerald-500' : role.responseRate > 0 ? 'bg-amber-500' : 'bg-slate-300'
                                                            )} style={{ width: `${Math.max(role.responseRate, 3)}%` }} />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center">
                                                    <Target className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-slate-400">No role data yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-2xl lg:rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                            <div className="p-2.5 bg-indigo-50 rounded-xl"><Building2 className="w-5 h-5 text-indigo-600" /></div>
                                            <div>
                                                <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Company Engagement</h3>
                                                <p className="text-xs text-slate-400 font-medium">Depth of engagement per company</p>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {data?.companyEngagement?.length > 0 ? (
                                                data.companyEngagement.map((company) => (
                                                    <div key={company._id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-all">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-sm font-bold text-slate-900 truncate flex-1">{company._id}</p>
                                                            <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-bold ml-2',
                                                                company.responseRate > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                            )}>
                                                                {company.responseRate}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                                            <span>{company.totalSent} emails</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span>{company.contactCount} contacts</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span>{company.responded} responded</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center">
                                                    <Building2 className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-slate-400">No company data yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Delivery ── */}
                        {activeTab === 'delivery' && (
                            <div className="space-y-6">
                                {/* Period Comparison */}
                                {data?.periodComparison && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                        <div className="bg-white border border-slate-200/60 p-5 sm:p-6 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 30 Days</p>
                                                <div className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold',
                                                    data.periodComparison.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
                                                    {data.periodComparison.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                    {Math.abs(data.periodComparison.change)}%
                                                </div>
                                            </div>
                                            <p className="text-3xl font-display font-bold text-slate-900">{data.periodComparison.current}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">applications sent</p>
                                        </div>
                                        <div className="bg-white border border-slate-200/60 p-5 sm:p-6 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Rate</p>
                                                <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                                            </div>
                                            <p className="text-3xl font-display font-bold text-emerald-600">{funnel.deliveryRate || 0}%</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">of emails delivered successfully</p>
                                        </div>
                                        <div className="bg-white border border-slate-200/60 p-5 sm:p-6 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response Rate</p>
                                                <div className="p-2 bg-blue-50 rounded-xl"><Target className="w-4 h-4 text-blue-600" /></div>
                                            </div>
                                            <p className="text-3xl font-display font-bold text-blue-600">{funnel.responseRate || 0}%</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">of contacts responded</p>
                                        </div>
                                    </div>
                                )}

                                {/* Application Funnel (email level) */}
                                <div className="bg-white border border-slate-200/60 rounded-2xl lg:rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 rounded-xl"><Filter className="w-5 h-5 text-blue-600" /></div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Email Delivery Funnel</h3>
                                            <p className="text-xs text-slate-400 font-medium">Your conversion pipeline at a glance</p>
                                        </div>
                                    </div>
                                    <div className="p-5 sm:p-6 lg:p-8">
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Total Contacts', value: funnel.totalContacts || 0, desc: 'All HR contacts in your list' },
                                                { label: 'Contacted', value: funnel.contacted || 0, desc: 'Applications sent' },
                                                { label: 'Responded', value: funnel.responded || 0, desc: 'Got a reply back' },
                                            ].map((step, i) => {
                                                const maxV = funnel.totalContacts || 1;
                                                const pct = maxV > 0 ? Math.round((step.value / maxV) * 100) : 0;
                                                const colors = FUNNEL_COLORS[i] || FUNNEL_COLORS[0];
                                                return (
                                                    <div key={step.label}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn('w-3 h-3 rounded-full', colors.bg)} />
                                                                <span className="text-sm font-bold text-slate-900">{step.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-display font-bold text-slate-900">{step.value}</span>
                                                                <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={cn('h-full rounded-full transition-all duration-1000', colors.bg)}
                                                                style={{ width: `${Math.max(pct, 2)}%` }} />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-medium mt-1">{step.desc}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Response Rate Timeline */}
                                <div className="bg-white border border-slate-200/60 rounded-2xl lg:rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-50 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Response Rate Timeline</h3>
                                            <p className="text-xs text-slate-400 font-medium">Weekly response rates over 90 days</p>
                                        </div>
                                    </div>
                                    <div className="p-5 sm:p-6 lg:p-8">
                                        {data?.responseTimeline?.length > 0 ? (
                                            <div className="space-y-3">
                                                {data.responseTimeline.map((week, i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="w-16 shrink-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Wk {week.week}</p>
                                                        </div>
                                                        <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                                                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                                                style={{ width: `${Math.max(week.rate, 2)}%` }} />
                                                            {week.rate > 15 && (
                                                                <span className="absolute inset-y-0 left-2 flex items-center text-[9px] font-bold text-white">{week.rate}%</span>
                                                            )}
                                                        </div>
                                                        <div className="w-20 text-right shrink-0">
                                                            <span className="text-xs font-bold text-slate-900">{week.responded}/{week.totalSent}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <TrendingUp className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-slate-400">No response timeline data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Timing ── */}
                        {activeTab === 'timing' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                                {/* Peak Days */}
                                <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-2xl lg:rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                        <div className="p-2.5 bg-rose-50 rounded-xl"><Calendar className="w-5 h-5 text-rose-600" /></div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Peak Days</h3>
                                            <p className="text-xs text-slate-400 font-medium">Most active days of the week</p>
                                        </div>
                                    </div>
                                    <div className="p-5 sm:p-6 lg:p-8">
                                        <div className="flex items-end gap-3 h-40">
                                            {data?.peakActivity?.map((day) => {
                                                const isMax = day.count === Math.max(...(data.peakActivity?.map(d => d.count) || [0]));
                                                return (
                                                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2 group">
                                                        <div className="w-full flex flex-col items-center h-32 justify-end">
                                                            <div className={cn('w-full max-w-10 rounded-lg transition-all duration-500',
                                                                isMax && day.count > 0 ? 'bg-blue-500' : 'bg-slate-200 group-hover:bg-slate-300'
                                                            )} style={{ height: `${Math.max((day.count / maxPeakCount) * 100, day.count > 0 ? 8 : 3)}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400">{day.day}</span>
                                                        <span className="text-[10px] font-bold text-slate-600">{day.count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Hourly Heatmap */}
                                <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-2xl lg:rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                        <div className="p-2.5 bg-cyan-50 rounded-xl"><Clock className="w-5 h-5 text-cyan-600" /></div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Hourly Activity</h3>
                                            <p className="text-xs text-slate-400 font-medium">When you send the most (last 30 days)</p>
                                        </div>
                                    </div>
                                    <div className="p-5 sm:p-6 lg:p-8">
                                        <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
                                            {data?.hourDistribution?.filter((_, i) => i >= 6 && i <= 23).map((hour) => {
                                                const intensity = maxHourCount > 0 ? hour.count / maxHourCount : 0;
                                                return (
                                                    <div key={hour.hour} className="flex flex-col items-center gap-1 group">
                                                        <div className={cn('w-full aspect-square rounded-lg transition-all duration-300 relative',
                                                            intensity === 0 ? 'bg-slate-100'
                                                                : intensity < 0.25 ? 'bg-blue-100'
                                                                    : intensity < 0.5 ? 'bg-blue-200'
                                                                        : intensity < 0.75 ? 'bg-blue-400'
                                                                            : 'bg-blue-600'
                                                        )}>
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                {hour.count}
                                                            </div>
                                                        </div>
                                                        <span className="text-[7px] sm:text-[8px] font-bold text-slate-400">{hour.hour}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center justify-end gap-2 mt-4">
                                            <span className="text-[9px] font-bold text-slate-400">Less</span>
                                            {[0, 0.25, 0.5, 0.75, 1].map((val, i) => (
                                                <div key={i} className={cn('w-3 h-3 rounded-sm',
                                                    val === 0 ? 'bg-slate-100' : val < 0.25 ? 'bg-blue-100' : val < 0.5 ? 'bg-blue-200' : val < 0.75 ? 'bg-blue-400' : 'bg-blue-600'
                                                )} />
                                            ))}
                                            <span className="text-[9px] font-bold text-slate-400">More</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Monthly ── */}
                        {activeTab === 'monthly' && (
                            <div className="space-y-6">
                                {data?.monthlyData?.length > 0 ? (
                                    <div className="bg-slate-900 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                                        <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none">
                                            <BarChart3 className="w-64 h-64" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2.5 bg-white/10 rounded-xl"><Activity className="w-5 h-5 text-blue-400" /></div>
                                                <div>
                                                    <h3 className="font-display font-bold text-xl text-white tracking-tight">Monthly Trends</h3>
                                                    <p className="text-xs text-slate-400 font-medium">6-month application volume</p>
                                                </div>
                                            </div>
                                            <div className="flex items-end gap-4 sm:gap-6 h-48">
                                                {data.monthlyData.map((month, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                                        <div className="w-full flex flex-col items-center h-40 justify-end gap-1">
                                                            {month.failed > 0 && (
                                                                <div className="w-full max-w-12 bg-rose-500/30 rounded-lg transition-all duration-500"
                                                                    style={{ height: `${Math.max((month.failed / maxMonthly) * 100, 5)}%` }} />
                                                            )}
                                                            <div className="w-full max-w-12 bg-blue-500 rounded-lg transition-all duration-500 group-hover:bg-blue-400 relative"
                                                                style={{ height: `${Math.max((month.sent / maxMonthly) * 100, month.sent > 0 ? 8 : 3)}%` }}>
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                    {month.sent}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400">{month.month}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-6 mt-4 text-xs font-bold text-slate-500">
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span>Sent</span></div>
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500/50" /><span>Failed</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-24 text-center bg-white rounded-2xl border border-slate-200/60">
                                        <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-400">No monthly data yet</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Send applications to start seeing trends</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </main>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
