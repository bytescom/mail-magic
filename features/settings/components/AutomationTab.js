"use client"
import React, { useState, useEffect } from 'react'
import { FiChevronDown, FiSave, FiLoader } from 'react-icons/fi'

const AutomationTab = () => {
    const [behaviors, setBehaviors] = useState({
        attachResume: true,
        scheduleFollowups: true,
    });
    const [emailDelay, setEmailDelay] = useState(3000);
    const [tone, setTone] = useState('Formal & Professional');
    const [length, setLength] = useState('Concise Length');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        async function loadPrefs() {
            try {
                const res = await fetch('/api/user/profile');
                const { data } = await res.json();
                if (data?.settings) {
                    setBehaviors({
                        attachResume: data.settings.autoAttachResume ?? true,
                        scheduleFollowups: true,
                    });
                    setEmailDelay(data.settings.emailDelay ?? 3000);
                }
            } catch (e) {
                console.error('Failed to load automation prefs', e);
            } finally {
                setLoading(false);
            }
        }
        loadPrefs();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        autoAttachResume: behaviors.attachResume,
                        emailDelay: emailDelay,
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
        return <div className="flex items-center justify-center py-16"><FiLoader className="animate-spin text-primary" size={24} /></div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-full">
            {/* Email Engine */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Email Engine Setup</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Control how the AI generates outreach content.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12.5px] font-medium text-text-dark">Email Tone</label>
                        <div className="relative">
                            <select
                                value={tone}
                                onChange={e => setTone(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none appearance-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                            >
                                <option>Formal & Professional</option>
                                <option>Confident & Direct</option>
                                <option>Friendly & Approachable</option>
                            </select>
                            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12.5px] font-medium text-text-dark">Email Length</label>
                        <div className="relative">
                            <select
                                value={length}
                                onChange={e => setLength(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none appearance-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                            >
                                <option>Short (Action-oriented)</option>
                                <option>Concise Length</option>
                                <option>Detailed & Story-driven</option>
                            </select>
                            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12.5px] font-medium text-text-dark">Email Sending Delay</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={1000}
                                max={10000}
                                step={500}
                                value={emailDelay}
                                onChange={e => setEmailDelay(Number(e.target.value))}
                                className="flex-1 accent-primary"
                            />
                            <span className="text-[13px] font-bold text-text-dark w-16 text-right shrink-0">{(emailDelay / 1000).toFixed(1)}s</span>
                        </div>
                        <p className="text-[11px] text-muted">Delay between consecutive emails to avoid spam filters.</p>
                    </div>
                </div>
            </div>

            {/* Global Behaviors */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Global Behaviors</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Default settings applied to all outreach campaigns.</p>
                </div>
                <div className="flex flex-col gap-5 w-full lg:w-3/4">
                    {[
                        { id: 'attachResume', label: 'Auto-attach Resume', desc: 'Attach your PDF resume to every outgoing outreach email.' },
                        { id: 'scheduleFollowups', label: 'Schedule Follow-ups', desc: 'Automatically queue follow-up check-ins after initial send.' },
                    ].map((opt) => (
                        <div key={opt.id} className="flex items-start gap-3 cursor-pointer" onClick={() => setBehaviors(p => ({ ...p, [opt.id]: !p[opt.id] }))}>
                            <div
                                className={`relative mt-0.5 w-9 h-5 rounded-full transition-colors shrink-0 ${behaviors[opt.id] ? 'bg-primary' : 'bg-border'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${behaviors[opt.id] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-text-dark mb-0.5 leading-none">{opt.label}</h4>
                                <p className="text-[13px] text-muted">{opt.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save */}
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
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
}

export default AutomationTab;
