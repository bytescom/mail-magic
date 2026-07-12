"use client"
import React, { useState } from 'react'
import {
    FiSend, FiArrowDownLeft, FiMoreHorizontal,
    FiCheckCircle, FiXCircle, FiRefreshCw, FiChevronDown,
    FiSearch, FiStar,
    FiBarChart2, FiRepeat, FiMessageCircle, FiMail, FiCalendar
} from 'react-icons/fi';
import { Playfair_Display } from "next/font/google";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const mockApps = [
    { company: 'Google', role: 'Software Engineer', letter: 'G', hrEmail: 'careers@google.com', hrName: '—', status: 'Replied', reply: 'We would like to schedule an interview.', sentDate: '10 May 2026', sentRelative: '2 days ago', followUpDate: '—', followUpCount: '' },
    { company: 'Amazon', role: 'SDE II', letter: 'A', hrEmail: 'recruiting@amazon.com', hrName: '—', status: 'Sent', reply: '—', sentDate: '05 May 2026', sentRelative: '7 days ago', followUpDate: '12 May 2026', followUpCount: '#1' },
    { company: 'Meta', role: 'Frontend Engineer', letter: 'M', hrEmail: 'jobs@meta.com', hrName: '—', status: 'Interview', reply: 'Next round scheduled for Friday.', sentDate: '01 May 2026', sentRelative: '11 days ago', followUpDate: '—', followUpCount: '' },
    { company: 'Apple', role: 'Backend Engineer', letter: 'A', hrEmail: 'hr@apple.com', hrName: '—', status: 'Rejected', reply: 'Thank you for your interest.', sentDate: '20 Apr 2026', sentRelative: '22 days ago', followUpDate: '—', followUpCount: '' },
    { company: 'Netflix', role: 'Senior Engineer', letter: 'N', hrEmail: 'careers@netflix.com', hrName: '—', status: 'Sent', reply: '—', sentDate: '12 May 2026', sentRelative: 'Today', followUpDate: '—', followUpCount: '' },
];

const TAB_FILTERS = {
    "ALL": () => true,
    "SENT": app => app.status === 'Sent',
    "FOLLOW-UP SENT": app => app.followUpCount !== '',
    "REPLIED": app => app.status === 'Replied',
    "INTERVIEW": app => app.status === 'Interview',
    "REJECTED": app => app.status === 'Rejected',
    "CLOSED": app => app.status === 'Closed',
};

const statusStyles = {
    "Replied": { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-600" },
    "Sent": { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", text: "text-blue-600" },
    "Interview": { bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500", text: "text-violet-600" },
    "Rejected": { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", text: "text-red-600" },
    "Closed": { bg: "bg-surface", border: "border-border", dot: "bg-gray-400", text: "text-text" },
};

// ── Accordion Row (mobile) ────────────────────────────────────────────────
const AccordionRow = ({ app }) => {
    const [open, setOpen] = useState(false);
    const ss = statusStyles[app.status] || statusStyles["Sent"];
    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${open ? 'border-primary/30 shadow-sm' : 'border-border'}`}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-background hover:bg-surface transition-colors text-left cursor-pointer"
            >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 font-extrabold text-text text-[15px]">
                    {app.letter}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-text-dark truncate">{app.company}</p>
                    <p className="text-[12px] text-muted font-medium truncate">{app.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${ss.bg} border ${ss.border} rounded-full`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                        <span className={`text-[11px] font-extrabold ${ss.text}`}>{app.status}</span>
                    </div>
                    <FiChevronDown className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
                </div>
            </button>

            {open && (
                <div className="bg-surface border-t border-border px-4 py-4 flex flex-col gap-3">
                    <DetailRow icon={<FiMail size={13} />} label="HR Email" value={app.hrEmail} />
                    <DetailRow icon={<FiMail size={13} />} label="HR Name" value={app.hrName} />
                    <DetailRow icon={<FiStar size={13} />} label="Reply" value={app.reply} />
                    <DetailRow icon={<FiCalendar size={13} />} label="Sent" value={`${app.sentDate} · ${app.sentRelative}`} />
                    {app.followUpDate !== '—' && (
                        <DetailRow icon={<FiRepeat size={13} />} label="Follow-Up" value={`${app.followUpDate} ${app.followUpCount}`} />
                    )}
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <span className="text-muted mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0">
            <p className="text-[10px] font-extrabold text-muted uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-[13px] font-semibold text-text break-all">{value}</p>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const Tracking = () => {
    const [activeTab, setActiveTab] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const metrics = {
        total: mockApps.length,
        sent: mockApps.filter(a => a.status === 'Sent').length,
        followUps: mockApps.filter(a => a.followUpCount).length,
        replied: mockApps.filter(a => a.status === 'Replied').length,
        interviews: mockApps.filter(a => a.status === 'Interview').length,
        rejected: mockApps.filter(a => a.status === 'Rejected').length,
    };

    const tabDisplayNames = ["ALL", "SENT", "FOLLOW-UP SENT", "REPLIED", "INTERVIEW", "REJECTED", "CLOSED"];

    const filtered = mockApps.filter(TAB_FILTERS[activeTab] || (() => true)).filter(app =>
        !searchQuery ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.hrEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold text-primary tracking-[0.1em] uppercase mb-1.5">Tracking</p>
                    <h1 className={`text-[32px] md:text-[36px] font-bold text-text-dark leading-[1.1] mb-1 tracking-tight ${serif.className}`}>Applications</h1>
                    <p className="text-[15px] font-medium text-text">Track every application, reply, and follow-up in one place.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-primary shadow-md shadow-primary/20 rounded-lg text-[13px] font-bold text-white hover:opacity-90 transition-colors shrink-0 w-fit cursor-pointer">
                    <FiRefreshCw size={15} /> Check Replies
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-6">
                {[
                    { label: "Total", value: metrics.total, icon: <FiBarChart2 size={17} />, color: "text-text", iconColor: "text-muted", bg: "bg-surface" },
                    { label: "Sent", value: metrics.sent, icon: <FiSend size={17} />, color: "text-blue-500", iconColor: "text-blue-500", bg: "bg-indigo-50" },
                    { label: "Follow-ups", value: metrics.followUps, icon: <FiRepeat size={17} />, color: "text-purple-500", iconColor: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Replied", value: metrics.replied, icon: <FiMessageCircle size={17} />, color: "text-emerald-500", iconColor: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Interviews", value: metrics.interviews, icon: <FiCheckCircle size={17} />, color: "text-emerald-500", iconColor: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Rejected", value: metrics.rejected, icon: <FiXCircle size={17} />, color: "text-red-500", iconColor: "text-red-500", bg: "bg-red-50" },
                ].map((m, i) => (
                    <div key={i} className={`${m.bg} border border-border rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm`}>
                        <span className={m.iconColor}>{m.icon}</span>
                        <div>
                            <span className={`text-[24px] font-extrabold leading-none ${m.color}`}>{m.value}</span>
                            <p className="text-[10px] font-bold text-muted tracking-widest uppercase mt-1">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Section */}
            <section className="border border-border bg-background shadow-sm rounded-xl overflow-hidden mt-6 mb-8 w-full max-w-full">

                {/* Tabs */}
                <div className="px-5 py-3 border-b border-border">
                    <div className="bg-surface border border-border rounded-lg flex overflow-x-auto max-w-full">
                        {tabDisplayNames.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 text-[13px] font-medium transition-all whitespace-nowrap sm:flex-1 text-center cursor-pointer ${activeTab === tab
                                        ? 'bg-background text-text-dark border-t-[3px] border-t-primary shadow-[0_-1px_0_0_theme(colors.gray.100)]'
                                        : 'text-muted hover:text-primary hover:bg-surface border-t-[3px] border-t-transparent'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-border">
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search company, role, HR email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-background transition-all"
                        />
                    </div>
                </div>

                {/* ── MOBILE: Accordion cards ── */}
                <div className="lg:hidden flex flex-col gap-2 p-4">
                    {filtered.length === 0 ? (
                        <p className="text-center text-muted font-bold py-10 text-[14px]">No applications match this filter.</p>
                    ) : filtered.map((app, idx) => <AccordionRow key={idx} app={app} />)}
                </div>

                {/* ── DESKTOP: Full table (with scroll support) ── */}
                <div className="hidden lg:block overflow-x-auto max-w-full min-h-0">
                    <table className="w-full text-left border-separate border-spacing-y-1.5 px-3 min-w-[900px]">
                        <thead>
                            <tr className="bg-background">
                                <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[26%] border-b border-border">Company & Role</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[22%] border-b border-border">HR Contact</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[12%] border-b border-border">Status</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[14%] border-b border-border">Reply</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[13%] border-b border-border">Sent</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[13%] border-b border-border">Follow-Up</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase text-right border-b border-border"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-10 text-center"><p className="text-muted font-bold text-[14px]">No applications match this filter.</p></td></tr>
                            ) : filtered.map((app, idx) => {
                                const ss = statusStyles[app.status] || statusStyles["Sent"];
                                return (
                                    <tr key={idx} className="group hover:bg-surface transition-colors border border-border rounded-xl bg-background">
                                        <td className="px-4 py-3.5 rounded-l-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0 border border-border font-extrabold text-text text-[14px]">{app.letter}</div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-text-dark">{app.company}</p>
                                                    <p className="text-[11px] font-medium text-muted">{app.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-[12px] font-bold text-text">{app.hrName}</p>
                                            <p className="text-[11px] font-medium text-muted truncate max-w-[180px]">{app.hrEmail}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${ss.bg} border ${ss.border} rounded-full`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                                <span className={`text-[11px] font-extrabold tracking-wide ${ss.text}`}>{app.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {app.reply === '—' ? (
                                                <span className="text-muted font-medium">—</span>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-full">
                                                    <FiStar className="text-muted" size={11} />
                                                    <span className="text-[11px] font-bold text-text truncate max-w-[120px]">{app.reply}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-[12px] font-medium text-text">{app.sentDate}</p>
                                            <p className="text-[11px] font-medium text-muted">{app.sentRelative}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {app.followUpDate === '—' ? (
                                                <span className="text-muted font-medium">—</span>
                                            ) : (
                                                <div>
                                                    <p className="text-[12px] font-medium text-text">{app.followUpDate}</p>
                                                    <p className="text-[11px] font-extrabold text-purple-500">{app.followUpCount}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right rounded-r-xl">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 rounded-lg text-muted hover:text-text-dark hover:bg-surface transition-colors cursor-pointer">
                                                    <FiMoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                <div className="px-5 py-3 border-t border-border bg-surface rounded-b-xl">
                    <p className="text-[12px] font-medium text-muted">Showing {filtered.length} of {mockApps.length} applications</p>
                </div>
            </section>
        </div>
    );
};

export default Tracking;
