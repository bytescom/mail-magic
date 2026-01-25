'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { Mail, Zap, Shield, Clock, ArrowRight, CheckCircle2, Sparkles, Send, Briefcase, Globe, Lock, Star, Twitter, Github, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

function HomePageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            toast.error(`Authentication error: ${error}`);
        }

        if (status === 'authenticated' && session) {
            router.replace('/dashboard');
        }
    }, [status, session, searchParams, router]);

    const handleSignIn = () => {
        signIn('google', {
            callbackUrl: window.location.origin + '/dashboard',
            redirect: true
        });
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 font-medium text-sm animate-pulse">Syncing with system...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF] overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Background Aesthetics */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent"></div>
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-slate-200/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            {/* Navigation / Logo Area */}
            <nav className="fixed top-0 w-full z-50 border-b border-slate-100/60 bg-white/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl flex items-center justify-center">
                            <Image src="/icon.png" alt="MailMagic" width={35} height={35} className="rounded-xl" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-slate-900">MailMagic</span>
                    </div>
                    <button
                        onClick={handleSignIn}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 active:text-blue-600 transition-colors px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 active:scale-95 shadow-sm"
                    >
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center text-center space-y-10">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50/50 border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-1000">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Next-Gen Job Outreach</span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                            <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight leading-[1.1]">
                                Automated Intelligence <br className="hidden md:block" />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">for Your Career Growth</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                                MailMagic transforms your job search into a professional, high-conversion operation using secure automation directly through your own Gmail.
                            </p>
                        </div>

                        {/* CTA Section */}
                        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                            <button
                                onClick={handleSignIn}
                                className="px-12 py-4 md:px-24 md:py-5 rounded-2xl bg-blue-600 text-white font-bold inline-flex items-center gap-3 md:gap-3.5 group transition-all hover:bg-blue-700 active:scale-[0.98] shadow-xl shadow-blue-600/20 cursor-pointer"
                            >
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-xs md:text-sm tracking-tight font-display whitespace-nowrap">Continue with Google</span>
                                <ArrowRight className="w-4 h-4 md:w-4.5 md:h-4.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 shadow-sm" alt="" />
                                    ))}
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-slate-900">4,200+</span> Professionals Joined
                                    <span className="flex items-center gap-0.5 ml-1">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-blue-500 text-blue-500" />)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="group max-w-2xl bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm hover:shadow-md active:shadow-inner active:scale-[0.99] transition-all animate-in fade-in zoom-in-95 duration-1000 delay-700">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-active:bg-emerald-100 transition-colors">
                                    <Lock className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-active:text-emerald-600 transition-colors" />
                                </div>
                                <div className="text-left space-y-1">
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 group-active:text-emerald-800 transition-colors">Secure OAuth Architecture</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        MailMagic operates under Google's secure OAuth protocol. You maintain absolute control over your Gmail permissions.
                                        <Link href="/privacy" className="ml-1 text-blue-600 font-bold hover:underline active:opacity-70">Compliance Details →</Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl pt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-1000">
                            {[
                                { icon: Zap, title: 'Rapid Execution', desc: 'Batch process applications with distinct intervals for safety.', color: 'blue' },
                                { icon: Shield, title: 'Verified Delivery', desc: 'Securely authenticated via your personal Gmail identity.', color: 'indigo' },
                                { icon: Briefcase, title: 'Template Assets', desc: 'Professional schemas ensures consistent quality across leads.', color: 'emerald' },
                                { icon: Globe, title: 'Global Sync', desc: 'Manage your recruiter network across time zones effortlessly.', color: 'cyan' },
                            ].map((f, i) => (
                                <div key={i} className="group p-8 rounded-[2.5rem] bg-white border border-slate-200/60 hover:border-slate-300 active:border-slate-400 transition-all hover:shadow-xl active:shadow-lg active:scale-[0.98] hover:shadow-slate-200/20 text-left">
                                    <div className={`w-12 h-12 rounded-2xl bg-${f.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 group-active:scale-110 transition-transform`}>
                                        <f.icon className={`w-6 h-6 text-${f.color}-600`} />
                                    </div>
                                    <h3 className="text-lg font-display font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 group-active:text-blue-700 transition-colors uppercase tracking-tight">{f.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Simplified Footer */}
            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        © {new Date().getFullYear()} Bytescom
                    </p>


                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                        <Link href="/privacy" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 active:text-blue-600 active:opacity-70 transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 active:text-blue-600 active:opacity-70 transition-colors">Terms</Link>
                        <Link href="/contact" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 active:text-blue-600 active:opacity-70 transition-colors">Support</Link>
                    </div>


                    <div className="flex items-center gap-4">
                        <Link href="#" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 active:bg-blue-50 active:scale-90 transition-all">
                            <Twitter className="w-4 h-4" />
                        </Link>
                        <Link href="#" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 active:bg-slate-200 active:scale-90 transition-all">
                            <Github className="w-4 h-4" />
                        </Link>
                        <Link href="#" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-700 hover:border-blue-700 active:bg-blue-50 active:scale-90 transition-all">
                            <Linkedin className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Wrap with Suspense to handle useSearchParams during build
export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 font-medium text-sm animate-pulse">Loading...</p>
                </div>
            </div>
        }>
            <HomePageContent />
        </Suspense>
    );
}
