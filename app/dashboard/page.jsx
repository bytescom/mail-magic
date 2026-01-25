'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    FileText,
    Users,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Plus,
    Mail,
    Calendar,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                toast.error('Failed to load statistics');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse font-sans">Preparing your dashboard...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const statCards = [
        {
            name: 'Active Templates',
            value: stats?.stats?.totalTemplates || 0,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            description: 'Saved email drafts',
        },
        {
            name: 'HR Contacts',
            value: stats?.stats?.totalHrEmails || 0,
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            description: 'Recruiter reach list',
        },
        {
            name: 'Applications Sent',
            value: stats?.stats?.totalEmailsSent || 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            description: 'Success delivery',
        },
        {
            name: 'Delivery Failed',
            value: stats?.stats?.totalEmailsFailed || 0,
            icon: XCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            description: 'Needs attention',
        },
    ];

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
                    {/* Header Greeting & CTAs */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] font-sans">Overview</h2>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}
                            </h1>
                            <p className="text-slate-500 max-w-lg text-xs sm:text-sm leading-relaxed font-sans">
                                You have sent <span className="text-slate-900 font-semibold">{stats?.stats?.totalEmailsSent || 0}</span> applications this week. Keep the momentum going!
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Link href="/templates" className="bg-slate-100 text-slate-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-200 border border-slate-200/50 flex items-center justify-center sm:justify-start gap-2 group font-sans">
                                <Plus className="w-4 h-4" />
                                <span>New Template</span>
                            </Link>
                            <Link href="/send" className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.25)] flex items-center justify-center sm:justify-start gap-2 group font-sans">
                                <Mail className="w-4 h-4" />
                                <span>Send Applications</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {statCards.map((stat) => (
                            <div
                                key={stat.name}
                                className="bg-white border border-slate-200/60 p-5 sm:p-6 space-y-4 sm:space-y-5 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:border-slate-300/80 active:scale-[0.98] active:shadow-inner active:bg-slate-50/50 group cursor-default"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={cn("p-2.5 sm:p-3 rounded-2xl transition-transform group-hover:scale-110 group-active:scale-105 duration-300", stat.bg)}>
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Live <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                    <p className="text-sm font-semibold text-slate-700 font-sans">{stat.name}</p>
                                    <p className="text-xs text-slate-400 font-medium font-sans">{stat.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Sections */}
                    <div className="grid lg:grid-cols-7 gap-8">
                        {/* Recent Activity List */}
                        <div className="lg:col-span-4 space-y-5 text-sans">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-display font-bold text-xl text-slate-900 tracking-tight">Recent Applications</h3>
                                <Link href="/logs" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-full">
                                    View Activity Logs
                                </Link>
                            </div>

                            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {stats.recentLogs.map((log) => (
                                            <div
                                                key={log._id}
                                                className="flex items-center gap-4 p-5 hover:bg-slate-50/50 active:bg-slate-100 transition-colors group cursor-default"
                                            >
                                                <div className={cn(
                                                    "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                                    log.status === 'sent' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                )}>
                                                    {log.status === 'sent' ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-x-2 mb-0.5">
                                                        <p className="font-bold text-slate-900 truncate leading-tight">{log.recipient}</p>
                                                        <div className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 truncate leading-relaxed font-medium">{log.subject}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <span className="text-xs font-bold text-slate-400">Details</span>
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 px-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-inner">
                                            <Mail className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-slate-900 font-bold text-lg">No applications sent yet.</p>
                                        <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto font-medium">Ready to apply? Start by choosing a template and your contacts.</p>
                                        <Link href="/send" className="mt-8 bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl text-sm inline-flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                            Launch Application Wizard
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Secondary Analytics / Performance */}
                        <div className="lg:col-span-3 space-y-6 font-sans">
                            <div className="px-2">
                                <h3 className="font-display font-bold text-xl text-slate-900 tracking-tight">Week Analysis</h3>
                            </div>

                            {/* Success Tracking Card */}
                            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                                <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                    <Calendar className="w-64 h-64" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">Overall Success Rate</p>
                                    <div className="flex items-end gap-3 mb-6">
                                        <span className="text-5xl font-display font-bold text-blue-400 leading-none">{stats?.stats?.successRate || 0}%</span>
                                        <div className="flex flex-col mb-1">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">+2.4%</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">vs last week</span>
                                        </div>
                                    </div>

                                    <div className="space-y-5 mt-auto">
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${stats?.stats?.successRate || 0}%` }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 transition-colors hover:bg-white/10">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Delivered</p>
                                                <p className="text-xl font-bold">{stats?.stats?.totalEmailsSent || 0}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 transition-colors hover:bg-white/10">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Failures</p>
                                                <p className="text-xl font-bold">{stats?.stats?.totalEmailsFailed || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simple Quick Link Card */}
                            <div className="bg-white border border-slate-200/60 p-8 rounded-3xl border-dashed flex flex-col items-center text-center justify-center space-y-4 group hover:border-blue-300 hover:bg-blue-50/20 active:bg-blue-50 active:scale-[0.98] cursor-pointer transition-all duration-300 shadow-sm">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 group-active:scale-105 transition-all duration-300">
                                    <Users className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 text-lg">Clean your Recruiter List</p>
                                    <p className="text-sm text-slate-500 font-medium">Better data leads to better response rates.</p>
                                </div>
                                <Link href="/hr-emails" className="text-xs font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 active:bg-blue-200 active:scale-95 transition-all flex items-center gap-2 mt-2">
                                    Review Contacts <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// Add these keyframes to your globals.css or keep them as inline arbitrary if supported, but here we use tailwind standard
// fadeIn: @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
