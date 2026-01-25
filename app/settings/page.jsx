'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings as SettingsIcon, User, Shield, Bell, Zap, Save, Loader2, Globe, FileText, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        emailDelay: 3000,
        autoAttachResume: true,
        theme: 'light',
        portfolioLink: '',
        yourName: '',
    });

    useEffect(() => {
        if (session?.user) {
            fetchUserSettings();
        }
    }, [session]);

    const fetchUserSettings = async () => {
        try {
            const response = await fetch('/api/user/settings');
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    emailDelay: data.emailDelay || 3000,
                    autoAttachResume: data.autoAttachResume ?? true,
                    theme: data.theme || 'light',
                    portfolioLink: data.portfolioLink || '',
                    yourName: data.yourName || session.user.name || '',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/user/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Settings updated successfully');
                await updateSession();
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Syncing preferences...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Configuration</h2>
                            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">System Settings</h1>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                                Manage your automation preferences and profile security assets.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Profile Section */}
                        <div className="bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-display font-bold text-slate-900">1. Core Profile</h2>
                            </div>
                            <div className="p-8 grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Name</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.yourName}
                                            onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 appearance-none transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Portfolio Link</label>
                                    <div className="relative">
                                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="url"
                                            value={formData.portfolioLink}
                                            onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 appearance-none transition-all"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Automation Section */}
                        <div className="bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-display font-bold text-slate-900">2. Automation Behavior</h2>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900">Email Dispatch Interval</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                                            The delay in milliseconds between each email trigger to ensure safe deliverability.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1000"
                                            max="30000"
                                            step="500"
                                            value={formData.emailDelay}
                                            onChange={(e) => setFormData({ ...formData, emailDelay: parseInt(e.target.value) })}
                                            className="w-32 px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                                        />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ms</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900">Auto-Select Resume</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            Automatically toggle the resume attachment for new campaigns.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, autoAttachResume: !formData.autoAttachResume })}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative cursor-pointer",
                                            formData.autoAttachResume ? "bg-emerald-500" : "bg-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            formData.autoAttachResume ? "left-7" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-500/10">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-display font-bold text-slate-900">3. Security Context</h2>
                            </div>
                            <div className="p-8">
                                <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-start gap-5">
                                    <div className="p-3 rounded-2xl bg-white shadow-sm shrink-0">
                                        <Lock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-amber-900">Vault Access Token</h4>
                                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                            Your Gmail access is managed through Google's secure OAuth protocol. We never store your password.
                                            Tokens are automatically refreshed and encrypted at rest.
                                        </p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <span className="px-3 py-1 bg-white/50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-600 uppercase">Status: Active</span>
                                            <span className="px-3 py-1 bg-white/50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Last Verified: {new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="pt-4 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-10 py-5 bg-blue-600 text-white font-bold rounded-[1.75rem] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-3 cursor-pointer disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span className="uppercase tracking-widest text-[11px]">Synchronize Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
