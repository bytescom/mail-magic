'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
    FileText,
    Plus,
    Copy,
    Check,
    ChevronRight,
    Sparkles,
    Briefcase,
    Building2,
    Palette,
    TrendingUp,
    BarChart3,
    Rocket,
    DollarSign,
    Megaphone,
    Search,
    X,
    Edit3,
    Trash2,
    Eye,
    ArrowLeft,
    Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

export default function CoverLettersPage() {
    const { data: session } = useSession();
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [variableValues, setVariableValues] = useState({});

    // Form state for creating
    const [newTemplate, setNewTemplate] = useState({
        title: '', category: 'general', targetRole: '', description: '', content: '',
    });

    useEffect(() => {
        if (session) fetchTemplates();
    }, [session]);

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
        // Replace variables with filled values
        Object.entries(variableValues).forEach(([key, value]) => {
            if (value) content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
        await navigator.clipboard.writeText(content);
        setCopiedId(template._id);
        toast.success('Copied to clipboard!');

        // Track usage
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

    if (loading && templates.length === 0) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse font-sans">Loading templates...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <main className="w-full max-w-7xl mx-auto overflow-x-hidden">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] font-sans">Library</h2>
                                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                    Cover Letter Templates
                                </h1>
                                <p className="text-slate-500 max-w-lg text-xs sm:text-sm leading-relaxed font-sans">
                                    Professional, role-based templates ready to customize. Fill in variables and copy with one click.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer font-sans self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" />
                                Create Template
                            </button>
                        </div>

                        {/* Category Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                            {['all', ...Object.keys(CATEGORY_META).filter(k => k !== 'all')].map(cat => {
                                const meta = CATEGORY_META[cat] || CATEGORY_META.general;
                                const count = cat === 'all' ? templates.length : categories.find(c => c._id === cat)?.count || 0;
                                const isActive = activeCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer",
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

                        {/* Template Detail View */}
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
                                    {/* Template Info */}
                                    <div className="lg:col-span-4 space-y-4">
                                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className={cn("p-2.5 rounded-xl", CATEGORY_META[selectedTemplate.category]?.bg || 'bg-slate-50')}>
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

                                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-4">
                                                {selectedTemplate.targetRole && (
                                                    <span className="px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-600">{selectedTemplate.targetRole}</span>
                                                )}
                                                <span className={cn("px-2 py-1 rounded-md font-bold", CATEGORY_META[selectedTemplate.category]?.bg || 'bg-slate-100', CATEGORY_META[selectedTemplate.category]?.color || 'text-slate-600')}>
                                                    {CATEGORY_META[selectedTemplate.category]?.label || selectedTemplate.category}
                                                </span>
                                            </div>

                                            {selectedTemplate.isSystem && (
                                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">System Template</span>
                                            )}

                                            <div className="flex items-center gap-3 mt-5">
                                                <p className="text-xs text-slate-400 font-medium">
                                                    Used {selectedTemplate.usageCount || 0} times
                                                </p>
                                            </div>
                                        </div>

                                        {/* Variables */}
                                        {selectedTemplate.variables?.length > 0 && (
                                            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                <h4 className="font-bold text-sm text-slate-900 mb-3">Personalize Variables</h4>
                                                <div className="space-y-3">
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
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleCopy(selectedTemplate)}
                                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98] hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer font-sans"
                                            >
                                                {copiedId === selectedTemplate._id ? (
                                                    <><Check className="w-4 h-4" /> Copied!</>
                                                ) : (
                                                    <><Copy className="w-4 h-4" /> Copy to Clipboard</>
                                                )}
                                            </button>
                                            {!selectedTemplate.isSystem && (
                                                <button
                                                    onClick={() => handleDelete(selectedTemplate._id)}
                                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-slate-400" />
                                            <h4 className="font-bold text-sm text-slate-900">Live Preview</h4>
                                        </div>
                                        <div className="p-6 sm:p-8 lg:p-10">
                                            <div className="prose prose-sm max-w-none">
                                                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed bg-transparent p-0 m-0 border-0">
                                                    {getPreviewContent(selectedTemplate)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Template Grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                {templates.map((template) => {
                                    const meta = CATEGORY_META[template.category] || CATEGORY_META.general;
                                    const IconComp = meta.icon;
                                    return (
                                        <div
                                            key={template._id}
                                            className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-300/80 transition-all group cursor-pointer"
                                            onClick={() => { setSelectedTemplate(template); setVariableValues({}); }}
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", meta.bg)}>
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
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase", meta.bg, meta.color)}>
                                                        {meta.label}
                                                    </span>
                                                    {template.isSystem && (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold uppercase">
                                                            Built-in
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                                                    <span>Use</span>
                                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {templates.length === 0 && (
                                    <div className="sm:col-span-2 lg:col-span-3 bg-white border border-slate-200/60 rounded-2xl p-16 text-center">
                                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="font-display font-bold text-lg text-slate-900">No templates in this category</p>
                                        <p className="text-sm text-slate-500 mt-2 font-medium">Try another category or create your own template</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Create Modal */}
                        {showCreate && (
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                                <div className="bg-white rounded-2xl lg:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl lg:rounded-t-3xl">
                                        <div>
                                            <h3 className="font-display font-bold text-xl text-slate-900 tracking-tight">Create Template</h3>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">Use {'{variable_name}'} for personalization fields</p>
                                        </div>
                                        <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Title *</label>
                                                <input
                                                    type="text"
                                                    value={newTemplate.title}
                                                    onChange={(e) => setNewTemplate(p => ({ ...p, title: e.target.value }))}
                                                    placeholder="e.g., My SWE Cover Letter"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-sans"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Target Role</label>
                                                <input
                                                    type="text"
                                                    value={newTemplate.targetRole}
                                                    onChange={(e) => setNewTemplate(p => ({ ...p, targetRole: e.target.value }))}
                                                    placeholder="e.g., Software Engineer"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-sans"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Category</label>
                                                <select
                                                    value={newTemplate.category}
                                                    onChange={(e) => setNewTemplate(p => ({ ...p, category: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-sans appearance-none cursor-pointer"
                                                >
                                                    {Object.entries(CATEGORY_META).filter(([k]) => k !== 'all').map(([key, val]) => (
                                                        <option key={key} value={key}>{val.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Description</label>
                                                <input
                                                    type="text"
                                                    value={newTemplate.description}
                                                    onChange={(e) => setNewTemplate(p => ({ ...p, description: e.target.value }))}
                                                    placeholder="Brief description..."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-sans"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Content *</label>
                                            <textarea
                                                value={newTemplate.content}
                                                onChange={(e) => setNewTemplate(p => ({ ...p, content: e.target.value }))}
                                                placeholder={`Dear Hiring Manager,\n\nI am writing to apply for the {role} position at {company}...\n\nBest regards,\n{name}`}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-sans resize-none"
                                                rows={12}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setShowCreate(false)}
                                                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm hover:bg-slate-200 transition-all cursor-pointer font-sans"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreate}
                                                disabled={creating}
                                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-sans"
                                            >
                                                {creating ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <><Save className="w-4 h-4" /> Save Template</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
