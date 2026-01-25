'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Upload, Pencil, Trash2, Users, FileSpreadsheet, Search, Filter, X, Building2, User2, Briefcase, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function HrEmailsPage() {
    const [hrEmails, setHrEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [currentEmail, setCurrentEmail] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        hrName: '',
        company: '',
        jobRole: '',
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

        const url = currentEmail
            ? `/api/hr-emails/${currentEmail._id}`
            : '/api/hr-emails';
        const method = currentEmail ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(currentEmail ? 'Contact updated!' : 'Contact added!');
                setShowModal(false);
                setFormData({ email: '', hrName: '', company: '', jobRole: '', notes: '' });
                setCurrentEmail(null);
                fetchHrEmails();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to save contact');
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
            notes: email.notes || '',
        });
        setShowModal(true);
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/hr-emails/import', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(`Imported ${result.imported} contacts! Skipped ${result.skipped}, Errors ${result.errors}`);
                setShowImportModal(false);
                fetchHrEmails();
            } else {
                toast.error('Failed to import CSV');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        }
    };

    const filteredEmails = hrEmails.filter(contact =>
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.hrName && contact.hrName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
                            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                                HR & Recruiters
                            </h1>
                            <p className="text-slate-500 max-w-lg text-sm leading-relaxed font-sans">
                                Maintain your network of HR contacts and recruitment professionals.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-200 border border-slate-200/50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Upload className="w-4 h-4 text-slate-500" />
                                <span>Import CSV</span>
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentEmail(null);
                                    setFormData({ email: '', hrName: '', company: '', jobRole: '', notes: '' });
                                    setShowModal(true);
                                }}
                                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-white" />
                                <span>Add Contact</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white border border-slate-200/60 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>
                        <button className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Grid/Table Area */}
                    {filteredEmails.length === 0 ? (
                        <div className="bg-white border border-slate-200/60 border-dashed rounded-[3rem] py-24 text-center px-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
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
                                        className="w-full sm:w-auto bg-blue-600 text-white font-bold px-10 py-4 rounded-[1.5rem] text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Manual Add</span>
                                    </button>
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="w-full sm:w-auto bg-slate-900 text-white font-bold px-10 py-4 rounded-[1.5rem] text-sm transition-all active:scale-95 hover:bg-slate-800 flex items-center justify-center"
                                    >
                                        <span>Cloud Import</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Mobile Card View */}
                            <div className="grid grid-cols-1 gap-4 lg:hidden">
                                {filteredEmails.map((email) => (
                                    <div key={email._id} className="bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200/50">
                                                    <User2 className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-display font-bold text-slate-900 text-base truncate">{email.hrName || 'Lead Identifier'}</p>
                                                    <p className="text-xs font-medium text-slate-500 truncate">{email.email}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-2 h-2 rounded-full mt-2",
                                                email.status === 'contacted' ? "bg-emerald-500" : "bg-blue-500"
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company</p>
                                                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 line-clamp-1">
                                                    <Building2 className="w-3 h-3 text-blue-500" />
                                                    {email.company || 'Private Entity'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</p>
                                                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 line-clamp-1">
                                                    <Briefcase className="w-3 h-3 text-slate-300" />
                                                    {email.jobRole || 'Recruiter'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 pt-2">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider",
                                                email.status === 'contacted' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                            )}>
                                                {email.status || 'Active'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(email)}
                                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-200/60"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(email._id)}
                                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-200/60"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden lg:block bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden mb-12">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-sans text-sans">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact Identity</th>
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Professional Profile</th>
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lifecycle Status</th>
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredEmails.map((email, index) => (
                                                <tr
                                                    key={email._id}
                                                    className="hover:bg-slate-50/80 transition-all group animate-in slide-in-from-left-2 duration-500 fill-mode-both"
                                                    style={{ animationDelay: `${index * 30}ms` }}
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500 shadow-sm border border-slate-200/50">
                                                                <User2 className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                                            </div>
                                                            <div className="min-w-0 max-w-[200px]">
                                                                <p className="font-display font-bold text-slate-900 text-base truncate">{email.hrName || 'Lead Identifier'}</p>
                                                                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5 group-hover:text-blue-600 transition-colors truncate">
                                                                    <Mail className="w-3.5 h-3.5 opacity-50" />
                                                                    {email.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="space-y-1.5">
                                                            <p className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                                                                <Building2 className="w-4 h-4 text-blue-500" />
                                                                {email.company || 'Private Entity'}
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-500 flex items-center gap-2 truncate">
                                                                <Briefcase className="w-4 h-4 text-slate-300" />
                                                                {email.jobRole || 'Senior Recruiter'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider",
                                                            email.status === 'contacted'
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                                : "bg-blue-50 text-blue-600 border-blue-100"
                                                        )}>
                                                            <div className={cn("h-1.5 w-1.5 rounded-full", email.status === 'contacted' ? "bg-emerald-500" : "bg-blue-500")} />
                                                            {email.status || 'Verified Active'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                                            <button
                                                                onClick={() => handleEdit(email)}
                                                                className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-blue-600 hover:shadow-md transition-all border border-slate-200/60 cursor-pointer"
                                                                title="Edit Details"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(email._id)}
                                                                className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:shadow-md transition-all border border-slate-200/60 cursor-pointer"
                                                                title="Remove Contact"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add/Edit Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans">
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                            <div className="bg-white max-w-xl w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                                            {currentEmail ? 'Update Contact Profile' : 'Add Professional Contact'}
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">Capture essential recruiter information for your database.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
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
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                                placeholder="Sarah Miller"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Organization</label>
                                            <input
                                                type="text"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                                placeholder="Tesla Inc."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Position / Role</label>
                                        <div className="relative">
                                            <select
                                                value={formData.jobRole}
                                                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                                            >
                                                <option value="">Select a role or type below...</option>
                                                <optgroup label="Engineering">
                                                    <option value="Software Engineer">Software Engineer</option>
                                                    <option value="Frontend Developer">Frontend Developer</option>
                                                    <option value="Backend Developer">Backend Developer</option>
                                                    <option value="Full Stack Developer">Full Stack Developer</option>
                                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                                    <option value="Data Engineer">Data Engineer</option>
                                                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                                                    <option value="QA Engineer">QA Engineer</option>
                                                    <option value="Software Tester">Software Tester</option>
                                                    <option value="Mobile Developer">Mobile Developer</option>
                                                </optgroup>
                                                <optgroup label="Design">
                                                    <option value="UI/UX Designer">UI/UX Designer</option>
                                                    <option value="Product Designer">Product Designer</option>
                                                    <option value="Graphic Designer">Graphic Designer</option>
                                                </optgroup>
                                                <optgroup label="Management">
                                                    <option value="Product Manager">Product Manager</option>
                                                    <option value="Project Manager">Project Manager</option>
                                                    <option value="Engineering Manager">Engineering Manager</option>
                                                    <option value="Technical Lead">Technical Lead</option>
                                                </optgroup>
                                                <optgroup label="Data & Analytics">
                                                    <option value="Data Scientist">Data Scientist</option>
                                                    <option value="Data Analyst">Data Analyst</option>
                                                    <option value="Business Analyst">Business Analyst</option>
                                                </optgroup>
                                                <optgroup label="Internships">
                                                    <option value="Software Engineer Intern">Software Engineer Intern</option>
                                                    <option value="Frontend Developer Intern">Frontend Developer Intern</option>
                                                    <option value="Backend Developer Intern">Backend Developer Intern</option>
                                                    <option value="Full Stack Developer Intern">Full Stack Developer Intern</option>
                                                    <option value="QA Intern">QA Intern</option>
                                                    <option value="Data Science Intern">Data Science Intern</option>
                                                </optgroup>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.jobRole}
                                            onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl bg-white border border-slate-100 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-normal"
                                            placeholder="Or type a custom role here..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Strategic Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none min-h-[100px] placeholder:font-normal"
                                            placeholder="Found through LinkedIn, interested in React roles..."
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-blue-700 shadow-xl shadow-blue-500/20 cursor-pointer"
                                        >
                                            {currentEmail ? 'Sync Profile' : 'Finalize Profile'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-200 cursor-pointer"
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
                            <div className="bg-white max-w-xl w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-5 duration-500 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Structured Import</h2>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Batch upload contacts using a standard CSV format.</p>
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Required Data Schema</p>
                                        <div className="bg-slate-900 p-5 rounded-2xl font-mono text-[13px] text-blue-400 border border-slate-800 shadow-inner text-center">
                                            email, hrName, company, jobRole, notes
                                        </div>
                                    </div>

                                    <div className="group relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                                        <label className="relative flex flex-col items-center justify-center gap-4 py-16 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 transition-all overflow-hidden group">
                                            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-slate-900">Drop your CSV here</p>
                                                <p className="text-sm font-medium text-slate-500 mt-1">or click to browse your file system</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleImport}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-800 cursor-pointer"
                                    >
                                        Return to Dashboard
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
