'use client';

import Link from 'next/link';
import { Send, ChevronLeft, Mail, MessageSquare, Globe, Heart } from 'lucide-react';

export default function ContactPage() {
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
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Connect with us</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight">Contact Support</h1>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed text-lg">
                            Whether you need technical assistance or want to suggest a new automation feature, we&apos;re here to help.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Direct Contact */}
                        <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-display font-bold text-slate-900">Direct Message</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Reach out directly via email for rapid response protocol.</p>
                            </div>

                            <div className="space-y-4">
                                <a href="mailto:support@bytescom.com" className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all group">
                                    <div className="p-3 rounded-2xl bg-white shadow-sm">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support Email</p>
                                        <p className="text-sm font-bold text-slate-900">support@bytescom.com</p>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="p-3 rounded-2xl bg-white shadow-sm">
                                        <Globe className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Network Status</p>
                                        <p className="text-sm font-bold text-emerald-600">All Systems Operational</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social/Community */}
                        <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white space-y-8 shadow-2xl shadow-slate-200">
                            <div className="space-y-2">
                                <h3 className="text-xl font-display font-bold">Community Hub</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">Join 4,000+ professionals optimizing their career growth.</p>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                    <span className="text-sm font-bold uppercase tracking-widest">Follow Updates</span>
                                    <ChevronLeft className="rotate-180 w-4 h-4" />
                                </button>
                                <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                    <span className="text-sm font-bold uppercase tracking-widest">Join LinkedIn Group</span>
                                    <ChevronLeft className="rotate-180 w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Built for the modern worker</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
