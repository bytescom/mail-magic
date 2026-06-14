'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Upload, Pencil, Trash2, Users, FileSpreadsheet, Search, Filter, X, Building2, User2, Briefcase, Mail, Hash, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function HrEmailsPage() {
    const [hrEmails, setHrEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [currentEmail, setCurrentEmail] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedEmail, setExpandedEmail] = useState(null);
    const ITEMS_PER_PAGE = 10;
    const [formData, setFormData] = useState({
        email: '',
        hrName: '',
        company: '',
        jobRole: '',
        tags: '',
        notes: '',
    });

    // CSV/Excel Import Preview State
    const [parsedContacts, setParsedContacts] = useState([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const [editingParsedIndex, setEditingParsedIndex] = useState(null);
    const [editingParsedData, setEditingParsedData] = useState({
        email: '',
        hrName: '',
        company: '',
        jobRole: '',
        tags: '',
        notes: '',
    });

    useEffect(() => {
        fetchHrEmails();
    }, []);

    const fetchHrEmails = async () => {
        try {
            const response = await fetch('/api/hr-emails');
            if (response.ok) {
                const data = await response.json();
                setHrEmails(data);
            } else {
                toast.error('Failed to load HR emails');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load HR emails');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side duplicate check (only on create, not edit)
        if (!currentEmail) {
            const isDuplicate = hrEmails.some(
                (hr) => hr.email.toLowerCase() === formData.email.toLowerCase()
            );
            if (isDuplicate) {
                toast.error('This email already exists in your contacts');
                return;
            }
        }

        const url = currentEmail
            ? `/api/hr-emails/${currentEmail._id}`
            : '/api/hr-emails';
        const method = currentEmail ? 'PUT' : 'POST';

        try {
            // Parse tags from #hashtag format into array
            const tagsArray = formData.tags
                ? formData.tags
                    .split(/[\s,]+/)
                    .map(t => t.replace(/^#/, '').trim())
                    .filter(Boolean)
                : [];

            const submitData = {
                ...formData,
                tags: tagsArray,
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            if (response.ok) {
                toast.success(currentEmail ? 'Contact updated!' : 'Contact added!');
                setShowModal(false);
                setFormData({ email: '', hrName: '', company: '', jobRole: '', tags: '', notes: '' });
                setCurrentEmail(null);
                fetchHrEmails();
            } else {
                const errorData = await response.json();
                if (response.status === 409) {
                    toast.error('This email already exists in your contacts');
                } else {
                    toast.error(errorData.error || 'Failed to save contact');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            const response = await fetch(`/api/hr-emails/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Contact deleted');
                fetchHrEmails();
            } else {
                toast.error('Failed to delete contact');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        }
    };

    const handleEdit = (email) => {
        setCurrentEmail(email);
        setFormData({
            email: email.email,
            hrName: email.hrName || '',
            company: email.company || '',
            jobRole: email.jobRole || '',
            tags: email.tags ? email.tags.map(t => `#${t}`).join(' ') : '',
            notes: email.notes || '',
        });
        setShowModal(true);
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading('Parsing file structure...');

        try {
            const response = await fetch('/api/hr-emails/import', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast.dismiss(toastId);
                if (result.success && Array.isArray(result.contacts)) {
                    setParsedContacts(result.contacts);
                    setShowImportModal(false);
                    setShowPreviewModal(true);
                    toast.success(`Successfully parsed ${result.contacts.length} contacts!`);
                } else {
                    toast.error('Failed to parse contacts from file');
                }
            } else {
                const err = await response.json();
                toast.dismiss(toastId);
                toast.error(err.error || 'Failed to parse file');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.dismiss(toastId);
            toast.error('Something went wrong during parsing');
        } finally {
            e.target.value = '';
        }
    };

    const handleFinalizeImport = async () => {
        if (parsedContacts.length === 0) {
            toast.error('No contacts to import');
            return;
        }

        // Validate that there are no rows with errors before import
        const hasErrors = parsedContacts.some(c => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return !c.email || !emailRegex.test(c.email) || !c.company || !c.jobRole;
        });

        if (hasErrors) {
            toast.error('Please fix all validation errors before importing');
            return;
        }

        setImporting(true);
        const toastId = toast.loading('Saving contacts to database...');

        try {
            const response = await fetch('/api/hr-emails/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts: parsedContacts }),
            });

            if (response.ok) {
                const result = await response.json();
                toast.dismiss(toastId);
                toast.success(`Successfully imported ${result.imported} contacts! Skipped ${result.skipped} duplicates, Errors: ${result.errors}`);
                setShowPreviewModal(false);
                setParsedContacts([]);
                fetchHrEmails();
            } else {
                const err = await response.json();
                toast.dismiss(toastId);
                toast.error(err.error || 'Failed to finalize import');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.dismiss(toastId);
            toast.error('Something went wrong during import');
        } finally {
            setImporting(false);
        }
    };

    const handleDeletePreviewContact = (index) => {
        setParsedContacts(prev => prev.filter((_, idx) => idx !== index));
        toast.success('Removed from import preview');
    };

    const handleEditPreviewContact = (index) => {
        const contact = parsedContacts[index];
        setEditingParsedIndex(index);
        setEditingParsedData({
            email: contact.email || '',
            hrName: contact.hrName || '',
            company: contact.company || '',
            jobRole: contact.jobRole || '',
            tags: Array.isArray(contact.tags) ? contact.tags.map(t => `#${t}`).join(' ') : (contact.tags || ''),
            notes: contact.notes || '',
        });
    };

    const handleSavePreviewEdit = (e) => {
        e.preventDefault();
        if (editingParsedIndex === null) return;

        const tagsArray = editingParsedData.tags
            ? editingParsedData.tags
                .split(/[\s,]+/)
                .map(t => t.replace(/^#/, '').trim())
                .filter(Boolean)
            : [];

        const updatedContact = {
            ...editingParsedData,
            tags: tagsArray,
        };

        setParsedContacts(prev => {
            const next = [...prev];
            next[editingParsedIndex] = updatedContact;
            return next;
        });

        setEditingParsedIndex(null);
        toast.success('Updated contact details in preview');
    };

    const validateContact = (c) => {
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!c.email) errors.push('Email is required');
        else if (!emailRegex.test(c.email)) errors.push('Invalid email format');
        if (!c.company) errors.push('Company is required');
        if (!c.jobRole) errors.push('Job role is required');
        return errors;
    };

    const getInitials = (contact) => {
        if (contact.hrName) {
            const parts = contact.hrName.trim().split(/\s+/);
            if (parts.length > 1) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0].substring(0, 2).toUpperCase();
        }
        if (contact.company) {
            return contact.company.substring(0, 2).toUpperCase();
        }
        if (contact.email) {
            return contact.email.substring(0, 2).toUpperCase();
        }
        return 'HR';
    };

    const getAvatarBg = (contact) => {
        const str = contact.email || contact.company || contact.hrName || 'HR';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % 6;
        const gradients = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-violet-500 to-purple-600',
            'from-amber-500 to-orange-600',
            'from-rose-500 to-pink-600',
            'from-cyan-500 to-blue-600',
        ];
        return gradients[index];
    };

    const filteredEmails = hrEmails.filter(contact => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        // Support #hashtag search
        if (query.startsWith('#')) {
            const tagQuery = query.slice(1);
            return contact.tags && contact.tags.some(tag =>
                tag.toLowerCase().includes(tagQuery)
            );
        }

        return (
            contact.email.toLowerCase().includes(query) ||
            (contact.hrName && contact.hrName.toLowerCase().includes(query)) ||
            (contact.company && contact.company.toLowerCase().includes(query)) ||
            (contact.jobRole && contact.jobRole.toLowerCase().includes(query)) ||
            (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    });

    const totalPages = Math.ceil(filteredEmails.length / ITEMS_PER_PAGE);
    const paginatedEmails = filteredEmails.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Scanning HR database...</p>
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
                            <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Contacts</h2>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                HR & Recruiters
                            </h1>
                            <p className="text-slate-500 max-w-lg text-sm leading-relaxed font-sans">
                                Maintain your network of HR contacts and recruitment professionals.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-200 border border-slate-200/50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Upload className="w-4 h-4 text-slate-500" />
                                <span>Import CSV/Excel</span>
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentEmail(null);
                                    setFormData({ email: '', hrName: '', company: '', jobRole: '', tags: '', notes: '' });
                                    setShowModal(true);
                                }}
                                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-white" />
                                <span>Add Contact</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>
                        <button className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Grid/Table Area */}
                    {filteredEmails.length === 0 ? (
                        <div className="bg-white border border-slate-200/60 border-dashed rounded-xl py-24 text-center px-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                                <Users className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">
                                {searchQuery ? 'No contacts found' : 'No HR contacts yet'}
                            </h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium text-lg">
                                {searchQuery ? 'Double check your spelling or try a different term.' : 'Begin your job search journey by adding recruitment contacts manually or importing a list.'}
                            </p>
                            {!searchQuery && (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="w-full sm:w-auto bg-blue-600 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Manual Add</span>
                                    </button>
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="w-full sm:w-auto bg-slate-900 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-800 flex items-center justify-center"
                                    >
                                        <span>Cloud Import</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <section aria-label="HR Contacts" className='border border-slate-200/60 bg-white shadow-sm rounded-xl flex flex-col mb-12'>
                            <article>
                                <div className="flex items-end justify-between px-6 lg:px-8 pt-6 lg:pt-8  mb-4 lg:mb-5">
                                    <p className="text-sm text-slate-500 font-medium pb-2">All stored HR contacts and recruiters.</p>
                                </div>

                                {/* Column Headers */}
                                <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_1.3fr_1.5fr_1fr_0.8fr] gap-0 px-6 lg:px-12 pb-2 border-b border-slate-100 bg-slate-100 pt-3">
                                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">#</span>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Email</span>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Company</span>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Role</span>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Tags</span>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase text-right">Actions</span>
                                </div>

                                <div className="flex flex-col gap-1 px-4 lg:px-6 py-4">
                                    {paginatedEmails.map((email, idx) => {
                                        const originalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                                        const isExpanded = expandedEmail === email._id;
                                        return (
                                            <div key={email._id} className="flex flex-col gap-0 border border-slate-200/60 rounded-lg hover:bg-slate-50/80 transition-colors group">
                                                {/* Desktop View Header Row */}
                                                <div
                                                    className="hidden sm:grid grid-cols-[0.5fr_2.5fr_1.3fr_1.5fr_1fr_0.8fr] gap-0 items-center px-4 py-4 cursor-pointer"
                                                    onClick={() => setExpandedEmail(isExpanded ? null : email._id)}
                                                >
                                                    {/* S.No. */}
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-bold text-slate-400">{originalIdx}</span>
                                                    </div>

                                                    {/* Contact */}
                                                    <div className="flex items-center gap-3 min-w-0 pr-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                            <Mail className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                                {email.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Company */}
                                                    <div className="flex flex-col justify-center min-w-0 pr-4">
                                                        <p className="text-sm font-medium text-slate-600 truncate">{email.company || '—'}</p>
                                                    </div>

                                                    {/* Role */}
                                                    <div className="flex flex-col justify-center min-w-0 pr-4">
                                                        <p className="text-xs text-slate-500 font-medium truncate">{email.jobRole || '—'}</p>
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-1.5 pr-4">
                                                        {email.tags && email.tags.length > 0 ? (
                                                            email.tags.slice(0, 3).map((tag, i) => {
                                                                const colors = [
                                                                    'bg-blue-50 text-blue-600 border-blue-100',
                                                                    'bg-emerald-50 text-emerald-600 border-emerald-100',
                                                                    'bg-violet-50 text-violet-600 border-violet-100',
                                                                    'bg-amber-50 text-amber-600 border-amber-100',
                                                                    'bg-rose-50 text-rose-600 border-rose-100',
                                                                    'bg-cyan-50 text-cyan-600 border-cyan-100',
                                                                ];
                                                                return (
                                                                    <span
                                                                        key={i}
                                                                        className={cn(
                                                                            "px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border whitespace-nowrap",
                                                                            colors[i % colors.length]
                                                                        )}
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-xs text-slate-300">—</span>
                                                        )}
                                                        {email.tags && email.tags.length > 3 && (
                                                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-400 border border-slate-200 whitespace-nowrap">
                                                                +{email.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(email); }}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(email._id); }}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        >
                                                            <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Mobile View Header Row (Inbox-like) */}
                                                <div
                                                    className="flex sm:hidden items-start justify-between px-4 py-4 cursor-pointer gap-3 min-w-0"
                                                    onClick={() => setExpandedEmail(isExpanded ? null : email._id)}
                                                >
                                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                                        {/* Avatar */}
                                                        <div className={cn(
                                                            "w-11 h-11 rounded-full bg-gradient-to-br text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm border border-white/10",
                                                            getAvatarBg(email)
                                                        )}>
                                                            {getInitials(email)}
                                                        </div>

                                                        {/* Details Stack */}
                                                        <div className="min-w-0 flex-1 space-y-0.5">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-sm font-bold text-slate-900 truncate">
                                                                    {email.hrName || 'Recruiter'}
                                                                </span>
                                                                {email.company && (
                                                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100/30 px-1.5 py-0.25 rounded-md truncate max-w-[120px]">
                                                                        @{email.company}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            <p className="text-xs text-slate-500 truncate font-medium">
                                                                {email.email}
                                                            </p>
                                                            
                                                            {email.jobRole && (
                                                                <p className="text-xs text-slate-600 font-semibold truncate flex items-center gap-1">
                                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                    {email.jobRole}
                                                                </p>
                                                            )}

                                                            {/* Tags */}
                                                            {email.tags && email.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 pt-1">
                                                                    {email.tags.slice(0, 2).map((tag, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-semibold whitespace-nowrap"
                                                                        >
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                    {email.tags.length > 2 && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-400 text-[9px] font-semibold whitespace-nowrap">
                                                                            +{email.tags.length - 2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(email); }}
                                                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 active:bg-blue-50 hover:bg-blue-50 transition-all cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(email._id); }}
                                                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 active:bg-rose-50 hover:bg-rose-50 transition-all cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="p-1 text-slate-400 shrink-0">
                                                            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Details View */}
                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-5 rounded-b-lg">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div className="p-4 bg-white border border-slate-200/60 rounded-xl shadow-sm space-y-3">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                                                    <User2 className="w-3.5 h-3.5 text-blue-500" /> Professional Details
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">HR Name</span>
                                                                        <span className="text-xs font-semibold text-slate-700">{email.hrName || 'Not provided'}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Email</span>
                                                                        <span className="text-xs font-semibold text-slate-700 truncate">{email.email}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Company</span>
                                                                        <span className="text-xs font-semibold text-slate-700">{email.company || 'Not provided'}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Job Role</span>
                                                                        <span className="text-xs font-semibold text-slate-700">{email.jobRole || 'Not provided'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="p-4 bg-white border border-slate-200/60 rounded-xl shadow-sm flex flex-col justify-between min-h-[120px]">
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                                                        <Pencil className="w-3.5 h-3.5 text-amber-500" /> Strategic Notes
                                                                    </p>
                                                                    <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                                                                        {email.notes || <span className="italic text-slate-400">No strategic notes available for this recruiter.</span>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer Pagination */}
                                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl mt-auto">
                                    <p className="text-xs font-medium text-slate-500">
                                        {filteredEmails.length > 0 ? (
                                            <>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmails.length)} of {filteredEmails.length} Contacts</>
                                        ) : (
                                            <>No Contacts</>
                                        )}
                                    </p>
                                    {totalPages > 1 && (
                                        <div className="flex gap-2">
                                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft size={16} /></button>
                                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronRight size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        </section>
                    )}

                    {/* Add/Edit Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans overflow-y-auto">
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                            <div className="bg-white max-w-xl w-full rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden my-auto">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                                            {currentEmail ? 'Update Contact Profile' : 'Add Professional Contact'}
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">Capture essential recruiter information for your database.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                            placeholder="recruiter@company.com"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.hrName}
                                                onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                                placeholder="Sarah Miller"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Organization <span className="text-rose-400">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                                placeholder="Tesla Inc."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Position / Role <span className="text-rose-400">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.jobRole}
                                            onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                            placeholder="Software Engineer, PM, etc."
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                            <Hash className="w-3 h-3" />
                                            Tags
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                            placeholder="#react #frontend #remote #startup"
                                        />
                                        <p className="text-[10px] text-slate-400 ml-1 font-medium">Space-separated hashtags for filtering. e.g. #react #frontend</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Strategic Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none min-h-[80px] placeholder:font-normal"
                                            placeholder="Notes about this contact..."
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20 cursor-pointer"
                                        >
                                            {currentEmail ? 'Sync Profile' : 'Finalize Profile'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-200 cursor-pointer"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Import Modal */}
                    {showImportModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowImportModal(false)} />
                            <div className="bg-white max-w-xl w-full rounded-xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-5 duration-500 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Structured Import</h2>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Batch upload contacts using a standard CSV format.</p>
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">CSV/Excel Schema</p>
                                        <div className="bg-slate-900 p-5 rounded-xl font-mono text-[13px] border border-slate-800 shadow-inner text-center space-y-2">
                                            <div className="text-blue-400">email*, company*, jobRole*, hrName, tags, notes</div>
                                            <div className="text-slate-500 text-[11px]">* = required &nbsp;|&nbsp; tags = #hashtag format</div>
                                        </div>
                                    </div>

                                    <div className="group relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                                        <label className="relative flex flex-col items-center justify-center gap-4 py-16 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 transition-all overflow-hidden group">
                                            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-slate-900">Drop your file here</p>
                                                <p className="text-sm font-medium text-slate-500 mt-1">CSV or Excel (.xlsx, .xls) accepted</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleImport}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-800 cursor-pointer"
                                    >
                                        Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Import Modal */}
                    {showPreviewModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans overflow-y-auto">
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !importing && setShowPreviewModal(false)} />
                            <div className="bg-white max-w-4xl w-full rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden my-auto border border-slate-100">
                                {/* Header */}
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                            Preview & Verify Imported Contacts
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">
                                            Verify and edit details before saving. Red rows require correction.
                                        </p>
                                    </div>
                                    <button
                                        disabled={importing}
                                        onClick={() => setShowPreviewModal(false)}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content Body */}
                                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                                    {parsedContacts.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400 font-medium">
                                            No contacts parsed.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Desktop View Table */}
                                            <div className="hidden md:block border border-slate-200/60 rounded-xl overflow-hidden shadow-inner bg-slate-50/50">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-100 text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-200/50">
                                                            <th className="py-3 px-4">HR Name</th>
                                                            <th className="py-3 px-4">Email</th>
                                                            <th className="py-3 px-4">Company</th>
                                                            <th className="py-3 px-4">Role</th>
                                                            <th className="py-3 px-4">Tags</th>
                                                            <th className="py-3 px-4 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-sm">
                                                        {parsedContacts.map((c, index) => {
                                                            const errors = validateContact(c);
                                                            const hasError = errors.length > 0;
                                                            return (
                                                                <tr key={index} className={cn(
                                                                    "hover:bg-slate-50/50 transition-colors",
                                                                    hasError ? "bg-rose-50/20" : "bg-white"
                                                                )}>
                                                                    <td className="py-3 px-4 font-semibold text-slate-700">
                                                                        {c.hrName || <span className="italic text-slate-400">Not provided</span>}
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="space-y-1">
                                                                            <span className="font-semibold text-slate-900">{c.email}</span>
                                                                            {errors.includes('Email is required') && <span className="block text-[10px] font-bold text-rose-500">Email is required</span>}
                                                                            {errors.includes('Invalid email format') && <span className="block text-[10px] font-bold text-rose-500">Invalid email format</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="space-y-1">
                                                                            <span className="text-slate-600 font-medium">{c.company}</span>
                                                                            {errors.includes('Company is required') && <span className="block text-[10px] font-bold text-rose-500">Company is required</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="space-y-1">
                                                                            <span className="text-slate-600 font-medium">{c.jobRole}</span>
                                                                            {errors.includes('Job role is required') && <span className="block text-[10px] font-bold text-rose-500">Job role is required</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {c.tags && c.tags.length > 0 ? (
                                                                                c.tags.map((t, i) => (
                                                                                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-500 border border-slate-200">
                                                                                        #{t}
                                                                                    </span>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-slate-300 text-xs">—</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right">
                                                                        <div className="flex items-center justify-end gap-1.5">
                                                                            <button
                                                                                onClick={() => handleEditPreviewContact(index)}
                                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                                title="Edit"
                                                                            >
                                                                                <Pencil className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeletePreviewContact(index)}
                                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                                title="Remove"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile View List */}
                                            <div className="block md:hidden space-y-3">
                                                {parsedContacts.map((c, index) => {
                                                    const errors = validateContact(c);
                                                    const hasError = errors.length > 0;
                                                    return (
                                                        <div key={index} className={cn(
                                                            "p-4 border rounded-xl space-y-3 shadow-sm animate-in fade-in duration-300",
                                                            hasError ? "bg-rose-50/25 border-rose-200/80" : "bg-white border-slate-200/60"
                                                        )}>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-sm font-bold text-slate-900">{c.hrName || 'Recruiter'}</span>
                                                                        {c.company && <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.25 rounded-md">@{c.company}</span>}
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{c.email || <span className="italic text-rose-500 font-bold">Email missing</span>}</p>
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <button
                                                                        onClick={() => handleEditPreviewContact(index)}
                                                                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 active:bg-blue-50"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePreviewContact(index)}
                                                                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 active:bg-rose-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Role</span>
                                                                    <span className="text-slate-800">{c.jobRole || <span className="italic text-rose-500 font-bold">Missing</span>}</span>
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Company</span>
                                                                    <span className="text-slate-800">{c.company || <span className="italic text-rose-500 font-bold">Missing</span>}</span>
                                                                </div>
                                                            </div>

                                                            {/* Error Badges */}
                                                            {hasError && (
                                                                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg space-y-1">
                                                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Fix Required:</p>
                                                                    <ul className="list-disc list-inside text-[11px] text-rose-600 font-semibold space-y-0.5">
                                                                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-500 font-medium">
                                        Total: <strong className="text-slate-800 font-bold">{parsedContacts.length}</strong> contacts.
                                        {parsedContacts.some(c => validateContact(c).length > 0) && (
                                            <span className="text-rose-600 ml-2 font-semibold flex items-center gap-1 inline-flex">
                                                ⚠️ Has validation errors. Please edit/remove to proceed.
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex gap-3">
                                        <button
                                            disabled={importing}
                                            onClick={() => setShowPreviewModal(false)}
                                            className="px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={importing || parsedContacts.length === 0 || parsedContacts.some(c => validateContact(c).length > 0)}
                                            onClick={handleFinalizeImport}
                                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                        >
                                            {importing ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    Confirm & Import ({parsedContacts.length})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inline Edit Preview Modal */}
                    {editingParsedIndex !== null && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 text-sans overflow-y-auto">
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-300" onClick={() => setEditingParsedIndex(null)} />
                            <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden my-auto border border-slate-100">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <h2 className="text-lg font-display font-bold text-slate-900 tracking-tight">
                                            Edit Import Candidate
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">Modify this contact's details before importing.</p>
                                    </div>
                                    <button
                                        onClick={() => setEditingParsedIndex(null)}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSavePreviewEdit} className="p-6 space-y-4 overflow-y-auto">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address <span className="text-rose-500">*</span></label>
                                        <input
                                            type="email"
                                            value={editingParsedData.email}
                                            onChange={(e) => setEditingParsedData({ ...editingParsedData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            placeholder="recruiter@company.com"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">HR Name</label>
                                            <input
                                                type="text"
                                                value={editingParsedData.hrName}
                                                onChange={(e) => setEditingParsedData({ ...editingParsedData, hrName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                                placeholder="Jane Doe"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Company <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                value={editingParsedData.company}
                                                onChange={(e) => setEditingParsedData({ ...editingParsedData, company: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                                placeholder="Tesla"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Position / Role <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            value={editingParsedData.jobRole}
                                            onChange={(e) => setEditingParsedData({ ...editingParsedData, jobRole: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            placeholder="Technical Recruiter"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tags</label>
                                        <input
                                            type="text"
                                            value={editingParsedData.tags}
                                            onChange={(e) => setEditingParsedData({ ...editingParsedData, tags: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            placeholder="#react #tech"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Notes</label>
                                        <textarea
                                            value={editingParsedData.notes}
                                            onChange={(e) => setEditingParsedData({ ...editingParsedData, notes: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none min-h-[60px]"
                                            placeholder="Notes..."
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all hover:bg-blue-700 shadow-md shadow-blue-500/15 cursor-pointer"
                                        >
                                            Update Preview
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingParsedIndex(null)}
                                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl text-xs transition-all hover:bg-slate-200 cursor-pointer"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
