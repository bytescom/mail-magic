"use client"
import React, { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

const AutomationTab = () => {
    const [behaviors, setBehaviors] = useState({
        attachResume: true,
        embedLink: false,
        scheduleFollowups: true,
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-full">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border last:border-0 first:pt-0 w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Email Engine Setup</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Control how the AI generates text.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12.5px] font-medium text-text-dark">Email Tone</label>
                        <div className="relative">
                            <select className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none appearance-none hover:border-border transition-all cursor-pointer">
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
                            <select defaultValue="Concise Length" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-[14px] text-text-dark outline-none appearance-none hover:border-border transition-all cursor-pointer">
                                <option>Short (Action-oriented)</option>
                                <option>Concise Length</option>
                                <option>Detailed & Story-driven</option>
                            </select>
                            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Behaviors */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 border-b border-border last:border-0 w-full">
                <div>
                    <h3 className="text-[15px] font-bold text-text-dark mb-1">Global Behaviors</h3>
                    <p className="text-[13px] text-muted leading-relaxed">Default settings for outreach templates.</p>
                </div>
                <div className="flex flex-col gap-5 w-full lg:w-3/4">
                    {[
                        { id: 'attachResume', label: 'Auto-attach Resume', desc: 'Attach PDF to outgoing outreach emails.' },
                        { id: 'embedLink', label: 'Embed Portfolio Link', desc: 'Include a clean portfolio link in the signature.' },
                        { id: 'scheduleFollowups', label: 'Schedule Follow-ups', desc: 'Queue check-ins automatically.' }
                    ].map((opt) => (
                        <div key={opt.id} className="flex items-start gap-3">
                            <button
                                className="relative flex items-center justify-center w-4 h-4 rounded-full border mt-0.5 cursor-pointer transition-all bg-background shrink-0"
                                style={{ borderColor: behaviors[opt.id] ? '#3b82f6' : '#d0d4da' }}
                                onClick={() => setBehaviors(p => ({ ...p, [opt.id]: !p[opt.id] }))}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: behaviors[opt.id] ? '#3b82f6' : 'transparent' }} />
                            </button>
                            <div className="-mt-0.5 cursor-pointer" onClick={() => setBehaviors(p => ({ ...p, [opt.id]: !p[opt.id] }))}>
                                <h4 className="text-[14px] font-medium text-text-dark mb-0.5 leading-none">{opt.label}</h4>
                                <p className="text-[13px] text-muted">{opt.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AutomationTab
