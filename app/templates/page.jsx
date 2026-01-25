'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Pencil, Trash2, Eye, FileText, Sparkles, X, Mail, Search, Clock, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [formData, setFormData] = useState({ name: '', subject: '', body: '' });
    const [preview, setPreview] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            } else {
                toast.error('Failed to load templates');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = currentTemplate
            ? `/api/templates/${currentTemplate._id}`
            : '/api/templates';
        const method = currentTemplate ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(currentTemplate ? 'Template updated!' : 'Template created!');
                setShowModal(false);
                setFormData({ name: '', subject: '', body: '' });
                setCurrentTemplate(null);
                fetchTemplates();
            } else {
                toast.error('Failed to save template');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Template deleted');
                fetchTemplates();
            } else {
                toast.error('Failed to delete template');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        }
    };

    const handleEdit = (template) => {
        setCurrentTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject,
            body: template.body,
        });
        setShowModal(true);
    };

    const handlePreview = (template) => {
        setPreview(template);
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading your templates...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Management</h2>
                            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                                Email Templates
                            </h1>
                            <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
                                Create and refine reusable email templates with custom variables.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setCurrentTemplate(null);
                                setFormData({ name: '', subject: '', body: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create New Template</span>
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-xs group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                            <button className="p-1.5 rounded-lg bg-white shadow-sm text-blue-600 border border-slate-200/50">
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Templates Grid */}
                    {filteredTemplates.length === 0 ? (
                        <div className="bg-white border border-slate-200/60 border-dashed rounded-[2.5rem] py-24 text-center px-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
                                {searchQuery ? 'No templates match your search' : 'No templates yet'}
                            </h3>
                            <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">
                                {searchQuery ? 'Try adjusting your filters or search terms.' : 'Create your first email template to start automating your applications.'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Create Your First Template</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template, index) => (
                                <div
                                    key={template._id}
                                    className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:border-slate-300/80 group flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                                            <Mail className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 duration-300">
                                            <button
                                                onClick={() => handlePreview(template)}
                                                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-200/50"
                                                title="Preview"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all border border-slate-200/50"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template._id)}
                                                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-200/50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{template.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            Subject Header
                                        </p>
                                        <p className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                            {template.subject}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-bold text-slate-500">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                            <span>{template.usageCount || 0} Uses</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            Updated {new Date(template.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create/Edit Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans">
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                                            {currentTemplate ? 'Refine Template' : 'New Email Template'}
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">Set up your subject and body with dynamic placeholders.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Template Identifier</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            placeholder="e.g., Senior Frontend Application"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Subject Line</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                            placeholder="Applying for {{job_role}} role at {{company}}"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Message Content</label>
                                        <textarea
                                            value={formData.body}
                                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none leading-relaxed min-h-[280px]"
                                            placeholder={'Dear {{hr_name}},\n\nI am reaching out regarding the {{job_role}} position...'}
                                            required
                                        />
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {['hr_name', 'company', 'job_role', 'your_name', 'resume_link'].map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, body: prev.body + `{{${v}}}` }))}
                                                    className="px-2.5 py-1.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                                >
                                                    + {'{{'}{v}{'}}'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-3">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                                        >
                                            {currentTemplate ? 'Save Changes' : 'Create Template'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Preview Modal */}
                    {preview && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreview(null)} />
                            <div className="bg-white max-w-3xl w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-5 duration-500 flex flex-col max-h-[85vh]">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[2.5rem]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                                            <Eye className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">{preview.name}</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Template Preview</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPreview(null)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-10 space-y-8 overflow-y-auto">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Subject</p>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900 leading-tight bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">{preview.subject}</p>
                                        </div>

                                        <div className="space-y-2 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Body Content</p>
                                            </div>
                                            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-sm text-slate-600 font-medium leading-[1.8] whitespace-pre-wrap min-h-[200px] shadow-inner">
                                                {preview.body}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">Dynamic Template</p>
                                            <p className="text-xs text-blue-600 font-medium leading-relaxed">Placeholders will be automatically replaced with contact data when you launch your campaign.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-white rounded-b-[2.5rem] border-t border-slate-100">
                                    <button
                                        onClick={() => setPreview(null)}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-800"
                                    >
                                        Looks Good, Close Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
