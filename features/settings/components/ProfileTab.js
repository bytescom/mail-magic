"use client"
import React, { useState } from 'react'
import { FiUploadCloud, FiTrash2, FiCheck, FiFileText, FiAlertTriangle } from 'react-icons/fi'

const mockProfile = {
    name: "Pankaj Me",
    headline: "Frontend Developer focused on AI",
    portfolioLink: "https://pankaj.me",
    experienceSummary: "I have 3 years of experience building scalable web applications using React and Next.js.",
    skills: ["React", "Next.js", "Tailwind CSS"]
};

const mockInitialDocs = [
    { id: 1, name: "Main Resume", docType: "resume", fileName: "Pankaj_Resume.pdf", sizeBytes: 1024500, isActive: true },
    { id: 2, name: "General Cover Letter", docType: "cover_letter", fileName: "Pankaj_Cover_Letter.pdf", sizeBytes: 450000, isActive: false }
];

const DOCTYPE_LABELS = {
    resume:       { label: "Resume",        color: "bg-blue-50 text-blue-600 border-blue-200" },
    cover_letter: { label: "Cover Letter",  color: "bg-violet-50 text-violet-600 border-violet-200" },
    other:        { label: "Other",          color: "bg-surface text-text border-border" },
};

const fmtBytes = (b) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(0)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

export default function ProfileTab() {
    const [form, setForm] = useState({
        name: mockProfile.name,
        headline: mockProfile.headline,
        portfolioLink: mockProfile.portfolioLink,
        experienceSummary: mockProfile.experienceSummary,
    });
    const [skills, setSkills] = useState(mockProfile.skills);
    const [skillInput, setSkillInput] = useState('');
    const [docs, setDocs] = useState(mockInitialDocs);
    const [docType, setDocType] = useState("resume");
    const [docName, setDocName] = useState("");

    const handleChange = (field, val) => {
        setForm(p => ({ ...p, [field]: val }));
    };

    const removeSkill = (skill) => {
        setSkills(prev => prev.filter(s => s !== skill));
    };

    const handleSkillAdd = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            const s = skillInput.trim();
            if (!skills.includes(s)) {
                setSkills(prev => [...prev, s]);
            }
            setSkillInput('');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-full overflow-x-hidden">
            {/* Section 1 — Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border last:border-0 first:pt-0 w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Personal Details</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Update your core identity used in AI-generated emails.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12.5px] font-medium text-text-dark">Full Name</label>
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

            {/* Section 2 — Portfolio & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border last:border-0 w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Portfolio & Skills</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Used to add technical context to your outreach.</p>
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
                        <div className="w-full min-h-[46px] px-2.5 py-2 bg-background border border-border rounded-lg outline-none focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-primary transition-all flex flex-wrap gap-2 items-center">
                            {skills.map(s => (
                                <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-md text-[13px] font-medium text-text-dark">
                                    {s}
                                    <button onClick={() => removeSkill(s)} className="text-muted hover:text-text-dark transition-colors cursor-pointer">
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
                                placeholder={skills.length === 0 ? "Add skills..." : "Type and press Enter"}
                                className="flex-1 min-w-[150px] outline-none text-[13px] bg-transparent text-text-dark placeholder:text-muted px-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3 — Background Summary */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border last:border-0 w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Background Summary</h3>
                    <p className="text-[13px] text-muted leading-relaxed">A tight 2–4 sentences describing your experience.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border last:border-0 w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Documents</h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                        Upload resume &amp; cover letters. Up to 5 files, 5 MB each.
                    </p>
                </div>
                <div className="flex flex-col gap-4 w-full">
                    {/* Existing docs list */}
                    {docs.length > 0 && (
                        <div className="flex flex-col gap-2 w-full">
                            {docs.map(doc => {
                                const cfg = DOCTYPE_LABELS[doc.docType] || DOCTYPE_LABELS.other;
                                return (
                                    <div
                                        key={doc.id}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                            doc.isActive
                                                ? "border-primary/30 bg-indigo-50 shadow-sm"
                                                : "border-border bg-background hover:bg-surface"
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                                            doc.isActive ? "bg-primary/10 border-primary/20" : "bg-surface border-border"
                                        }`}>
                                            <FiFileText size={15} className={doc.isActive ? "text-primary" : "text-text"} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[13px] font-bold text-text-dark truncate">{doc.name}</span>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                                {doc.isActive && (
                                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary text-white">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted font-medium mt-0.5 truncate">
                                                {doc.fileName} &middot; {fmtBytes(doc.sizeBytes)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {!doc.isActive && (
                                                <button
                                                    onClick={() => setDocs(p => p.map(d => d.id === doc.id ? { ...d, isActive: true } : d.docType === doc.docType ? { ...d, isActive: false } : d))}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-text rounded-lg text-[11px] font-bold hover:border-primary hover:text-primary transition-colors cursor-pointer"
                                                >
                                                    <FiCheck size={12} /> Use this
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDocs(p => p.filter(d => d.id !== doc.id))}
                                                className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                            >
                                                <FiTrash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Upload area */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(DOCTYPE_LABELS).map(([val, { label }]) => (
                                <button
                                    key={val}
                                    onClick={() => setDocType(val)}
                                    className={`px-4 py-2 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                                        docType === val
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "bg-background text-text border-border hover:border-primary hover:text-primary"
                                    }`}
                                >
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
                            <p className="text-[14px] font-semibold text-text-dark mb-0.5">
                                Upload {DOCTYPE_LABELS[docType].label}
                            </p>
                            <p className="text-[12px] text-muted">PDF or DOCX, up to 5 MB</p>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={() => {}}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
