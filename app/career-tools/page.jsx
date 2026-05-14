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
    Copy,
    Check,
    Plus,
    Palette,
    Briefcase,
    Rocket,
    DollarSign,
    Megaphone,
    Building2,
    X,
    Save,
    Eye,
    ArrowLeft,
    Edit3,
    Trash2,
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

const CATEGORY_META = {
    all: { label: 'All', icon: BarChart3, color: 'text-slate-600', bg: 'bg-slate-50' },
    tech: { label: 'Technology', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50' },
    finance: { label: 'Finance', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    marketing: { label: 'Marketing', icon: Megaphone, color: 'text-rose-600', bg: 'bg-rose-50' },
    design: { label: 'Design', icon: Palette, color: 'text-violet-600', bg: 'bg-violet-50' },
    management: { label: 'Management', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    general: { label: 'General', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
    startup: { label: 'Startup', icon: Rocket, color: 'text-orange-600', bg: 'bg-orange-50' },
    consulting: { label: 'Consulting', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export default function CareerToolsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('resume'); // 'resume' or 'cover-letters'

    // Resume Optimizer State
    const [resumeText, setResumeText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [roles, setRoles] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Cover Letters State
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [variableValues, setVariableValues] = useState({});
    const [newTemplate, setNewTemplate] = useState({
        title: '', category: 'general', targetRole: '', description: '', content: '',
    });

    useEffect(() => {
        if (session) {
            fetchRoles();
            fetchTemplates();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    // Resume functions
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

    // Cover Letters functions
    const fetchTemplates = async (category) => {
        try {
            setLoading(true);
            const cat = category || activeCategory;
            const res = await fetch(`/api/cover-letters${cat !== 'all' ? `?category=${cat}` : ''}`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
                setCategories(data.categories || []);
            }
        } catch (e) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        fetchTemplates(cat);
    };

    const handleCopy = async (template) => {
        let content = template.content;
        Object.entries(variableValues).forEach(([key, value]) => {
            if (value) content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
        await navigator.clipboard.writeText(content);
        setCopiedId(template._id);
        toast.success('Copied to clipboard!');

        try {
            await fetch('/api/cover-letters', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: template._id, incrementUsage: true }),
            });
        } catch (e) { /* silent */ }

        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreate = async () => {
        if (!newTemplate.title || !newTemplate.content) {
            toast.error('Title and content are required');
            return;
        }
        setCreating(true);
        try {
            const res = await fetch('/api/cover-letters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTemplate),
            });
            if (res.ok) {
                toast.success('Template created!');
                setShowCreate(false);
                setNewTemplate({ title: '', category: 'general', targetRole: '', description: '', content: '' });
                fetchTemplates();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to create');
            }
        } catch (e) {
            toast.error('Failed to create template');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this template?')) return;
        try {
            const res = await fetch(`/api/cover-letters?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Template deleted');
                setSelectedTemplate(null);
                fetchTemplates();
            } else {
                toast.error('Cannot delete system templates');
            }
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    const getPreviewContent = (template) => {
        let content = template.content;
        Object.entries(variableValues).forEach(([key, value]) => {
            if (value) content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
        return content;
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* Header */}
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] font-sans">Professional</h2>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                Career Tools
                            </h1>
                            <p className="text-slate-500 max-w-xl text-xs sm:text-sm leading-relaxed font-sans">
                                Optimize your resume for ATS and browse professional cover letter templates
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-2 border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab('resume')}
                                className={cn(
                                    "px-5 py-3 font-bold text-sm transition-all relative cursor-pointer",
                                    activeTab === 'resume'
                                        ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px]"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <FileSearch className="w-4 h-4" />
                                    Resume Optimizer
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('cover-letters')}
                                className={cn(
                                    "px-5 py-3 font-bold text-sm transition-all relative cursor-pointer",
                                    activeTab === 'cover-letters'
                                        ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px]"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Cover Letter Templates
                                </div>
                            </button>
                        </div>

                        {/* Resume Optimizer Tab */}
                        {activeTab === 'resume' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                                {/* Left: Input */}
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

                                {/* Right: Results */}
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
                                            {/* Score Card */}
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
                                                            For <span className="text-white font-bold">{analysis.targetRole}</span>
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

                                            {/* Tips */}
                                            {analysis.tips.length > 0 && (
                                                <div className="bg-white border border-slate-200/60 rounded-xl lg:rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                                                        <div className="p-2.5 bg-amber-50 rounded-lg">
                                                            <Lightbulb className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">Improvement Tips</h3>
                                                            <p className="text-xs text-slate-400 font-medium font-sans">{analysis.tips.length} suggestions</p>
                                                        </div>
                                                    </div>
                                                    <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                                                        {analysis.tips.slice(0, 10).map((tip, i) => {
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
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cover Letters Tab */}
                        {activeTab === 'cover-letters' && (
                            <>
                                {/* Category Filters */}
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
                                        {['all', ...Object.keys(CATEGORY_META).filter(k => k !== 'all')].map(cat => {
                                            const meta = CATEGORY_META[cat] || CATEGORY_META.general;
                                            const count = cat === 'all' ? templates.length : categories.find(c => c._id === cat)?.count || 0;
                                            const isActive = activeCategory === cat;
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleCategoryChange(cat)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer",
                                                        isActive
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                                            : "bg-white text-slate-600 border-slate-200/60 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {meta.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setShowCreate(true)}
                                        className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all active:scale-95 hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer font-sans shrink-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create
                                    </button>
                                </div>

                                {/* Template Detail or Grid */}
                                {selectedTemplate ? (
                                    <div className="space-y-5">
                                        <button
                                            onClick={() => { setSelectedTemplate(null); setVariableValues({}); }}
                                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-sans"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to templates
                                        </button>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            <div className="lg:col-span-4 space-y-4">
                                                <div className="bg-white border border-slate-200/60 rounded-xl p-5 sm:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className={cn("p-2.5 rounded-lg", CATEGORY_META[selectedTemplate.category]?.bg || 'bg-slate-50')}>
                                                            {(() => {
                                                                const IconComp = CATEGORY_META[selectedTemplate.category]?.icon || FileText;
                                                                return <IconComp className={cn("w-5 h-5", CATEGORY_META[selectedTemplate.category]?.color || 'text-slate-600')} />;
                                                            })()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">{selectedTemplate.title}</h3>
                                                            <p className="text-xs text-slate-500 font-medium mt-1">{selectedTemplate.description}</p>
                                                        </div>
                                                    </div>

                                                    {selectedTemplate.variables?.length > 0 && (
                                                        <div className="space-y-3 mt-4">
                                                            <h4 className="font-bold text-sm text-slate-900">Variables</h4>
                                                            {selectedTemplate.variables.map(v => (
                                                                <div key={v}>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                                                                        {v.replace(/_/g, ' ')}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={variableValues[v] || ''}
                                                                        onChange={(e) => setVariableValues(prev => ({ ...prev, [v]: e.target.value }))}
                                                                        placeholder={`Enter ${v.replace(/_/g, ' ')}...`}
                                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-sans"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3 mt-5">
                                                        <button
                                                            onClick={() => handleCopy(selectedTemplate)}
                                                            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg text-sm transition-all active:scale-[0.98] hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer font-sans"
                                                        >
                                                            {copiedId === selectedTemplate._id ? (
                                                                <><Check className="w-4 h-4" /> Copied!</>
                                                            ) : (
                                                                <><Copy className="w-4 h-4" /> Copy</>
                                                            )}
                                                        </button>
                                                        {!selectedTemplate.isSystem && (
                                                            <button
                                                                onClick={() => handleDelete(selectedTemplate._id)}
                                                                className="p-3 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                                                    <Eye className="w-4 h-4 text-slate-400" />
                                                    <h4 className="font-bold text-sm text-slate-900">Preview</h4>
                                                </div>
                                                <div className="p-6 sm:p-8 lg:p-10 max-h-[600px] overflow-y-auto">
                                                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                                                        {getPreviewContent(selectedTemplate)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                        {templates.map((template) => {
                                            const meta = CATEGORY_META[template.category] || CATEGORY_META.general;
                                            const IconComp = meta.icon;
                                            return (
                                                <div
                                                    key={template._id}
                                                    className="bg-white border border-slate-200/60 rounded-xl p-5 sm:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-300/80 transition-all group cursor-pointer"
                                                    onClick={() => { setSelectedTemplate(template); setVariableValues({}); }}
                                                >
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={cn("p-2.5 rounded-lg transition-transform group-hover:scale-110", meta.bg)}>
                                                            <IconComp className={cn("w-5 h-5", meta.color)} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-sm text-slate-900 truncate leading-tight">{template.title}</h3>
                                                            <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">{template.targetRole || meta.label}</p>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium mb-4">
                                                        {template.description || template.content.substring(0, 120) + '...'}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase", meta.bg, meta.color)}>
                                                            {meta.label}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                                                            <span>Use</span>
                                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {templates.length === 0 && !loading && (
                                            <div className="sm:col-span-2 lg:col-span-3 bg-white border border-slate-200/60 rounded-xl p-16 text-center">
                                                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="font-display font-bold text-lg text-slate-900">No templates</p>
                                                <p className="text-sm text-slate-500 mt-2 font-medium">Try another category or create your own</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Create Modal */}
                                {showCreate && (
                                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                                        <div className="bg-white rounded-xl lg:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                                            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                                <h3 className="font-display font-bold text-xl text-slate-900">Create Template</h3>
                                                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                                    <X className="w-5 h-5 text-slate-400" />
                                                </button>
                                            </div>
                                            <div className="p-5 sm:p-6 space-y-4">
                                                <input
                                                    type="text"
                                                    value={newTemplate.title}
                                                    onChange={(e) => setNewTemplate(p => ({ ...p, title: e.target.value }))}
                                                    placeholder="Template title"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-sans"
                                                />
                                                <select
                                                    value={newTemplate.category}
                                                    onChange={(e) => setNewTemplate(p => ({ ...p, category: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-sans cursor-pointer"
                                                >
                                                    {Object.entries(CATEGORY_META).filter(([k]) => k !== 'all').map(([key, val]) => (
                                                        <option key={key} value={key}>{val.label}</option>
                                                    ))}
                                                </select>
                                                <textarea
                                                    value={newTemplate.content}
                                                    onChange={(e) => setNewTemplate(p => ({ ...p, content: e.target.value }))}
                                                    placeholder="Dear Hiring Manager,&#10;&#10;I am writing to apply for the {role} position at {company}...&#10;&#10;Best regards,&#10;{name}"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-sans resize-none"
                                                    rows={12}
                                                />
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setShowCreate(false)}
                                                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg text-sm hover:bg-slate-200 transition-all cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleCreate}
                                                        disabled={creating}
                                                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                                    >
                                                        {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
