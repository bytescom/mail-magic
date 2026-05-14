'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    FileSearch,
    Target,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Sparkles,
    Shield,
    BarChart3,
    Zap,
    BookOpen,
    ArrowRight,
    RefreshCw,
    Info,
    FileText,
    Lightbulb,
    Award,
    TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES = {
    high: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
};

const CATEGORY_ICONS = {
    Keywords: Target,
    Structure: BookOpen,
    Language: FileText,
    Impact: TrendingUp,
    Formatting: BarChart3,
    ATS: Shield,
    Content: FileSearch,
    Strategy: Lightbulb,
};

export default function ResumeOptimizerPage() {
    const { data: session } = useSession();
    const [resumeText, setResumeText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [roles, setRoles] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/resume-optimizer/analyze');
            if (res.ok) {
                const data = await res.json();
                setRoles(data.roles || []);
                if (data.roles?.length > 0) setTargetRole(data.roles[0]);
            }
        } catch (e) {
            console.error('Error fetching roles:', e);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText.trim()) {
            toast.error('Please paste your resume text');
            return;
        }
        if (!targetRole) {
            toast.error('Please select a target role');
            return;
        }

        setAnalyzing(true);
        setAnalysis(null);
        try {
            const res = await fetch('/api/resume-optimizer/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, targetRole }),
            });
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);
                toast.success('Analysis complete!');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Analysis failed');
            }
        } catch (error) {
            toast.error('Failed to analyze resume');
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getScoreRingColor = (score) => {
        if (score >= 80) return 'stroke-emerald-500';
        if (score >= 60) return 'stroke-blue-500';
        if (score >= 40) return 'stroke-amber-500';
        return 'stroke-rose-500';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Needs Work';
        return 'Weak';
    };

    const circumference = 2 * Math.PI * 54;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <main className="w-full max-w-7xl mx-auto overflow-x-hidden">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* Header */}
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] font-sans">Tools</h2>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                Resume Optimization Engine
                            </h1>
                            <p className="text-slate-500 max-w-xl text-xs sm:text-sm leading-relaxed font-sans">
                                Paste your resume and select a target role. Get instant keyword analysis, ATS compatibility scoring, and role-specific improvement tips.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                            {/* Left: Input Panel */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="bg-white border border-slate-200/60 rounded-xl lg:rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100">
                                        <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Your Resume</h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1 font-sans">Paste your resume content below</p>
                                    </div>
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">Target Role</label>
                                            <select
                                                value={targetRole}
                                                onChange={(e) => setTargetRole(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                                            >
                                                {roles.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">Resume Content</label>
                                            <textarea
                                                value={resumeText}
                                                onChange={(e) => setResumeText(e.target.value)}
                                                placeholder="Paste your entire resume here — include all sections (summary, experience, education, skills, projects, etc.)..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                                                rows={16}
                                            />
                                            <p className="text-[10px] text-slate-400 font-medium mt-1.5 font-sans">
                                                {resumeText.split(/\s+/).filter(w => w).length} words
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleAnalyze}
                                            disabled={analyzing || !resumeText.trim()}
                                            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg text-sm transition-all active:scale-[0.98] hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-sans"
                                        >
                                            {analyzing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Analyzing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4" />
                                                    <span>Analyze Resume</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Results Panel */}
                            <div className="lg:col-span-7 space-y-5">
                                {!analysis && !analyzing && (
                                    <div className="bg-white border border-slate-200/60 rounded-xl lg:rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-12 sm:p-16 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                                            <FileSearch className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="font-display font-bold text-xl text-slate-900 mb-2">Ready to Optimize</p>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                                            Paste your resume on the left and hit analyze. We&apos;ll check keyword coverage, ATS compatibility, and give you targeted improvement tips.
                                        </p>
                                    </div>
                                )}

                                {analyzing && (
                                    <div className="bg-white border border-slate-200/60 rounded-xl lg:rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-16 text-center">
                                        <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
                                        <p className="font-display font-bold text-lg text-slate-900 mb-1">Scanning your resume...</p>
                                        <p className="text-sm text-slate-500 font-medium">Checking keywords, ATS patterns, and content quality</p>
                                    </div>
                                )}

                                {analysis && (
                                    <>
                                        {/* Overall Score */}
                                        <div className="bg-slate-900 rounded-xl lg:rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                                            <div className="flex items-center gap-6 sm:gap-8">
                                                <div className="relative shrink-0">
                                                    <svg className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90" viewBox="0 0 120 120">
                                                        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                        <circle
                                                            cx="60" cy="60" r="54" fill="none"
                                                            className={getScoreRingColor(analysis.overallScore)}
                                                            strokeWidth="8" strokeLinecap="round"
                                                            strokeDasharray={circumference}
                                                            strokeDashoffset={circumference - (analysis.overallScore / 100) * circumference}
                                                            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-3xl sm:text-4xl font-display font-bold text-white">{analysis.overallScore}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">ATS Readiness</p>
                                                    <h3 className={cn("font-display font-bold text-2xl sm:text-3xl", getScoreColor(analysis.overallScore).replace('text-', 'text-'))}>
                                                        {getScoreLabel(analysis.overallScore)}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                                                        For <span className="text-white font-bold">{analysis.targetRole}</span> •
                                                        Keywords {analysis.keywords.matchPercent}% •
                                                        Content {analysis.contentQuality.score}/100 •
                                                        Sections {analysis.sections.score}/100
                                                    </p>
                                                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
                                                        {[
                                                            { label: 'Keywords', value: `${analysis.keywords.score}%` },
                                                            { label: 'Sections', value: `${analysis.sections.score}%` },
                                                            { label: 'Content', value: `${analysis.contentQuality.score}%` },
                                                            { label: 'ATS', value: `${analysis.atsCompatibility.score}%` },
                                                        ].map(m => (
                                                            <div key={m.label} className="bg-white/5 rounded-lg p-2.5 text-center border border-white/5">
                                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
                                                                <p className="text-sm sm:text-base font-bold mt-0.5">{m.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Improvement Tips */}
                                        {analysis.tips.length > 0 && (
                                            <div className="bg-white border border-slate-200/60 rounded-xl lg:rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                                    <div className="p-2.5 bg-amber-50 rounded-lg">
                                                        <Lightbulb className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Improvement Tips</h3>
                                                        <p className="text-xs text-slate-400 font-medium font-sans">{analysis.tips.length} suggestions, prioritized by impact</p>
                                                    </div>
                                                </div>
                                                <div className="divide-y divide-slate-50">
                                                    {analysis.tips.map((tip, i) => {
                                                        const style = PRIORITY_STYLES[tip.priority] || PRIORITY_STYLES.low;
                                                        const IconComp = CATEGORY_ICONS[tip.category] || Lightbulb;
                                                        return (
                                                            <div key={i} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-all">
                                                                <div className="flex items-start gap-3">
                                                                    <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", style.bg)}>
                                                                        <IconComp className={cn("w-4 h-4", style.text)} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                            <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide", style.badge)}>
                                                                                {tip.priority}
                                                                            </span>
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{tip.category}</span>
                                                                        </div>
                                                                        <p className="text-sm font-bold text-slate-900 leading-relaxed">{tip.tip}</p>
                                                                        <p className="text-xs text-slate-500 mt-1 font-medium">{tip.impact}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Keywords Analysis */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    <h4 className="font-bold text-sm text-slate-900">Keywords Found ({analysis.keywords.found.length})</h4>
                                                </div>
                                                <div className="p-4 sm:p-5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {analysis.keywords.found.map((kw, i) => (
                                                            <span
                                                                key={i}
                                                                className={cn(
                                                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold",
                                                                    kw.category === 'critical' ? "bg-emerald-100 text-emerald-700"
                                                                        : kw.category === 'technical' ? "bg-blue-100 text-blue-700"
                                                                            : "bg-violet-100 text-violet-700"
                                                                )}
                                                            >
                                                                {kw.keyword}
                                                            </span>
                                                        ))}
                                                        {analysis.keywords.found.length === 0 && (
                                                            <p className="text-xs text-slate-400 font-medium">No matching keywords found</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-rose-500" />
                                                    <h4 className="font-bold text-sm text-slate-900">Missing Keywords ({analysis.keywords.missing.length})</h4>
                                                </div>
                                                <div className="p-4 sm:p-5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {analysis.keywords.missing.map((kw, i) => (
                                                            <span
                                                                key={i}
                                                                className={cn(
                                                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold",
                                                                    kw.category === 'critical' ? "bg-rose-100 text-rose-700"
                                                                        : kw.category === 'technical' ? "bg-orange-100 text-orange-700"
                                                                            : "bg-slate-100 text-slate-600"
                                                                )}
                                                            >
                                                                {kw.keyword}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sections + ATS Warnings */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                            {/* Sections Checklist */}
                                            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                                    <h4 className="font-bold text-sm text-slate-900">Section Checklist</h4>
                                                </div>
                                                <div className="p-4 sm:p-5 space-y-2">
                                                    {analysis.sections.sections.map((section, i) => (
                                                        <div key={i} className="flex items-center gap-3 py-1.5">
                                                            {section.detected ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                            ) : (
                                                                <XCircle className={cn("w-4 h-4 shrink-0", section.required ? "text-rose-500" : "text-slate-300")} />
                                                            )}
                                                            <span className={cn("text-sm font-medium", section.detected ? "text-slate-900" : section.required ? "text-rose-600" : "text-slate-400")}>
                                                                {section.name}
                                                            </span>
                                                            {section.required && !section.detected && (
                                                                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-bold uppercase rounded">Required</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* ATS Warnings */}
                                            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-violet-600" />
                                                    <h4 className="font-bold text-sm text-slate-900">ATS Compatibility</h4>
                                                </div>
                                                <div className="p-4 sm:p-5">
                                                    {analysis.atsCompatibility.warnings.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {analysis.atsCompatibility.warnings.map((w, i) => (
                                                                <div key={i} className={cn("flex items-start gap-2.5 p-3 rounded-lg",
                                                                    w.severity === 'high' ? "bg-rose-50" : w.severity === 'medium' ? "bg-amber-50" : "bg-blue-50"
                                                                )}>
                                                                    <AlertTriangle className={cn("w-4 h-4 shrink-0 mt-0.5",
                                                                        w.severity === 'high' ? "text-rose-500" : w.severity === 'medium' ? "text-amber-500" : "text-blue-500"
                                                                    )} />
                                                                    <p className="text-xs font-medium text-slate-700 leading-relaxed">{w.message}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-6 text-center">
                                                            <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                                                            <p className="text-sm font-bold text-emerald-700">No ATS issues found!</p>
                                                            <p className="text-xs text-slate-500 mt-1 font-medium">Your resume is ATS-friendly</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Quality */}
                                        <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                                                <Award className="w-4 h-4 text-amber-600" />
                                                <h4 className="font-bold text-sm text-slate-900">Content Quality</h4>
                                            </div>
                                            <div className="p-4 sm:p-5">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                        <p className="text-lg font-display font-bold text-slate-900">{analysis.contentQuality.wordCount}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Words</p>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                        <p className="text-lg font-display font-bold text-emerald-600">{analysis.contentQuality.strongVerbsFound.length}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Action Verbs</p>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                        <p className="text-lg font-display font-bold text-blue-600">{analysis.contentQuality.quantifiedCount}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Metrics</p>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                        <p className="text-lg font-display font-bold text-violet-600">{analysis.contentQuality.bulletRatio}%</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bullet Use</p>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "mt-4 p-3 rounded-lg text-xs font-medium",
                                                    analysis.contentQuality.lengthAssessment.status === 'optimal' ? "bg-emerald-50 text-emerald-700" :
                                                        analysis.contentQuality.lengthAssessment.status === 'short' || analysis.contentQuality.lengthAssessment.status === 'long' ? "bg-amber-50 text-amber-700" :
                                                            "bg-rose-50 text-rose-700"
                                                )}>
                                                    {analysis.contentQuality.lengthAssessment.message}
                                                </div>
                                                {analysis.contentQuality.weakVerbsFound.length > 0 && (
                                                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                                                        <p className="text-xs font-bold text-orange-700 mb-1">Weak phrases detected:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {analysis.contentQuality.weakVerbsFound.map((v, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold">{v}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
