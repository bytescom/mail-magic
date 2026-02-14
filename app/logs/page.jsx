'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { ListChecks, CheckCircle2, XCircle, Filter, Download, ArrowRight, Clock, User2, Mail, Building2, Search, X, Eye, FileText, Info, History } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, getStatusBadgeClass, cn } from '@/lib/utils';

// Separate component for content that uses useSearchParams
function LogsPageContent() {
    const searchParams = useSearchParams();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    // Handle logId from URL query parameter
    useEffect(() => {
        const logId = searchParams.get('logId');
        if (logId && logs.length > 0) {
            const log = logs.find(l => l._id === logId);
            if (log) {
                setSelectedLog(log);
                // Remove logId from URL without refresh
                window.history.replaceState({}, '', '/logs');
            }
        }
    }, [searchParams, logs]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/api/logs' : `/api/logs?status=${filter}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            } else {
                toast.error('Failed to load logs');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const exportLogs = () => {
        const csv = [
            ['Date', 'Recipient', 'Subject', 'Status', 'Template', 'HR Name', 'Company'],
            ...logs.map((log) => [
                formatDate(log.createdAt),
                log.recipient,
                log.subject,
                log.status,
                log.templateId?.name || 'N/A',
                log.hrEmailId?.hrName || 'N/A',
                log.hrEmailId?.company || 'N/A',
            ]),
        ]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autojobmailer-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Logs exported successfully!');
    };

    const filteredLogs = logs.filter(log =>
        log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.hrEmailId?.company && log.hrEmailId.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = {
        total: logs.length,
        sent: logs.filter((l) => l.status === 'sent').length,
        failed: logs.filter((l) => l.status === 'failed').length,
    };

    if (loading && logs.length === 0) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Retrieving communication history...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <main className="w-full max-w-7xl mx-auto overflow-x-hidden">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-1">
                                <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">History</h2>
                                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                                    Communication Logs
                                </h1>
                                <p className="text-slate-500 max-w-lg text-sm leading-relaxed font-sans">
                                    Complete record of your correspondence with recruitment teams.
                                </p>
                            </div>

                            <button
                                onClick={exportLogs}
                                disabled={logs.length === 0}
                                className="bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-800 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                <span>Export Audit Trail</span>
                            </button>
                        </div>

                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: 'Total Transmissions', value: stats.total, icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Successful Delivery', value: stats.sent, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Delivery Failures', value: stats.failed, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm flex items-center gap-5 group transition-all hover:shadow-md hover:border-slate-300">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sophisticated Filter & Search */}
                        <div className="bg-white border border-slate-200/60 p-4 rounded-3xl shadow-sm space-y-4">
                            <div className="flex flex-col lg:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/50 w-full lg:w-auto">
                                    {['all', 'sent', 'failed'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setFilter(s)}
                                            className={cn(
                                                "flex-1 lg:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
                                                filter === s
                                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                                                    : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Records Area */}
                        {filteredLogs.length === 0 ? (
                            <div className="bg-white border border-slate-200/60 border-dashed rounded-[3rem] py-24 text-center px-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                                    <ListChecks className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">
                                    No records found
                                </h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-4 font-medium text-lg">
                                    {searchQuery ? 'We couldn\'t find any log matching your query.' : 'Your transmission history is currently empty.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Mobile Card View */}
                                <div className="grid grid-cols-1 gap-4 lg:hidden">
                                    {filteredLogs.map((log) => (
                                        <div key={log._id} className="bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200/50">
                                                        <User2 className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-display font-bold text-slate-900 text-base truncate">{log.hrEmailId?.hrName || 'System Lead'}</p>
                                                        <p className="text-xs font-medium text-slate-500 truncate">{log.recipient}</p>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider",
                                                    log.status === 'sent' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                )}>
                                                    {log.status === 'sent' ? 'Sent' : 'Fail'}
                                                </div>
                                            </div>

                                            <div className="py-3 border-y border-slate-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject Header</p>
                                                <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed italic">"{log.subject}"</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                        {new Date(log.createdAt).toLocaleDateString()} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-200/60"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
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
                                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Communications Lead</th>
                                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subject Line</th>
                                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredLogs.map((log, index) => (
                                                    <tr
                                                        key={log._id}
                                                        className="hover:bg-slate-50/80 transition-all group animate-in slide-in-from-left-2 duration-500 fill-mode-both"
                                                        style={{ animationDelay: `${index * 20}ms` }}
                                                    >
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-bold text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                                    <User2 className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                                <div className="min-w-0 max-w-[150px]">
                                                                    <p className="text-sm font-bold text-slate-900 truncate">{log.hrEmailId?.hrName || 'System Lead'}</p>
                                                                    <p className="text-xs font-medium text-slate-500 truncate">{log.recipient}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="max-w-[150px] xl:max-w-md">
                                                                <p className="text-sm font-medium text-slate-600 truncate italic">"{log.subject}"</p>
                                                                <div className="mt-1.5 px-2 py-0.5 rounded-md bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-tight w-fit">
                                                                    {log.templateId?.name || 'Manual Dispatch'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider whitespace-nowrap",
                                                                log.status === 'sent'
                                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                                    : "bg-rose-50 text-rose-600 border-rose-100"
                                                            )}>
                                                                <div className={cn("h-1.5 w-1.5 rounded-full", log.status === 'sent' ? "bg-emerald-500" : "bg-rose-500")} />
                                                                {log.status === 'sent' ? 'Delivered' : 'Failed'}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <button
                                                                onClick={() => setSelectedLog(log)}
                                                                className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-blue-600 hover:shadow-md transition-all border border-slate-200/60 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0"
                                                                title="Inspect Payload"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detail Inspector Modal */}
                        {selectedLog && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans">
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedLog(null)} />
                                <div className="bg-white max-w-full rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-5 duration-500 flex flex-col max-h-[90vh] overflow-hidden">
                                    <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white relative">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                                                selectedLog.status === 'sent' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                {selectedLog.status === 'sent' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Transmission Details</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLog.status === 'sent' ? 'Successful Delivery' : 'Dispatch Failure'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedLog(null)}
                                            className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10">
                                        {/* Grid Details */}
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        Recipient Email
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{selectedLog.recipient}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Transmission Time
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{formatDate(selectedLog.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        Organizational Context
                                                    </p>
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{selectedLog.hrEmailId?.company || 'N/A'}</p>
                                                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter italic">{selectedLog.hrEmailId?.jobRole || 'No role defined'}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        Template Asset
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{selectedLog.templateId?.name || 'Custom Dispatch'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email Content */}
                                        <div className="space-y-4">
                                            <div className="p-4 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-200/60 shadow-inner relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-[10px] font-bold text-slate-400 uppercase shadow-sm">Verified Payload</div>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-base font-bold text-slate-900 leading-tight">Subject: {selectedLog.subject}</p>
                                                    <div className="h-px bg-slate-200/60 w-full" />
                                                    <div className="text-sm text-slate-600 font-medium leading-[1.8] whitespace-pre-wrap">
                                                        {selectedLog.body}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Error State */}
                                        {selectedLog.status === 'failed' && (
                                            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 flex gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                                    <Info className="w-5 h-5 text-rose-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-rose-900">Failure Investigation Report</p>
                                                    <p className="text-xs text-rose-600 font-medium mt-1 leading-relaxed">{selectedLog.errorMessage || 'Unknown dispatcher error occurred during transmission.'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ID Metadata */}
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg w-fit">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Internal Hash:</span>
                                            <span className="text-[10px] font-medium text-slate-400 font-mono">{selectedLog._id}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-8 bg-white border-t border-slate-100">
                                        <button
                                            onClick={() => setSelectedLog(null)}
                                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 hover:bg-slate-800 shadow-xl shadow-slate-900/10"
                                        >
                                            Acknowledge & Close
                                        </button>
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

// Main export with Suspense boundary (required for useSearchParams in Next.js 13+)
export default function LogsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto">
                        <div className="w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Activity Logs...</p>
                </div>
            </div>
        }>
            <LogsPageContent />
        </Suspense>
    );
}
