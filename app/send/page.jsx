'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Send, CheckCircle, FileText, Users, Loader2, Paperclip, Upload, X, File, Sparkles, AlertCircle, Info, ChevronRight, LayoutPanelTop, Eye, History, Mail, ArrowRight, User2, Building2, Clock, Trash2, ShieldAlert, Zap, Search } from 'lucide-react';
import { toast } from 'sonner';
import { replaceVariables, cn } from '@/lib/utils';

export default function SendEmailsPage() {
    const [templates, setTemplates] = useState([]);
    const [hrEmails, setHrEmails] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedHrEmails, setSelectedHrEmails] = useState([]);
    const [variables, setVariables] = useState({
        your_name: '',
        resume_link: '',
        portfolio_link: '',
    });
    const [sending, setSending] = useState(false);
    const [preview, setPreview] = useState(null);


    // REDESIGNED: Unified Document Library (all files in one place)
    const [documents, setDocuments] = useState([]); // Array of all uploaded documents
    const [selectedDocumentIds, setSelectedDocumentIds] = useState([]); // Array of selected document IDs to attach
    const [uploadingDocument, setUploadingDocument] = useState(false);

    // Quick add HR email modal
    const [showQuickAddHr, setShowQuickAddHr] = useState(false);
    const [quickAddForm, setQuickAddForm] = useState({
        email: '',
        hrName: '',
        company: '',
        jobRole: '',
    });

    // HR Filter state
    const [hrFilter, setHrFilter] = useState('not_contacted'); // 'all', 'contacted', 'not_contacted'
    const [hrSearchQuery, setHrSearchQuery] = useState('');

    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // Spam Prevention Limits (must match backend)
    const SPAM_LIMITS = {
        MAX_PER_BATCH: 15,
        MAX_PER_DAY: 50,
    };

    useEffect(() => {
        fetchTemplates();
        fetchHrEmails();
        fetchDocuments();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchHrEmails = async () => {
        try {
            const response = await fetch('/api/hr-emails');
            if (response.ok) {
                const data = await response.json();
                setHrEmails(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/documents');
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleUploadDocument = async (file) => {
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF, Word, TXT, and Excel files are allowed');
            return;
        }

        setUploadingDocument(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setDocuments(prev => [...prev, data.document]);
                // Auto-select the newly uploaded document
                setSelectedDocumentIds(prev => [...prev, data.document._id]);
                toast.success('Document uploaded successfully!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to upload document');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploadingDocument(false);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        const documentToDelete = documents.find(d => d._id === documentId);

        setConfirmAction({
            title: `Delete ${documentToDelete?.filename || 'Document'}?`,
            message: `This will permanently remove this document from your library.`,
            type: 'delete',
            onConfirm: async () => {
                try {
                    const response = await fetch('/api/documents', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ documentId }),
                    });

                    if (response.ok) {
                        setDocuments(prev => prev.filter(d => d._id !== documentId));
                        setSelectedDocumentIds(prev => prev.filter(id => id !== documentId));
                        toast.success('Document deleted successfully!');
                    } else {
                        const error = await response.json();
                        toast.error(error.error || 'Failed to delete document');
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    toast.error('Failed to delete document');
                }
            },
        });
        setShowConfirmModal(true);
    };

    const toggleDocumentSelection = (documentId) => {
        setSelectedDocumentIds(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleSend = async () => {
        if (!selectedTemplate) {
            toast.error('Please select a template');
            return;
        }

        if (selectedHrEmails.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        if (!variables.your_name) {
            toast.error('Please enter your name');
            return;
        }

        setConfirmAction({
            title: 'Launch Email Campaign?',
            message: `You're about to send personalized emails to ${selectedHrEmails.length} recipient${selectedHrEmails.length !== 1 ? 's' : ''}. This action cannot be undone.`,
            type: 'send',
            count: selectedHrEmails.length,
            onConfirm: async () => {
                setSending(true);

                try {
                    const response = await fetch('/api/emails/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            templateId: selectedTemplate,
                            hrEmailIds: selectedHrEmails,
                            variables,
                            documentIds: selectedDocumentIds, // Array of selected document IDs
                        }),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        toast.success(`Successfully dispatched ${result.results.sent.length} communications!`);
                        if (result.results.failed.length > 0) {
                            toast.error(`${result.results.failed.length} dispatches failed.`);
                        }
                        setSelectedHrEmails([]);
                    } else {
                        const error = await response.json();
                        toast.error(error.error || 'Failed to send emails');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    toast.error('Something went wrong');
                } finally {
                    setSending(false);
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handlePreview = () => {
        const template = templates.find((t) => t._id === selectedTemplate);
        if (!template) return;

        const sampleHrEmail = hrEmails.find((hr) => selectedHrEmails.includes(hr._id)) || hrEmails[0];

        const previewVars = {
            ...variables,
            hr_name: sampleHrEmail?.hrName || 'Hiring Lead',
            company: sampleHrEmail?.company || 'Company Name',
            job_role: sampleHrEmail?.jobRole || 'Engineer Position',
        };

        setPreview({
            subject: replaceVariables(template.subject, previewVars),
            body: replaceVariables(template.body, previewVars),
        });
    };

    const toggleSelectAll = () => {
        if (selectedHrEmails.length === hrEmails.length) {
            setSelectedHrEmails([]);
        } else {
            setSelectedHrEmails(hrEmails.map((hr) => hr._id));
        }
    };

    const handleQuickAddHr = async (e) => {
        e.preventDefault();

        if (!quickAddForm.email) {
            toast.error('Email is required');
            return;
        }

        try {
            const response = await fetch('/api/hr-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quickAddForm),
            });

            if (response.ok) {
                const newHr = await response.json();
                toast.success('HR contact added!');
                setShowQuickAddHr(false);
                setQuickAddForm({ email: '', hrName: '', company: '', jobRole: '' });
                fetchHrEmails();
                // Auto-select the newly added HR
                setSelectedHrEmails(prev => [...prev, newHr._id]);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to add contact');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        }
    };

    const selectedTemplateObj = templates.find((t) => t._id === selectedTemplate);

    // Filter HR emails based on contact status and search
    const filteredHrEmails = hrEmails.filter((hr) => {
        // Status filter
        if (hrFilter === 'contacted' && hr.status !== 'contacted') return false;
        if (hrFilter === 'not_contacted' && hr.status === 'contacted') return false;

        // Search filter
        if (hrSearchQuery.trim()) {
            const query = hrSearchQuery.toLowerCase().trim();
            const matchesName = hr.hrName && hr.hrName.toLowerCase().includes(query);
            const matchesEmail = hr.email && hr.email.toLowerCase().includes(query);
            const matchesCompany = hr.company && hr.company.toLowerCase().includes(query);
            const matchesRole = hr.jobRole && hr.jobRole.toLowerCase().includes(query);
            const matchesTags = hr.tags && hr.tags.some(tag => tag.toLowerCase().includes(query));

            if (!matchesName && !matchesEmail && !matchesCompany && !matchesRole && !matchesTags) {
                return false;
            }
        }

        return true;
    });

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Execution</h2>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                Launch Campaign
                            </h1>
                            <p className="text-slate-500 max-w-lg text-sm leading-relaxed font-sans">
                                Select your assets and target recipients to begin your automated outreach.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl sm:rounded-2xl">
                            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                            <span className="text-[10px] sm:text-xs font-bold text-blue-900 uppercase tracking-tight">System Ready to Dispatch</span>
                        </div>
                    </div>

                    <div className="w-full max-w-7xl mx-auto overflow-x-hidden">
                        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
                            {/* Main Configuration - Left */}
                            <div className="lg:col-span-8 space-y-6 sm:space-y-8 w-full min-w-0">

                                {/* Step 1: Base Configuration */}
                                <div className="bg-white border border-slate-200/60 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                                                <LayoutPanelTop className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-slate-900">1. Core Assets</h2>
                                        </div>
                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter sm:tracking-normal">Configuration</span>
                                    </div>
                                    <div className="p-4 md:p-8 space-y-6 sm:space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Template Selection</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                                <select
                                                    value={selectedTemplate}
                                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-3.5 md:py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 appearance-none transition-all cursor-pointer"
                                                >
                                                    <option value="">Choose strategy...</option>
                                                    {templates.map((t) => (
                                                        <option key={t._id} value={t._id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {selectedTemplateObj && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-in zoom-in-95 duration-300">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={variables.your_name}
                                                        onChange={(e) => setVariables({ ...variables, your_name: e.target.value })}
                                                        className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder:font-normal"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Live Portfolio Link (Optional)</label>
                                                    <input
                                                        type="url"
                                                        value={variables.portfolio_link}
                                                        onChange={(e) => setVariables({ ...variables, portfolio_link: e.target.value })}
                                                        className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder:font-normal"
                                                        placeholder="Portfolio URL"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Step 2: Payload Enrichment */}
                                <div className="bg-white border border-slate-200/60 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm overflow-hidden">
                                    <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                                                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-slate-900">2. Payload Enrichment</h2>
                                        </div>
                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Collateral</span>
                                    </div>
                                    <div className="p-4 md:p-8">
                                        {/* UNIFIED DOCUMENT LIBRARY */}
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Document Library ({documents.length})
                                                    </p>
                                                </div>
                                                {selectedDocumentIds.length > 0 && (
                                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20">
                                                        {selectedDocumentIds.length} Selected
                                                    </span>
                                                )}
                                            </div>

                                            {/* Empty State */}
                                            {documents.length === 0 && (
                                                <div className="flex flex-col items-center justify-center gap-3 py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem]">
                                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                        <File className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-slate-600">No documents yet</p>
                                                        <p className="text-xs text-slate-400 mt-1">Click "Upload" below to add your first document</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Document List */}
                                            {documents.length > 0 && (
                                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {documents.map((document) => {
                                                        const isSelected = selectedDocumentIds.includes(document._id);
                                                        return (
                                                            <div
                                                                key={document._id}
                                                                className={cn(
                                                                    "p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] border transition-all group cursor-pointer",
                                                                    isSelected
                                                                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20"
                                                                        : "bg-slate-50 border-slate-200 hover:border-blue-200 hover:bg-white"
                                                                )}
                                                                onClick={() => toggleDocumentSelection(document._id)}
                                                            >
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                                        {/* Checkbox */}
                                                                        <div className={cn(
                                                                            "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                                                            isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                                                                        )}>
                                                                            {isSelected && (
                                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>

                                                                        {/* File Icon */}
                                                                        <div className={cn(
                                                                            "w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center shadow-sm shrink-0",
                                                                            isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-slate-200"
                                                                        )}>
                                                                            <File className={cn(
                                                                                "w-4 h-4",
                                                                                isSelected ? "text-white" : "text-blue-600"
                                                                            )} />
                                                                        </div>

                                                                        {/* File Info */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={cn(
                                                                                "text-xs sm:text-sm font-bold truncate",
                                                                                isSelected ? "text-blue-900" : "text-slate-900"
                                                                            )}>
                                                                                {document.filename}
                                                                            </p>
                                                                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                                {document.size ? `${(document.size / 1024).toFixed(1)} KB` : 'Document'}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteDocument(document._id);
                                                                        }}
                                                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Upload Button */}
                                            <label className="flex flex-col items-center justify-center gap-2 sm:gap-3 py-6 sm:py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.25rem] sm:rounded-[1.5rem] cursor-pointer hover:bg-blue-50/50 hover:border-blue-400/50 transition-all group">
                                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    {uploadingDocument ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-spin" /> : <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />}
                                                </div>
                                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight">
                                                    {documents.length > 0 ? 'Add Document' : 'Upload Document'}
                                                </p>
                                                <p className="text-[9px] text-slate-400">PDF, DOC, DOCX, TXT, Excel</p>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            handleUploadDocument(e.target.files[0]);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3: Recruiter Targeting */}
                                <div className="bg-white border border-slate-200/60 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm overflow-hidden mb-6 sm:mb-12">
                                    <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-slate-900">3. Targeted Leads</h2>
                                            </div>
                                            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                                                <button
                                                    onClick={() => setShowQuickAddHr(true)}
                                                    className="whitespace-nowrap px-3 sm:px-4 py-2 bg-emerald-600 text-white border border-emerald-600 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <span className="text-lg leading-none">+</span> Quick Add
                                                </button>
                                                <button onClick={() => {
                                                    const ids = filteredHrEmails.map(hr => hr._id);
                                                    if (selectedHrEmails.length === ids.length && ids.every(id => selectedHrEmails.includes(id))) {
                                                        setSelectedHrEmails([]);
                                                    } else {
                                                        setSelectedHrEmails(ids);
                                                    }
                                                }} className="whitespace-nowrap px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer">
                                                    {filteredHrEmails.length > 0 && filteredHrEmails.every(hr => selectedHrEmails.includes(hr._id)) ? 'Clear Selection' : 'Select All'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Filter Tabs */}
                                        <div className="w-full overflow-x-auto">
                                            <div className="flex flex-nowrap justify-between items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50 w-max min-w-full">
                                                <button
                                                    onClick={() => setHrFilter('not_contacted')}
                                                    className={cn(
                                                        "whitespace-nowrap px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                                                        hrFilter === 'not_contacted'
                                                            ? "bg-white shadow-sm text-emerald-600 border border-slate-200/50"
                                                            : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    Not Sent ({hrEmails.filter(hr => hr.status !== 'contacted').length})
                                                </button>

                                                <button
                                                    onClick={() => setHrFilter('contacted')}
                                                    className={cn(
                                                        "whitespace-nowrap px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                                                        hrFilter === 'contacted'
                                                            ? "bg-white shadow-sm text-blue-600 border border-slate-200/50"
                                                            : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    Sent ({hrEmails.filter(hr => hr.status === 'contacted').length})
                                                </button>

                                                <button
                                                    onClick={() => setHrFilter('all')}
                                                    className={cn(
                                                        "whitespace-nowrap px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                                                        hrFilter === 'all'
                                                            ? "bg-white shadow-sm text-slate-900 border border-slate-200/50"
                                                            : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    All ({hrEmails.length})
                                                </button>

                                            </div>
                                        </div>


                                        {/* Search Input */}
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={hrSearchQuery}
                                                onChange={(e) => setHrSearchQuery(e.target.value)}
                                                placeholder="Search contacts..."
                                                className="w-full pl-10 sm:pl-11 pr-10 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            />
                                            {hrSearchQuery && (
                                                <button
                                                    onClick={() => setHrSearchQuery('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-8">
                                        {filteredHrEmails.length === 0 ? (
                                            <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center space-y-3">
                                                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                                                <p className="text-xs sm:text-sm font-bold text-slate-400 italic">
                                                    {hrFilter === 'not_contacted' ? 'All contacts have been sent emails!' :
                                                        hrFilter === 'contacted' ? 'No emails sent yet.' :
                                                            'No recruitment data available in your vault.'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] sm:max-h-[450px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                                                {filteredHrEmails.map((hr) => {
                                                    const isSelected = selectedHrEmails.includes(hr._id);
                                                    const isSent = hr.status === 'contacted';
                                                    return (
                                                        <label key={hr._id} className={cn(
                                                            "group relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] border transition-all cursor-pointer shadow-sm select-none",
                                                            isSelected ? "bg-blue-600 border-blue-600 ring-4 ring-blue-500/10 shadow-blue-500/20" :
                                                                isSent ? "bg-slate-50 border-slate-200 hover:border-slate-300" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                                                        )}>
                                                            <div className={cn(
                                                                "w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                                                isSelected ? "bg-white border-white" : "bg-slate-50 border-slate-200 group-hover:border-blue-400"
                                                            )}>
                                                                {isSelected && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={cn("font-bold text-xs sm:text-sm truncate", isSelected ? "text-white" : "text-slate-900")}>{hr.email || 'no-email@example.com'}</p>
                                                                    {isSent && !isSelected && (
                                                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[8px] sm:text-[9px] font-bold uppercase rounded-full">Sent</span>
                                                                    )}
                                                                </div>
                                                                <p className={cn("text-[9px] sm:text-[10px] font tracking-tight mt-0.5 truncate", isSelected ? "text-blue-300" : "text-slate-500")}>
                                                                    {hr.company || 'Global Entity'} • {hr.jobRole || 'Engineer'}
                                                                </p>
                                                            </div>
                                                            <input type="checkbox" checked={isSelected} onChange={(e) => {
                                                                if (isSelected) setSelectedHrEmails(selectedHrEmails.filter(i => i !== hr._id));
                                                                else setSelectedHrEmails([...selectedHrEmails, hr._id]);
                                                            }} className="hidden" />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Control Tower - Right */}
                            <div className="lg:col-span-4 space-y-6 w-full min-w-0">
                                <div className="lg:sticky lg:top-12 space-y-6">

                                    {/* Deployment Overview */}
                                    <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-4 md:p-8 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 hidden sm:block">
                                            <Send className="w-64 h-64" />
                                        </div>
                                        <div className="relative z-10 space-y-6 sm:space-y-8 text-sans">
                                            <div className="space-y-2 text-center sm:text-left">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Deployment Logic</p>
                                                <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">Control Tower</h2>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                                                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                        <span className="text-[9px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Active Links</span>
                                                    </div>
                                                    <span className="text-base sm:text-lg font-display font-bold text-white">{selectedHrEmails.length}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        <span className="text-[9px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Attach Files</span>
                                                    </div>
                                                    <span className="text-base sm:text-lg font-display font-bold text-white">{selectedDocumentIds.length}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-4">
                                                <button
                                                    onClick={handlePreview}
                                                    disabled={!selectedTemplate || (hrEmails.length === 0)}
                                                    className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/20 hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group"
                                                >
                                                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    <span>Validate Payload</span>
                                                </button>
                                                <button
                                                    onClick={handleSend}
                                                    disabled={sending || !selectedTemplate || selectedHrEmails.length === 0 || !variables.your_name || selectedHrEmails.length > SPAM_LIMITS.MAX_PER_BATCH}
                                                    className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-500/40 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 overflow-hidden group"
                                                >
                                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                                    <span className="uppercase tracking-widest text-[11px]">
                                                        {selectedHrEmails.length > SPAM_LIMITS.MAX_PER_BATCH ? 'Limit Exceeded' : 'Initiate Launch'}
                                                    </span>
                                                </button>
                                            </div>

                                            {sending && (
                                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 animate-pulse">
                                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest text-center">Dynamic Pacing Active (3-15s intervals)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Spam Prevention Caution Panel */}
                                    <div className="bg-amber-50 border border-amber-200/60 p-4 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm">
                                        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                                            Spam Prevention Active
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-amber-100">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                                                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Batch Limit</span>
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    selectedHrEmails.length > SPAM_LIMITS.MAX_PER_BATCH ? "text-rose-600" : "text-amber-700"
                                                )}>
                                                    {selectedHrEmails.length}/{SPAM_LIMITS.MAX_PER_BATCH}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-amber-100">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Daily Limit</span>
                                                </div>
                                                <span className="text-sm font-bold text-amber-700">{SPAM_LIMITS.MAX_PER_DAY}/day</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-amber-700 mt-4 leading-relaxed font-medium">
                                            <strong>Why?</strong> Sending too many emails at once triggers Gmail's spam detection. We use dynamic delays (3-15s) and batch limits to protect your account.
                                        </p>
                                        {selectedHrEmails.length > SPAM_LIMITS.MAX_PER_BATCH && (
                                            <div className="mt-4 p-3 bg-rose-100 border border-rose-200 rounded-xl">
                                                <p className="text-[11px] text-rose-700 font-bold">
                                                    ⚠️ Selection exceeds limit! Reduce to {SPAM_LIMITS.MAX_PER_BATCH} or fewer.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Security Panel */}
                                    <div className="bg-white border border-slate-200/60 p-4 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Safety Compliance
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { icon: Mail, label: 'Individual Dispatch', desc: 'No CC/BCC leakages' },
                                                { icon: Clock, label: 'Dynamic Pacing', desc: '3-15s adaptive delays' },
                                                { icon: Info, label: 'Audit Logging', desc: 'Full traceability of records' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex gap-3 sm:gap-4">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                        <item.icon className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{item.label}</p>
                                                        <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Portal */}
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
                                            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Campaign Preview</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Validation Point</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPreview(null)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-white transition-all shadow-sm"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-8 space-y-8 overflow-y-auto">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Header</p>
                                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] flex gap-3 italic">
                                                <p className="text-sm font-bold text-slate-900">{preview.subject}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message Payload</p>
                                            <div className="p-8 rounded-[2rem] bg-white border border-slate-200 text-sm text-slate-600 font-medium leading-[1.8] whitespace-pre-wrap min-h-[250px] shadow-inner font-sans">
                                                {preview.body}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-3xl p-6 flex items-center justify-between group overflow-hidden">
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-wide">Ready for Production</p>
                                                <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">Dispatches formatted for high deliverability</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-transform group-hover:-rotate-45 duration-700">
                                            <Sparkles className="w-32 h-32 text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-white border-t border-slate-100 rounded-b-[2.5rem]">
                                    <button
                                        onClick={() => setPreview(null)}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-800"
                                    >
                                        Everything Looks Correct
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Add HR Modal */}
                    {showQuickAddHr && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowQuickAddHr(false)} />
                            <div className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-5 duration-500 flex flex-col max-h-[85vh]">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[2.5rem]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Quick Add HR</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add a new contact instantly</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowQuickAddHr(false)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-white transition-all shadow-sm cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleQuickAddHr} className="p-8 space-y-5 overflow-y-auto">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                                        <input
                                            type="email"
                                            value={quickAddForm.email}
                                            onChange={(e) => setQuickAddForm({ ...quickAddForm, email: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal"
                                            placeholder="recruiter@company.com"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">HR Name</label>
                                            <input
                                                type="text"
                                                value={quickAddForm.hrName}
                                                onChange={(e) => setQuickAddForm({ ...quickAddForm, hrName: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal"
                                                placeholder="Sarah Miller"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                            <input
                                                type="text"
                                                value={quickAddForm.company}
                                                onChange={(e) => setQuickAddForm({ ...quickAddForm, company: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal"
                                                placeholder="Tesla Inc."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Position / Role</label>
                                        <select
                                            value={quickAddForm.jobRole}
                                            onChange={(e) => setQuickAddForm({ ...quickAddForm, jobRole: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="">Select a role...</option>
                                            <option value="Software Engineer">Software Engineer</option>
                                            <option value="Frontend Developer">Frontend Developer</option>
                                            <option value="Backend Developer">Backend Developer</option>
                                            <option value="Full Stack Developer">Full Stack Developer</option>
                                            <option value="DevOps Engineer">DevOps Engineer</option>
                                            <option value="QA Engineer">QA Engineer</option>
                                            <option value="Software Tester">Software Tester</option>
                                            <option value="Data Scientist">Data Scientist</option>
                                            <option value="UI/UX Designer">UI/UX Designer</option>
                                            <option value="Product Manager">Product Manager</option>
                                            <option value="Software Engineer Intern">Software Engineer Intern</option>
                                            <option value="QA Intern">QA Intern</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 cursor-pointer"
                                        >
                                            Add & Select
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowQuickAddHr(false)}
                                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Modal */}
                    {showConfirmModal && confirmAction && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 text-sans animate-in fade-in duration-300">
                            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-lg" onClick={() => setShowConfirmModal(false)} />
                            <div className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden border border-slate-200">
                                {/* Decorative gradient background */}
                                <div className={cn(
                                    "absolute top-0 left-0 right-0 h-32 opacity-10",
                                    confirmAction.type === 'send' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                        'bg-gradient-to-br from-rose-500 to-orange-600'
                                )} />

                                <div className="relative p-8 space-y-6">
                                    {/* Icon */}
                                    <div className="flex justify-center">
                                        <div className={cn(
                                            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg",
                                            confirmAction.type === 'send' ?
                                                'bg-blue-600 shadow-blue-500/30' :
                                                'bg-rose-600 shadow-rose-500/30'
                                        )}>
                                            {confirmAction.type === 'send' ? (
                                                <Send className="w-7 h-7 text-white" />
                                            ) : (
                                                <AlertCircle className="w-7 h-7 text-white" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center space-y-3 px-2">
                                        <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                                            {confirmAction.title}
                                        </h2>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            {confirmAction.message}
                                        </p>

                                        {confirmAction.count && (
                                            <div className="flex items-center justify-center gap-2 pt-2">
                                                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-blue-600" />
                                                        <span className="text-lg font-display font-bold text-blue-900">
                                                            {confirmAction.count}
                                                        </span>
                                                        <span className="text-xs font-bold text-blue-600 uppercase">
                                                            Recipients
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setShowConfirmModal(false)}
                                            className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl text-sm transition-all hover:bg-slate-200 active:scale-95 border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowConfirmModal(false);
                                                confirmAction.onConfirm();
                                            }}
                                            className={cn(
                                                "flex-1 font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 group",
                                                confirmAction.type === 'send' ?
                                                    'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/40' :
                                                    'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/40'
                                            )}
                                        >
                                            {confirmAction.type === 'send' ? (
                                                <>
                                                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    <span>Launch Now</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    <span>Delete</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Safety notice for send */}
                                    {confirmAction.type === 'send' && (
                                        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                                                        Spam Protection Active
                                                    </p>
                                                    <p className="text-[10px] text-amber-700 leading-relaxed">
                                                        Emails will be sent with 3-15 second delays to maintain deliverability.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
