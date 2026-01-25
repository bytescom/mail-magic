'use client';

import Link from 'next/link';
import { Send, ChevronLeft, Shield, Lock, Eye, Server } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-slate-100/60 bg-white/70 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <Send className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight text-slate-900">MailMagic</span>
                    </Link>
                    <Link href="/" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <ChevronLeft className="w-3 h-3" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                            <Shield className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Trust & Integrity</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
                        <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                </div>
                                1. Data Collection & OAuth
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                MailMagic utilizes Google OAuth to access your Gmail account. We only request the minimum permissions required to send emails on your behalf. Your raw password is never shared with or stored by MailMagic.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <Eye className="w-4 h-4 text-emerald-600" />
                                </div>
                                2. Information Usage
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Your data is used exclusively for the automation functionality you trigger. This includes:
                            </p>
                            <ul className="list-disc pl-5 text-slate-600 space-y-2 font-medium">
                                <li>Storing resume/cover letter data for template attachments.</li>
                                <li>Maintaining logs of your sent campaigns for your own review.</li>
                                <li>Synchronizing recruitment contact lists you provide.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <Server className="w-4 h-4 text-amber-600" />
                                </div>
                                3. Security Infrastructure
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                All data is encrypted both in transit (TLS/SSL) and at rest. We utilize industry-standard cloud security protocols to ensure your recruitment assets remain private and secure.
                            </p>
                        </section>
                    </div>

                    <div className="pt-10 border-t border-slate-100">
                        <p className="text-sm text-slate-500 font-medium italic">
                            Have questions about our data safety? Contact our security protocol team at <span className="text-blue-600 font-bold">privacy@bytescom.com</span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
