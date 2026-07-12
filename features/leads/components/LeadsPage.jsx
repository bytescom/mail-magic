"use client"
import React, { useState } from 'react'
import {
    FiUser, FiMoreHorizontal, FiUpload, FiPlus, FiSearch, FiTag,
    FiX, FiTrash2, FiFileText, FiChevronDown
} from 'react-icons/fi';
import { Playfair_Display } from "next/font/google";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const mockLeadsData = [
    { id: '1', email: 'hr@dataweave.com', company: 'DataWeave', role: 'SDE Intern', hrName: 'Rupali', jobDescription: '', tags: ['urgent'] },
    { id: '2', email: 'recruitment@techasoft.com', company: 'Techasoft', role: 'Full Stack Developer', hrName: 'John', jobDescription: '', tags: ['remote'] },
    { id: '3', email: 'sarah.m@jupiterai.com', company: 'Jupiter AI', role: 'Data Scientist', hrName: 'Sarah M', jobDescription: '', tags: [] },
    { id: '4', email: 'careers@accellor.com', company: 'Accellor', role: 'Frontend Dev', hrName: '—', jobDescription: '', tags: ['react', 'startup'] },
];

const LeadAccordionRow = ({ lead, onDelete }) => {
    const [open, setOpen] = useState(false);
    const initials = lead.company.charAt(0).toUpperCase();

    return (
        <div className={`border rounded-xl transition-all ${open ? 'border-primary/30 shadow-sm' : 'border-border'}`}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-background hover:bg-surface transition-colors text-left rounded-xl cursor-pointer"
            >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 font-extrabold text-text text-[15px]">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-text-dark truncate">{lead.company}</p>
                    <p className="text-[12px] text-muted font-medium truncate">{lead.role}</p>
                </div>
                <FiChevronDown className={`text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
            </button>

            {open && (
                <div className="bg-surface border-t border-border px-4 py-4 flex flex-col gap-3 rounded-b-xl">
                    <div className="flex items-start gap-2">
                        <FiMail size={13} className="text-muted mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-extrabold text-muted uppercase tracking-wider mb-0.5">HR Email</p>
                            <p className="text-[13px] font-semibold text-text break-all">{lead.email}</p>
                        </div>
                    </div>
                    {lead.hrName !== "—" && (
                        <div className="flex items-start gap-2">
                            <FiUser size={13} className="text-muted mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-extrabold text-muted uppercase tracking-wider mb-0.5">HR Name</p>
                                <p className="text-[13px] font-semibold text-text">{lead.hrName}</p>
                            </div>
                        </div>
                    )}
                    {lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {lead.tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold rounded-full">{tag}</span>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => onDelete(lead.id)}
                        className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 text-red-500 text-[12px] font-bold rounded-lg w-fit hover:bg-red-100 transition-colors cursor-pointer"
                    >
                        <FiTrash2 size={13} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};


const AddContactForm = ({ onClose }) => {
    const [form, setForm] = useState({ hrEmail: "", company: "", role: "", hrName: "", jobDescription: "", tagInput: "" });
    const [tags, setTags] = useState([]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleTagKey = (e) => {
        if ((e.key === "Enter" || e.key === ",") && form.tagInput.trim()) {
            e.preventDefault();
            const t = form.tagInput.trim().toLowerCase();
            if (!tags.includes(t)) setTags(prev => [...prev, t]);
            set("tagInput", "");
        }
    };

    const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl p-6 lg:p-8 z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FiPlus size={16} />
                        </div>
                        <h3 className={`text-[20px] font-bold text-text-dark ${serif.className}`}>Add New Contact</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface transition-colors cursor-pointer">
                        <FiX size={18} className="text-muted" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    <input type="email" placeholder="HR Email *" value={form.hrEmail} onChange={e => set("hrEmail", e.target.value)} className={inputCls} />
                    <input type="text"  placeholder="Company *"  value={form.company} onChange={e => set("company", e.target.value)} className={inputCls} />
                    <input type="text"  placeholder="Role *"     value={form.role}    onChange={e => set("role", e.target.value)}    className={inputCls} />
                    <input type="text" placeholder="HR Name (optional)" value={form.hrName} onChange={e => set("hrName", e.target.value)} className={inputCls} />

                    <div className="flex flex-wrap gap-1.5 items-center min-h-[46px] px-3 py-2 bg-surface border border-border rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                        {tags.map(t => (
                            <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold">
                                {t}
                                <button onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-red-500 transition-colors">×</button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder={tags.length === 0 ? "Tags — press Enter" : "Add more…"}
                            value={form.tagInput}
                            onChange={e => set("tagInput", e.target.value)}
                            onKeyDown={handleTagKey}
                            className="flex-1 min-w-[120px] outline-none text-[13px] bg-transparent text-text-dark placeholder:text-muted"
                        />
                    </div>

                    <textarea
                        placeholder="Job Description (optional)"
                        value={form.jobDescription}
                        onChange={e => set("jobDescription", e.target.value)}
                        rows={3}
                        className={`${inputCls} xl:col-span-3 resize-none leading-relaxed`}
                    />

                    <div className="xl:col-span-3 flex justify-end gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-background border border-border text-text rounded-lg text-[14px] font-semibold hover:bg-surface transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-2.5 bg-primary text-white rounded-lg text-[14px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-colors shadow-md shadow-primary/20 cursor-pointer"
                        >
                            <FiPlus size={16} /> Add Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Bulk CSV Import ────────────────────────────────────────────────────────
const BulkImportModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl p-6 pb-8 z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`text-[20px] font-bold text-text-dark ${serif.className}`}>Bulk Import CSV</h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface transition-colors cursor-pointer"><FiX size={18} /></button>
                </div>

                <div className="mb-4 p-3 bg-surface border border-border rounded-xl text-[12px] text-text font-medium">
                    <p className="font-bold text-text-dark mb-1">CSV column headers (in any order):</p>
                    <code className="text-primary">hrEmail, company, role</code> <span className="text-muted">— required</span><br />
                    <code className="text-text">hrName, jobDescription, tags</code> <span className="text-muted">— optional</span>
                </div>

                <label className="block mb-4 cursor-pointer border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-surface transition-all group">
                    <FiUpload size={24} className="mx-auto mb-2 text-muted group-hover:text-primary transition-colors" />
                    <p className="text-[14px] font-bold text-text group-hover:text-primary transition-colors">Click to upload CSV</p>
                    <p className="text-[12px] text-muted">or drag and drop</p>
                    <input type="file" accept=".csv,text/csv" className="hidden" onChange={onClose} />
                </label>

                <button onClick={onClose} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:opacity-90 transition-colors cursor-pointer">
                    Close
                </button>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
const Leads = () => {
    const [leads] = useState(mockLeadsData);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const filteredLeads = leads.filter(l => 
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] lg:h-full w-full min-h-0 max-w-full overflow-x-hidden">
            {/* Bulk Import Modal */}
            {showBulk && (
                <BulkImportModal onClose={() => setShowBulk(false)} />
            )}

            {/* Add Contact Modal */}
            {showForm && (
                <AddContactForm onClose={() => setShowForm(false)} />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-5">
                <div>
                    <p className="text-[12px] font-bold text-primary tracking-[0.1em] uppercase mb-2">Contacts</p>
                    <h1 className={`text-[32px] md:text-[36px] font-extrabold text-text-dark leading-[1.1] mb-2 tracking-tight ${serif.className}`}>HR & Recruiters</h1>
                    <p className="text-[15px] font-medium text-text">Maintain your network of HR contacts and recruitment professionals.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setShowBulk(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border rounded-lg text-[13px] font-bold text-text-dark hover:bg-surface transition-colors shadow-sm cursor-pointer"
                    >
                        <FiUpload size={16} className="text-text" /> Import CSV
                    </button>
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary shadow-md shadow-primary/20 rounded-lg text-[13px] font-bold text-white hover:opacity-90 transition-colors cursor-pointer"
                    >
                        <FiPlus size={16} /> Add Contact
                    </button>
                </div>
            </div>

            <section className="flex-1 flex flex-col min-h-0 border border-border bg-background shadow-sm rounded-xl max-w-full overflow-x-hidden">

                {/* Search */}
                <div className="p-4 border-b border-border flex gap-3 shrink-0">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by email, company, role, or tag..."
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-background transition-all"
                        />
                    </div>
                </div>

                {/* ── MOBILE: Accordion cards ── */}
                <div className="lg:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
                    {filteredLeads.length === 0 ? (
                        <p className="text-center text-muted font-bold py-10 text-[14px]">
                            {searchQuery ? "No contacts match your search." : "No contacts yet. Add your first one!"}
                        </p>
                    ) : filteredLeads.map((lead) => (
                        <LeadAccordionRow key={lead.id} lead={lead} onDelete={() => {}} />
                    ))}
                </div>

                {/* ── DESKTOP: Full table ── */}
                <div className="hidden lg:block flex-1 overflow-y-auto overflow-x-auto min-h-0 max-w-full">
                    <table className="w-full text-left border-separate border-spacing-y-1.5 px-3 min-w-[700px]">
                        <thead className="sticky top-0 bg-background z-10">
                            <tr>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-bold text-muted tracking-[0.1em] uppercase w-[26%] border-b border-border">Email</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-bold text-muted tracking-[0.1em] uppercase w-[20%] border-b border-border">Company</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-bold text-muted tracking-[0.1em] uppercase w-[18%] border-b border-border">Role</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-bold text-muted tracking-[0.1em] uppercase w-[14%] border-b border-border">HR Name</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-bold text-muted tracking-[0.1em] uppercase w-[15%] border-b border-border">Tags</th>
                                <th className="px-4 pb-2 pt-3 text-[11px] font-bold text-muted tracking-[0.1em] uppercase text-right border-b border-border"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center">
                                        <p className="text-muted font-bold text-[14px]">
                                            {searchQuery ? "No contacts match your search." : "No contacts yet — add your first one!"}
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-surface transition-colors border-[1px] border-border rounded-xl">
                                    <td className="px-4 py-3.5 rounded-l-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0 border border-border font-extrabold text-text text-[14px]">
                                                {lead.company.charAt(0)}
                                            </div>
                                            <span className="text-[13px] font-semibold text-text-dark truncate max-w-[200px]">{lead.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-[13px] font-semibold text-text truncate max-w-[150px]">{lead.company}</td>
                                    <td className="px-4 py-3.5 text-[13px] font-semibold text-text truncate max-w-[140px]">{lead.role}</td>
                                    <td className="px-4 py-3.5 text-[13px] text-muted font-medium">{lead.hrName}</td>
                                    <td className="px-4 py-3.5">
                                        {lead.tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {lead.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-full">{tag}</span>
                                                ))}
                                                {lead.tags.length > 3 && (
                                                    <span className="px-2 py-0.5 bg-surface text-muted text-[10px] font-bold rounded-full">+{lead.tags.length - 3}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-right rounded-r-xl">
                                        <div className="relative inline-block">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === lead.id ? null : lead.id)}
                                                className="p-2 text-muted hover:text-text-dark transition-colors rounded-full hover:bg-surface cursor-pointer"
                                            >
                                                <FiMoreHorizontal size={18} />
                                            </button>
                                            {activeDropdown === lead.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                                    <div className="absolute right-0 top-8 z-20 w-36 bg-background border border-border rounded-xl shadow-lg py-1 text-[13px] font-semibold">
                                                        <button
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer"
                                                        >
                                                            <FiTrash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border bg-surface shrink-0 rounded-b-xl">
                    <p className="text-[12px] font-medium text-muted">
                        {filteredLeads.length} contact{filteredLeads.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Leads;
