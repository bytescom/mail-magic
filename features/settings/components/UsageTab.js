"use client"

import React, { useState } from 'react'
import { FiZap, FiMail, FiCheck, FiInfo, FiCalendar, FiCpu, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'

const mockUsageData = {
    aiGenerationsUsed: 124,
    aiGenerationsLimit: 1000,
    emailsSentToday: 15,
    dailyEmailLimit: 100,
    emailsSentThisWeek: 65,
    weeklyEmailLimit: 500,
    geminiTokensUsed: 185420,
    geminiTokensLimit: 1000000,
    gmailConnected: true,
    gmailEmail: "pankaj@gmail.com"
};

// ── Animated Progress Bar ──────────────────────────────────────────────────
const ProgressBar = ({ pct, color }) => (
    <div className="w-full h-[6px] bg-surface rounded-full overflow-hidden">
        <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
            style={{ width: `${Math.max(pct, 1)}%` }}
        />
    </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon, iconBg, title, subtitle, used, limit, pct, barColor, unit = "used", badge }) => (
    <div className="bg-background rounded-2xl p-5 border border-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.10)] transition-all duration-300 group flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 group-hover:scale-110 transition-transform ${iconBg}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="text-[13px] font-bold text-text-dark leading-tight">{title}</h4>
                    <p className="text-[11px] text-muted font-medium mt-0.5">{subtitle}</p>
                </div>
            </div>
            {badge && (
                <span className="shrink-0 px-2 py-1 bg-primary/8 text-primary text-[10px] font-extrabold rounded-full border border-primary/20 uppercase tracking-wider">
                    {badge}
                </span>
            )}
        </div>

        {/* Numbers */}
        <div className="flex items-end justify-between">
            <div>
                <span className="text-[28px] font-extrabold text-text-dark tracking-tight leading-none">
                    {Number(limit - used).toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-muted ml-1.5">remaining</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">
                {Number(used).toLocaleString()} / {Number(limit).toLocaleString()}
            </span>
        </div>

        {/* Bar */}
        <div className="flex flex-col gap-1.5">
            <ProgressBar pct={pct} color={pct > 85 ? 'bg-gradient-to-r from-orange-400 to-red-500' : barColor} />
            <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold ${pct > 85 ? 'text-orange-500' : 'text-muted'}`}>
                    {pct}% {unit}
                </span>
                {pct > 85 && (
                    <span className="text-[10px] font-bold text-orange-500 animate-pulse">⚠ Running low</span>
                )}
            </div>
        </div>
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const UsageTab = () => {
    const [data] = useState(mockUsageData);
    const [refreshing, setRefreshing] = useState(false);

    const aiUsed      = data.aiGenerationsUsed;
    const aiLimit     = data.aiGenerationsLimit;
    const emailUsed   = data.emailsSentToday;
    const emailLimit  = data.dailyEmailLimit;
    const weekUsed    = data.emailsSentThisWeek;
    const weekLimit   = data.weeklyEmailLimit;
    const tokensUsed  = data.geminiTokensUsed;
    const tokensLimit = data.geminiTokensLimit;

    const aiPct      = Math.min(100, Math.round((aiUsed    / aiLimit)     * 100));
    const emailPct   = Math.min(100, Math.round((emailUsed / emailLimit)  * 100));
    const weekPct    = Math.min(100, Math.round((weekUsed  / weekLimit)   * 100));
    const tokenPct   = Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));

    const fmtTokens = (n) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(2)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-8 w-full max-w-full">

            {/* ── Section 1: Plan Quotas ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1.5 flex items-center gap-2">
                        <FiTrendingUp size={15} className="text-primary" /> Plan Quotas
                    </h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                        Track your usage across AI generations and email dispatches. Counters reset automatically.
                    </p>
                    <button
                        onClick={() => {
                            setRefreshing(true);
                            setTimeout(() => setRefreshing(false), 500);
                        }}
                        disabled={refreshing}
                        className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-primary hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                        <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <StatCard
                        icon={<FiZap size={17} className="text-purple-600" />}
                        iconBg="bg-purple-50 border-purple-100 text-purple-600"
                        title="AI Generations"
                        subtitle="Resets monthly"
                        used={aiUsed}
                        limit={aiLimit}
                        pct={aiPct}
                        barColor="bg-gradient-to-r from-purple-400 to-primary"
                        unit="used"
                    />
                    <StatCard
                        icon={<FiMail size={17} className="text-emerald-600" />}
                        iconBg="bg-emerald-50 border-emerald-100"
                        title="Daily Dispatch"
                        subtitle="Resets at UTC midnight"
                        used={emailUsed}
                        limit={emailLimit}
                        pct={emailPct}
                        barColor="bg-gradient-to-r from-emerald-400 to-emerald-600"
                        unit="used today"
                    />
                    <StatCard
                        icon={<FiCalendar size={17} className="text-blue-600" />}
                        iconBg="bg-blue-50 border-blue-100"
                        title="Weekly Dispatch"
                        subtitle="Resets every Monday"
                        used={weekUsed}
                        limit={weekLimit}
                        pct={weekPct}
                        barColor="bg-gradient-to-r from-blue-400 to-blue-600"
                        unit="used this week"
                    />
                </div>
            </div>

            {/* ── Section 2: Gemini Token Tracker ──────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1.5 flex items-center gap-2">
                        <FiCpu size={15} className="text-primary" /> Gemini Tokens
                    </h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                        Real-time token consumption tracked via Redis. Counts all prompt + response tokens used this month.
                    </p>
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg w-fit">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold text-text">Live tracking via Redis</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-text-dark to-text-dark rounded-2xl p-6 border border-slate-800 shadow-xl text-white relative overflow-hidden w-full">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] pointer-events-none" />

                    <div className="relative z-10 w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                                    <FiCpu size={16} className="text-purple-300" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-white">Gemini 2.0 Flash</p>
                                    <p className="text-[11px] text-white/50">Monthly token usage</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-white/80">Redis Sync</span>
                            </div>
                        </div>

                        {/* Token count */}
                        <div className="mb-5">
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-[40px] font-black text-white leading-none tracking-tight">
                                    {fmtTokens(tokensUsed)}
                                </span>
                                <span className="text-[14px] font-semibold text-white/50 mb-1.5">
                                    / {fmtTokens(tokensLimit)}
                                </span>
                            </div>
                            <p className="text-[12px] text-white/50 font-medium">tokens consumed this month</p>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        tokenPct > 85
                                            ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                            : 'bg-gradient-to-r from-purple-400 to-blue-400'
                                    }`}
                                    style={{ width: `${Math.max(tokenPct, 1)}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className={`text-[11px] font-bold ${tokenPct > 85 ? 'text-orange-400' : 'text-white/40'}`}>
                                {tokenPct}% used
                            </span>
                            <div className="flex items-center gap-4 text-[11px] font-semibold text-white/40">
                                <span>{fmtTokens(tokensLimit - tokensUsed)} remaining</span>
                                <span>·</span>
                                <span>Resets {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 3: Gmail Connection ───────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 py-8 w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1.5">Delivery Engine</h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                        Authorized Gmail account securely dispatching your applications.
                    </p>
                </div>

                <div className="flex items-center h-full w-full">
                    <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between w-full sm:max-w-md">
                        <div className="flex items-center gap-3 w-full min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${data.gmailConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-surface border-border text-muted'}`}>
                                {data.gmailConnected ? <FiCheck size={18} /> : <FiInfo size={18} />}
                            </div>
                            <div className="flex-1 truncate">
                                <h4 className="text-[14px] font-bold text-text-dark">Gmail OAuth Status</h4>
                                <p className={`text-[13px] truncate ${data.gmailConnected ? 'text-muted' : 'text-orange-500 font-medium'}`}>
                                    {data.gmailConnected ? data.gmailEmail : "Authorization required"}
                                </p>
                            </div>
                        </div>

                        {data.gmailConnected && (
                            <span className="ml-4 px-3 py-1 bg-emerald-100/50 text-emerald-700 text-[11px] font-bold rounded-full uppercase tracking-wider border border-emerald-200 shrink-0">
                                Active
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageTab;
