'use client';

import Link from 'next/link';
import { Send, ChevronLeft, Scale, Zap, Ban, RotateCcw } from 'lucide-react';

export default function TermsPage() {
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
                            <Scale className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Protocol Agreements</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">Terms of Protocol</h1>
                        <p className="text-slate-500 font-medium">Agreement operational as of: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <Zap className="w-4 h-4 text-amber-600" />
                                </div>
                                1. System Usage
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                MailMagic provides automation tools to assist in your job search. By using our system, you agree to use these tools responsibly and not for spamming purposes. We monitor dispatch rates to maintain Gmail API compliance.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <Ban className="w-4 h-4 text-rose-600" />
                                </div>
                                2. Restricted Actions
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Users are strictly prohibited from utilizing MailMagic to:
                            </p>
                            <ul className="list-disc pl-5 text-slate-600 space-y-2 font-medium">
                                <li>Send malicious content, software, or tracking scripts.</li>
                                <li>Circumvent Google&apos;s rate limits or security policies.</li>
                                <li>Collect or harvest sensitive data from recruiter responses.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <RotateCcw className="w-4 h-4 text-blue-600" />
                                </div>
                                3. Revocation & Termination
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                We reserve the right to revoke system access for any user found in violation of these protocol agreements. You may delete your account and associated data at any time via the Settings panel.
                            </p>
                        </section>
                    </div>

                    <div className="pt-10 border-t border-slate-100">
                        <p className="text-sm text-slate-500 font-medium italic">
                            By continuing to authenticate with Google, you affirm your alignment with these protocols.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
