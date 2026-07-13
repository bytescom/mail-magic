"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { FiUploadCloud, FiTrash2, FiCheck, FiFileText, FiSave, FiLoader } from 'react-icons/fi'

const DOCTYPE_LABELS = {
    resume:       { label: "Resume",        color: "bg-blue-50 text-blue-600 border-blue-200" },
    cover_letter: { label: "Cover Letter",  color: "bg-violet-50 text-violet-600 border-violet-200" },
    other:        { label: "Other",          color: "bg-surface text-text border-border" },
};

const fmtBytes = (b) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(0)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

export default function ProfileTab() {
    const { data: session } = useSession();
    const [form, setForm] = useState({ name: '', headline: '', portfolioLink: '', experienceSummary: '' });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [docs, setDocs] = useState([]);
    const [docType, setDocType] = useState("resume");
    const [docName, setDocName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch('/api/user/profile');
                const { data } = await res.json();
                if (data) {
                    setForm({
                        name: data.name || '',
                        headline: data.settings?.headline || '',
                        portfolioLink: data.settings?.portfolioLink || '',
                        experienceSummary: data.settings?.experienceSummary || '',
                    });
                    setSkills(data.settings?.skills || []);
                    // Merge all document arrays
                    const allDocs = [
                        ...(data.documents || []).map((d, i) => ({ ...d, id: d._id || `doc-${i}`, docType: d.docType || 'other', name: d.filename || d.name || 'Document' })),
                        ...(data.resumes || []).map((d, i) => ({ ...d, id: d._id || `res-${i}`, docType: 'resume', name: d.filename || 'Resume' })),
                        ...(data.coverLetters || []).map((d, i) => ({ ...d, id: d._id || `cl-${i}`, docType: 'cover_letter', name: d.filename || 'Cover Letter' })),
                    ];
                    setDocs(allDocs);
                }
            } catch (e) {
                console.error('Failed to load profile', e);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleChange = (field, val) => setForm(p => ({ ...p, [field]: val }));

    const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

    const handleSkillAdd = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            const s = skillInput.trim();
            if (!skills.includes(s)) setSkills(prev => [...prev, s]);
            setSkillInput('');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    settings: {
                        headline: form.headline,
                        portfolioLink: form.portfolioLink,
                        experienceSummary: form.experienceSummary,
                        skills,
                    }
                }),
            });
            if (res.ok) {
                setSaveMsg('Saved!');
                setTimeout(() => setSaveMsg(''), 3000);
            } else {
                setSaveMsg('Save failed. Try again.');
            }
        } catch (e) {
            setSaveMsg('Save failed. Try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <FiLoader className="animate-spin text-primary" size={24} />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-full overflow-x-hidden">
            {/* Section 1 — Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Personal Details</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Your identity used across all AI-generated emails.</p>
                </div>
                <div className="flex flex-col gap-5 w-full">
                    {/* Avatar row */}
                    {session?.user?.image && (
                        <div className="flex items-center gap-4">
                            <Image src={session.user.image} alt="Profile" width={56} height={56} className="rounded-2xl border border-border shadow-sm object-cover" />
                            <div>
                                <p className="text-[13px] font-bold text-text-dark">{session.user.name}</p>
                                <p className="text-[12px] text-muted">{session.user.email}</p>
                                <p className="text-[11px] text-muted mt-0.5">Connected via Google OAuth</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[12.5px] font-medium text-text-dark">Display Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => handleChange("name", e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[12.5px] font-medium text-text-dark">Professional Headline</label>
                            <input
                                type="text"
                                value={form.headline}
                                onChange={e => handleChange("headline", e.target.value)}
                                placeholder="e.g. Full Stack Developer focused on AI"
                                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2 — Portfolio & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Portfolio & Skills</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Used to add technical context to outreach emails.</p>
                </div>
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col gap-1.5 w-full md:w-3/4">
                        <label className="text-[12.5px] font-medium text-text-dark">LinkedIn / Portfolio URL</label>
                        <input
                            type="url"
                            value={form.portfolioLink}
                            onChange={e => handleChange("portfolioLink", e.target.value)}
                            placeholder="https://"
                            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12.5px] font-medium text-text-dark">Technical Skills</label>
                        <div className="w-full min-h-[46px] px-2.5 py-2 bg-background border border-border rounded-lg outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex flex-wrap gap-2 items-center">
                            {skills.map(s => (
                                <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-md text-[13px] font-medium text-text-dark">
                                    {s}
                                    <button onClick={() => removeSkill(s)} className="text-muted hover:text-red-500 transition-colors cursor-pointer">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillAdd}
                                placeholder={skills.length === 0 ? "Add skills and press Enter..." : "Type and press Enter"}
                                className="flex-1 min-w-[150px] outline-none text-[13px] bg-transparent text-text-dark placeholder:text-muted px-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3 — Background Summary */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Background Summary</h3>
                    <p className="text-[13px] text-muted leading-relaxed">A tight 2–4 sentences describing your experience. Used in AI email generation.</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                    <textarea
                        rows={4}
                        value={form.experienceSummary}
                        onChange={e => handleChange("experienceSummary", e.target.value)}
                        placeholder="Describe your experience tightly..."
                        className="w-full px-3.5 py-3 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
                    />
                </div>
            </div>

            {/* Section 4 — Documents */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Documents</h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                        Upload resume &amp; cover letters. Up to 5 files, 5 MB each.
                    </p>
                </div>
                <div className="flex flex-col gap-4 w-full">
                    {docs.length > 0 && (
                        <div className="flex flex-col gap-2 w-full">
                            {docs.map((doc, idx) => {
                                const cfg = DOCTYPE_LABELS[doc.docType] || DOCTYPE_LABELS.other;
                                return (
                                    <div key={doc.id || idx} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background hover:bg-surface transition-all">
                                        <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                                            <FiFileText size={15} className="text-text" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[13px] font-bold text-text-dark truncate">{doc.name}</span>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                                            </div>
                                            <p className="text-[11px] text-muted font-medium mt-0.5">{fmtBytes(doc.sizeBytes || doc.size || 0)}</p>
                                        </div>
                                        <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Upload area */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(DOCTYPE_LABELS).map(([val, { label }]) => (
                                <button key={val} onClick={() => setDocType(val)}
                                    className={`px-4 py-2 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${docType === val
                                        ? "bg-primary text-white border-primary shadow-sm"
                                        : "bg-background text-text border-border hover:border-primary hover:text-primary"}`}>
                                    {label}
                                </button>
                            ))}
                            <input
                                type="text"
                                placeholder="Label (optional)"
                                value={docName}
                                onChange={e => setDocName(e.target.value)}
                                className="flex-1 min-w-[160px] px-3.5 py-2 bg-background border border-border rounded-lg text-[13px] text-text-dark font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted"
                            />
                        </div>
                        <label className="relative border-2 border-dashed border-border bg-surface hover:bg-background rounded-xl p-7 flex flex-col items-center justify-center text-center hover:border-primary transition-all cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-3 text-text group-hover:text-primary transition-colors">
                                <FiUploadCloud size={18} />
                            </div>
                            <p className="text-[14px] font-semibold text-text-dark mb-0.5">Upload {DOCTYPE_LABELS[docType].label}</p>
                            <p className="text-[12px] text-muted">PDF or DOCX, up to 5 MB</p>
                            <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={() => {}} />
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 pt-6">
                {saveMsg && (
                    <span className={`text-[13px] font-bold ${saveMsg === 'Saved!' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {saveMsg}
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold shadow-sm hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer"
                >
                    {saving ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
