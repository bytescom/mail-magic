'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    User, Shield, Zap, Save, Loader2, Globe, Lock,
    Bell, Clock, Mail, BriefcaseBusiness, RefreshCw, Info,
    CheckCircle2, Calendar,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Toggle = ({ value, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
            'w-12 h-6 rounded-full transition-all relative cursor-pointer shrink-0',
            value ? 'bg-blue-600' : 'bg-slate-300'
        )}
    >
        <div className={cn(
            'absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all',
            value ? 'left-7' : 'left-1'
        )} />
    </button>
);

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
        followUpDays: 7,
        maxFollowUps: 1,
        notifyOnReply: true,
        notifyOnInterview: true,
        notifyFollowUpDue: true,
        weeklyDigest: false,
    });

    useEffect(() => {
        if (session?.user) fetchUserSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const fetchUserSettings = async () => {
        try {
            const response = await fetch('/api/user/settings');
            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    emailDelay: data.emailDelay || 3000,
                    autoAttachResume: data.autoAttachResume ?? true,
                    theme: data.theme || 'light',
                    portfolioLink: data.portfolioLink || '',
                    yourName: data.yourName || session.user.name || '',
                    followUpDays: data.followUpDays || 7,
                    maxFollowUps: data.maxFollowUps || 2,
                    notifyOnReply: data.notifyOnReply ?? true,
                    notifyOnInterview: data.notifyOnInterview ?? true,
                    notifyFollowUpDue: data.notifyFollowUpDue ?? true,
                    weeklyDigest: data.weeklyDigest ?? false,
                }));
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
                toast.success('Settings saved successfully');
                await updateSession();
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Syncing preferences...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Header */}
                    <div className="space-y-1">
                        <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Configuration</h2>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">Settings</h1>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                            Manage your profile, automation preferences, follow-up behavior and notification rules.
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">

                        {/* ── 1. Profile ─────────────────────────────────── */}
                        <Section icon={<User className="w-5 h-5 text-white" />} color="bg-blue-600" title="Profile">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Field label="Preferred Name">
                                    <InputWithIcon icon={<User className="w-4 h-4 text-slate-400" />}>
                                        <input
                                            type="text"
                                            value={formData.yourName}
                                            onChange={e => set('yourName', e.target.value)}
                                            className="w-full pl-12 pr-6 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                                            placeholder="Your full name"
                                        />
                                    </InputWithIcon>
                                </Field>
                                <Field label="Portfolio / LinkedIn URL">
                                    <InputWithIcon icon={<Globe className="w-4 h-4 text-slate-400" />}>
                                        <input
                                            type="url"
                                            value={formData.portfolioLink}
                                            onChange={e => set('portfolioLink', e.target.value)}
                                            className="w-full pl-12 pr-6 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </InputWithIcon>
                                </Field>
                            </div>
                        </Section>

                        {/* ── 2. Automation ──────────────────────────────── */}
                        <Section icon={<Zap className="w-5 h-5 text-white" />} color="bg-emerald-600" title="Email Automation">
                            <div className="space-y-4">
                                <ToggleRow
                                    title="Auto-Select Resume Attachment"
                                    description="Automatically toggle the resume option for new campaigns."
                                    value={formData.autoAttachResume}
                                    onChange={v => set('autoAttachResume', v)}
                                />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-slate-900">Email Dispatch Interval</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                                            Delay in milliseconds between each email send. Higher = safer deliverability.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <input
                                            type="number"
                                            min="1000"
                                            max="30000"
                                            step="500"
                                            value={formData.emailDelay}
                                            onChange={e => set('emailDelay', parseInt(e.target.value))}
                                            className="w-28 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                                        />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ms</span>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* ── 3. Follow-Up Settings ──────────────────────── */}
                        <Section icon={<Clock className="w-5 h-5 text-white" />} color="bg-amber-500" title="Follow-Up Behavior">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-amber-500" />
                                            <h4 className="text-sm font-bold text-slate-900">Days Until Follow-Up</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">How many days after sending to schedule the first follow-up.</p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={formData.followUpDays}
                                                onChange={e => set('followUpDays', parseInt(e.target.value))}
                                                className="w-20 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                            />
                                            <span className="text-xs font-bold text-slate-400 uppercase">days</span>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <RefreshCw className="w-4 h-4 text-amber-500" />
                                            <h4 className="text-sm font-bold text-slate-900">Max Follow-Ups Per App</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">Maximum number of follow-up emails to send per application.</p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={formData.maxFollowUps}
                                                onChange={e => set('maxFollowUps', parseInt(e.target.value))}
                                                className="w-20 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                            />
                                            <span className="text-xs font-bold text-slate-400 uppercase">max</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100">
                                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                        <strong>Max Follow-Ups</strong> limits how many times you can click <strong>Send Now</strong> per application. Set to 1 to allow only one follow-up email per application, or increase for more flexibility.
                                    </p>
                                </div>
                            </div>
                        </Section>

                        {/* ── 4. Notifications ───────────────────────────── */}
                        <Section icon={<Bell className="w-5 h-5 text-white" />} color="bg-violet-600" title="Notification Preferences">
                            <div className="space-y-3">
                                <ToggleRow
                                    title="Reply Received"
                                    description="Get notified when an HR replies to your application email."
                                    icon={<Mail className="w-4 h-4 text-violet-500" />}
                                    value={formData.notifyOnReply}
                                    onChange={v => set('notifyOnReply', v)}
                                />
                                <ToggleRow
                                    title="Interview Invitation"
                                    description="Get notified when a reply is classified as an interview invite."
                                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                    value={formData.notifyOnInterview}
                                    onChange={v => set('notifyOnInterview', v)}
                                />
                                <ToggleRow
                                    title="Follow-Up Due"
                                    description="Get notified when an application is ready for a follow-up."
                                    icon={<Clock className="w-4 h-4 text-amber-500" />}
                                    value={formData.notifyFollowUpDue}
                                    onChange={v => set('notifyFollowUpDue', v)}
                                />
                                <ToggleRow
                                    title="Weekly Digest"
                                    description="Receive a weekly summary of your application pipeline activity."
                                    icon={<BriefcaseBusiness className="w-4 h-4 text-blue-500" />}
                                    value={formData.weeklyDigest}
                                    onChange={v => set('weeklyDigest', v)}
                                />
                            </div>
                        </Section>

                        {/* ── 5. Security ────────────────────────────────── */}
                        <Section icon={<Shield className="w-5 h-5 text-white" />} color="bg-slate-800" title="Security">
                            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                                <div className="p-2.5 rounded-lg bg-white shadow-sm shrink-0">
                                    <Lock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-amber-900">Gmail OAuth Token</h4>
                                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                        Your Gmail access is managed through Google&apos;s secure OAuth protocol. We never store your password.
                                        Tokens are automatically refreshed and encrypted at rest.
                                    </p>
                                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                                        <span className="px-3 py-1 bg-white/50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-600 uppercase">
                                            ✓ Status: Active
                                        </span>
                                        <span className="px-3 py-1 bg-white/50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                                            Last Verified: {new Date().toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* Save Button */}
                        <div className="flex items-center justify-end pt-2 pb-8">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-3 cursor-pointer disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span className="uppercase tracking-widest text-[11px]">Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function Section({ icon, color, title, children }) {
    return (
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
            <div className={cn('px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3')}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shadow-sm', color)}>
                    {icon}
                </div>
                <h2 className="text-base font-display font-bold text-slate-900">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            {children}
        </div>
    );
}

function InputWithIcon({ icon, children }) {
    return (
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
            {children}
        </div>
    );
}

function ToggleRow({ title, description, icon, value, onChange }) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3 flex-1 min-w-0">
                {icon && (
                    <div className="mt-0.5 shrink-0">{icon}</div>
                )}
                <div>
                    <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{description}</p>
                </div>
            </div>
            <Toggle value={value} onChange={onChange} />
        </div>
    );
}
