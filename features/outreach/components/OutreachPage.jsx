"use client"
import React, { useState } from 'react'
import {
    FiZap, FiSend, FiMoreHorizontal,
    FiPlus, FiSearch, FiAlertTriangle, FiStar,
    FiMessageCircle, FiX, FiCheck, FiEye, FiTrash2
} from 'react-icons/fi';
import { Playfair_Display } from "next/font/google";

const serif = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const statusConfig = {
    ready: { label: "Ready", color: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
    pending: { label: "Pending", color: "bg-indigo-50 text-indigo-500 border-indigo-200", dot: "bg-indigo-500" },
    sent: { label: "Sent", color: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
};

const mockOutreachData = [
    { id: '1', hrName: 'Alex', email: 'alex@acmecorp.com', company: 'Acme Corp', role: 'Software Engineer', jobDescription: '', letter: 'A', status: 'pending', emailGenerated: false, emailPreview: null, emailSubject: "" },
    { id: '2', hrName: 'Sarah', email: 'sarah.m@globex.com', company: 'Globex', role: 'Frontend Developer', jobDescription: '', letter: 'G', status: 'ready', emailGenerated: true, emailPreview: "Hi Sarah,\n\nI noticed Globex is looking for a Frontend Developer. I have 3 years of experience with React and Next.js and would love to contribute to your team.\n\nBest,\nPankaj", emailSubject: "Application for Frontend Developer" },
    { id: '3', hrName: '—', email: 'careers@soylent.com', company: 'Soylent', role: 'Full Stack Engineer', jobDescription: '', letter: 'S', status: 'sent', emailGenerated: true, emailPreview: "Hello,\n\nI am writing to apply for the Full Stack Engineer position at Soylent. My background in Node.js and React perfectly aligns with your job description.\n\nThank you,\nPankaj", emailSubject: "Application for Full Stack Engineer" },
];

const Outreach = () => {
    const [contacts] = useState(mockOutreachData);
    const [showForm, setShowForm] = useState(false);
    const [previewContact, setPreviewContact] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState({ hrName: "", email: "", company: "", role: "", jobDescription: "" });
    const [activeDropdown, setActiveDropdown] = useState(null);

    const total = contacts.length;
    const pending = contacts.filter(c => c.status === 'pending').length;
    const ready = contacts.filter(c => c.status === 'ready').length;
    const sent = contacts.filter(c => c.status === 'sent').length;

    const filtered = contacts.filter(c =>
        !searchQuery ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            {/* Profile Alert — mock static display */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex gap-3 items-start shadow-sm mb-4">
                <FiAlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <p className="font-bold text-orange-800 text-[14px]">Your profile is incomplete</p>
                        <p className="text-[13px] text-orange-600 font-medium">Generated emails use <span className="font-bold">[Your Name]</span> as a placeholder.</p>
                    </div>
                    <a href="/dashboard/settings" className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white text-[13px] font-bold rounded-lg hover:opacity-90 transition-opacity shrink-0 w-fit">
                        Complete profile →
                    </a>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className={`text-[32px] md:text-[36px] font-bold text-text-dark leading-[1.1] mb-1 tracking-tight ${serif.className}`}>Daily Outreach</h1>
                    <p className="text-[15px] font-medium text-text">Add contacts, generate emails, and send applications</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => {}}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg text-[13px] font-bold text-white hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                    >
                        <FiStar size={16} />
                        AI Generate All
                    </button>
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary rounded-lg text-[13px] font-bold text-white hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                    >
                        <FiPlus size={16} />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 mb-5">
                {[
                    { label: "Total", value: total, color: "text-text", bg: "bg-surface" },
                    { label: "Pending", value: pending, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Ready", value: ready, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Sent", value: sent, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((s, i) => (
                    <div key={i} className="bg-background border border-border rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                            <span className={`text-[22px] font-extrabold ${s.color}`}>{s.value}</span>
                        </div>
                        <span className="font-bold text-muted text-[12px] tracking-[0.08em] uppercase">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Main Panel */}
            <section className="border border-border bg-background shadow-sm rounded-xl overflow-hidden w-full max-w-full">

                {/* Add Contact Form (expandable) */}
                {showForm && (
                    <div className="border-b border-border bg-surface p-5 lg:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FiPlus className="text-primary" size={18} />
                                <h3 className={`text-[17px] font-bold text-primary ${serif.className}`}>Add New Contact</h3>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-text cursor-pointer">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                            <input
                                type="text"
                                placeholder="HR Name (optional)"
                                value={form.hrName}
                                onChange={e => setForm(p => ({ ...p, hrName: e.target.value }))}
                                className="px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Company *"
                                value={form.company}
                                onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                                className="px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Role *"
                                value={form.role}
                                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                className="px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 bg-primary text-white rounded-lg text-[14px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-colors shadow-md shadow-primary/20 cursor-pointer"
                            >
                                <FiPlus size={16} /> Add
                            </button>
                        </div>
                        {/* JD Details — full width row */}
                        <div className="mt-3">
                            <textarea
                                placeholder="Job Description (optional)"
                                value={form.jobDescription}
                                onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                )}

                {/* Search bar */}
                <div className="p-4 border-b border-border flex gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search company, role, email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-background transition-all"
                        />
                    </div>
                </div>

                {/* Contact List */}
                {filtered.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center min-h-[200px]">
                        <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
                            <FiMessageCircle className="text-muted" size={24} />
                        </div>
                        <p className="text-muted font-bold text-[15px] mb-1">No contacts found</p>
                        <p className="text-muted text-[13px] font-medium">
                            {searchQuery ? "Try a different search term" : "Add a contact above to get started"}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 p-4 overflow-x-auto w-full">
                        {filtered.map((contact) => {
                            const cfg = statusConfig[contact.status] || statusConfig.pending;
                            return (
                                <div
                                    key={contact.id}
                                    className={`group flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5 border border-border rounded-lg hover:bg-surface transition-colors bg-background ${previewContact?.id === contact.id ? 'bg-indigo-50 border-primary/20' : ''}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 font-extrabold text-text text-[16px]">
                                            {contact.letter}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <p className="text-[14px] font-bold text-text-dark truncate">{contact.company}</p>
                                                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[11px] font-bold ${cfg.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-muted font-medium truncate">{contact.role} · {contact.email}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 justify-end shrink-0">
                                        {contact.status === 'pending' && (
                                            <button
                                                onClick={() => {}}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 text-primary rounded-lg text-[12px] font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                            >
                                                <FiZap size={12} /> Generate
                                            </button>
                                        )}
                                        {contact.status === 'ready' && (
                                            <>
                                                <button
                                                    onClick={() => setPreviewContact(previewContact?.id === contact.id ? null : contact)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg text-[12px] font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                                                >
                                                    <FiEye size={12} /> Preview
                                                </button>
                                                <button
                                                    onClick={() => {}}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[12px] font-bold hover:opacity-90 transition-colors shadow-sm shadow-primary/20 cursor-pointer"
                                                >
                                                    <FiSend size={12} /> Send
                                                </button>
                                            </>
                                        )}
                                        {contact.status === 'sent' && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-[12px] font-bold">
                                                <FiCheck size={12} /> Sent
                                            </div>
                                        )}
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === contact.id ? null : contact.id)}
                                                className="p-1.5 rounded-lg text-muted hover:text-text-dark hover:bg-surface transition-colors cursor-pointer"
                                            >
                                                <FiMoreHorizontal size={16} />
                                            </button>
                                            {activeDropdown === contact.id && (
                                                <div className="absolute right-0 top-8 z-10 w-40 bg-background border border-border rounded-xl shadow-lg py-1 text-[13px] font-semibold">
                                                    <button onClick={() => setActiveDropdown(null)} className="w-full flex items-center gap-2 px-4 py-2.5 text-text hover:bg-surface transition-colors text-left cursor-pointer">
                                                        <FiRefreshCw size={14} /> Regenerate
                                                    </button>
                                                    <button onClick={() => { setPreviewContact(contact); setActiveDropdown(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-text hover:bg-surface transition-colors text-left cursor-pointer">
                                                        <FiEye size={14} /> View Email
                                                    </button>
                                                    <button onClick={() => setActiveDropdown(null)} className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer">
                                                        <FiTrash2 size={14} /> Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Email Preview Popup Modal */}
            {previewContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPreviewContact(null)} />
                    <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden z-10 border border-border">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-extrabold text-primary text-[15px] shrink-0">
                                    {previewContact.letter}
                                </div>
                                <div className="min-w-0">
                                    <h3 className={`text-[17px] font-bold text-text-dark truncate ${serif.className}`}>Edit & Preview Email</h3>
                                    <p className="text-[12px] text-muted font-medium truncate">To: {previewContact.email} · {previewContact.company}</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewContact(null)} className="p-2 rounded-xl text-muted hover:bg-gray-200 transition-colors shrink-0 ml-3 cursor-pointer">
                                <FiX size={18} className="text-text" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-surface">
                            <div className="mb-4">
                                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={previewContact.emailSubject || ""}
                                    onChange={e => setPreviewContact(prev => prev ? { ...prev, emailSubject: e.target.value } : null)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-[14px] font-bold text-text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">Email Body</label>
                                <textarea
                                    value={previewContact.emailPreview || ""}
                                    onChange={e => setPreviewContact(prev => prev ? { ...prev, emailPreview: e.target.value } : null)}
                                    rows={12}
                                    className="w-full px-5 py-4 bg-background border border-border rounded-xl text-[14px] font-medium text-text-dark leading-relaxed resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-border bg-background flex justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => setPreviewContact(null)}
                                className="px-6 py-2.5 bg-background border border-border text-text rounded-xl text-[13px] font-bold hover:bg-surface transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setPreviewContact(null)}
                                className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl text-[14px] font-bold hover:opacity-90 transition-colors shadow-md shadow-primary/20 cursor-pointer"
                            >
                                <FiSend size={15} /> Final Submit & Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Outreach;