"use client"
import React, { useState } from 'react'
import {
    FiPlus, FiX, FiCheck, FiClock, FiSkipForward, FiMoreHorizontal,
    FiAlertTriangle, FiRefreshCw, FiCalendar
} from 'react-icons/fi';
import { Playfair_Display } from "next/font/google";

const serif = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const sampleFollowUps = [
    {
        id: 1,
        company: "Jupiter AI Labs",
        role: "Full Stack Developer",
        letter: "J",
        hrEmail: "rupali.mishra@jupiterai.com",
        dueDate: "2026-04-07",
        scheduledNum: "#1",
        status: "pending",
    },
    {
        id: 2,
        company: "RayMach Technologies",
        role: "Python Intern",
        letter: "R",
        hrEmail: "annapurna.chandel@raym.tech",
        dueDate: "2026-04-05",
        scheduledNum: "#1",
        status: "overdue",
    },
    {
        id: 3,
        company: "Techasoft Pvt Ltd",
        role: "Python AI Intern",
        letter: "T",
        hrEmail: "yuvarani@techasoft.com",
        dueDate: "2026-03-30",
        scheduledNum: "#2",
        status: "completed",
    },
];

const tabs = ["PENDING", "COMPLETED", "SKIPPED", "ALL"];

const statusConfig = {
    pending: { label: "Pending", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600 border-amber-200" },
    overdue: { label: "Overdue", dot: "bg-red-500", badge: "bg-red-50 text-red-600 border-red-200" },
    completed: { label: "Completed", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    skipped: { label: "Skipped", dot: "bg-gray-400", badge: "bg-surface text-text border-border" },
};

const FollowUp = () => {
    const [activeTab, setActiveTab] = useState("PENDING");
    const [showForm, setShowForm] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [form, setForm] = useState({ company: "", role: "", email: "", dueDate: "", note: "" });

    const counts = {
        pending: sampleFollowUps.filter(f => f.status === 'pending' || f.status === 'overdue').length,
        overdue: sampleFollowUps.filter(f => f.status === 'overdue').length,
        completed: sampleFollowUps.filter(f => f.status === 'completed').length,
        skipped: sampleFollowUps.filter(f => f.status === 'skipped').length,
    };
    const total = sampleFollowUps.length;

    const getFiltered = () => {
        if (activeTab === "PENDING") return sampleFollowUps.filter(f => f.status === 'pending' || f.status === 'overdue');
        if (activeTab === "COMPLETED") return sampleFollowUps.filter(f => f.status === 'completed');
        if (activeTab === "SKIPPED") return sampleFollowUps.filter(f => f.status === 'skipped');
        return sampleFollowUps;
    };

    const getTabCount = (tab) => {
        if (tab === "PENDING") return counts.pending;
        if (tab === "COMPLETED") return counts.completed;
        if (tab === "SKIPPED") return counts.skipped;
        return total;
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const isOverdue = (dateStr) => new Date(dateStr) < new Date(new Date().toDateString());

    const filtered = getFiltered();

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold text-primary tracking-[0.1em] uppercase mb-1.5">Automation</p>
                    <h1 className={`text-[32px] md:text-[36px] font-bold text-text-dark leading-[1.1] mb-1 tracking-tight ${serif.className}`}>Follow-Up Manager</h1>
                    <p className="text-[15px] font-medium text-text">Stay top of mind with recruiters. Never miss a follow-up.</p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary shadow-md shadow-primary/20 rounded-lg text-[13px] font-bold text-white hover:opacity-90 transition-colors shrink-0 w-fit cursor-pointer"
                >
                    <FiPlus size={16} />
                    Add Follow-Up
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                {[
                    { label: "Pending", value: counts.pending, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Overdue", value: counts.overdue, color: "text-red-500", bg: "bg-red-50" },
                    { label: "Completed", value: counts.completed, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Skipped", value: counts.skipped, color: "text-text", bg: "bg-surface" },
                ].map((s, i) => (
                    <div key={i} className="bg-background border border-border rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                            <span className={`text-[22px] font-extrabold ${s.color}`}>{s.value}</span>
                        </div>
                        <span className="font-bold text-muted text-[12px] tracking-[0.08em] uppercase">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Main Section */}
            <section className="border border-border bg-background shadow-sm rounded-xl overflow-hidden mt-6 mb-8 w-full max-w-full">

                {/* Add form */}
                {showForm && (
                    <div className="border-b border-border bg-surface p-5 lg:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-[16px] font-bold text-primary ${serif.className}`}>Schedule a Follow-Up</h3>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                                <FiX size={16} className="text-text" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Company *"
                                value={form.company}
                                onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                                className="px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Role"
                                value={form.role}
                                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                className="px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <input
                                type="email"
                                placeholder="HR Email *"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <div className="relative sm:col-span-2 xl:col-span-1">
                                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={15} />
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="sm:col-span-2 xl:col-span-2 px-6 py-3 bg-primary text-white rounded-lg text-[14px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-colors shadow-md shadow-primary/20 cursor-pointer"
                            >
                                <FiPlus size={16} /> Schedule Follow-Up
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="px-5 py-3 border-b border-border">
                    <div className="bg-surface border border-border rounded-lg flex overflow-x-auto max-w-full">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 text-[13px] font-medium transition-all whitespace-nowrap sm:flex-1 text-center cursor-pointer ${activeTab === tab
                                    ? 'bg-background text-text-dark border-t-[3px] border-t-primary shadow-[0_-1px_0_0_theme(colors.gray.100)]'
                                    : 'text-muted hover:text-primary hover:bg-surface border-t-[3px] border-t-transparent'
                                    }`}
                            >
                                {tab} ({getTabCount(tab)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex flex-col gap-2 p-4 max-w-full overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="p-4 border-2 border-dashed border-border m-4 rounded-xl bg-surface py-12 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                                <FiClock className="text-primary" size={20} />
                            </div>
                            <p className="text-muted font-bold text-[14px] mb-1">Nothing here yet</p>
                            <button onClick={() => setShowForm(true)} className="text-primary font-bold text-[13px] hover:underline cursor-pointer">
                                + Schedule a follow-up
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border flex flex-col gap-2">
                            {filtered.map((fu) => {
                                const over = fu.status === 'pending' && isOverdue(fu.dueDate);
                                const displayStatus = over ? 'overdue' : fu.status;
                                const dispCfg = statusConfig[displayStatus] || statusConfig.pending;

                                return (
                                    <div
                                        key={fu.id}
                                        className={`group flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5 border rounded-xl transition-colors ${fu.status === 'overdue' || over ? 'border-red-200 bg-red-50/60 hover:bg-red-50' : 'border-border bg-background hover:bg-surface'}`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 font-extrabold text-text text-[15px]">
                                                {fu.company.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    <p className="text-[14px] font-bold text-text-dark truncate">{fu.company}</p>
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-[11px] font-bold ${dispCfg.badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${dispCfg.dot}`} />
                                                        {dispCfg.label}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-purple-500 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">{fu.scheduledNum}</span>
                                                </div>
                                                <p className="text-[12px] text-muted font-medium truncate">{fu.role} · {fu.hrEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                            {/* Due Date */}
                                            <div className="flex items-center gap-1.5">
                                                <FiCalendar size={13} className="text-muted" />
                                                <span className={`text-[12px] font-bold ${over || fu.status === 'overdue' ? 'text-red-500' : 'text-text'}`}>
                                                    {formatDate(fu.dueDate)}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === fu.id ? null : fu.id)}
                                                        className="p-1.5 rounded-lg text-muted hover:text-text-dark hover:bg-surface transition-colors cursor-pointer"
                                                    >
                                                        <FiMoreHorizontal size={16} />
                                                    </button>
                                                    {activeDropdown === fu.id && (
                                                        <div className="absolute right-0 top-8 z-10 w-36 bg-background border border-border rounded-xl shadow-lg py-1 text-[13px] font-semibold">
                                                            <button onClick={() => setActiveDropdown(null)} className="w-full flex items-center gap-2 px-3 py-2 text-text hover:bg-surface transition-colors text-left cursor-pointer">
                                                                <FiCheck size={13} /> Complete
                                                            </button>
                                                            <button onClick={() => setActiveDropdown(null)} className="w-full flex items-center gap-2 px-3 py-2 text-text hover:bg-surface transition-colors text-left cursor-pointer">
                                                                <FiSkipForward size={13} /> Skip
                                                            </button>
                                                            <button onClick={() => setActiveDropdown(null)} className="w-full flex items-center gap-2 px-3 py-2 text-text hover:bg-surface transition-colors text-left cursor-pointer">
                                                                <FiRefreshCw size={13} /> Reset
                                                            </button>
                                                            <button onClick={() => setActiveDropdown(null)} className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer">
                                                                <FiX size={13} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Overdue notice */}
                {counts.overdue > 0 && (
                    <div className="mx-4 mb-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                        <FiAlertTriangle className="text-orange-500 shrink-0" size={18} />
                        <p className="text-[13px] font-bold text-orange-700">
                            You have {counts.overdue} overdue follow-up{counts.overdue > 1 ? 's' : ''} — do not let them slip!
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default FollowUp;
