'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { ListChecks, CheckCircle2, XCircle, Filter, Download, ArrowRight, Clock, User2, Mail, Building2, Search, X, Eye, FileText, Info, History, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                                className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-800 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                                <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-xl shadow-sm flex items-center gap-5 group transition-all hover:shadow-md hover:border-slate-300">
                                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
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
                        <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-4">
                            <div className="flex flex-col lg:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50 w-full lg:w-auto">
                                    {['all', 'sent', 'failed'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setFilter(s)}
                                            className={cn(
                                                "flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest",
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
                            <div className="bg-white border border-slate-200/60 border-dashed rounded-xl py-24 text-center px-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
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
                            <section aria-label="Activity Log" className='border border-slate-200/60 bg-white shadow-sm rounded-xl flex flex-col mb-12'>
                                <article>
                                    <div className="flex items-end justify-between px-6 lg:px-8 pt-6 lg:pt-8 mb-4 lg:mb-5">
                                        <div>
                                            <h3 className="text-2xl font-display font-bold text-slate-900 mb-1">Transmission Log</h3>
                                            <p className="text-sm text-slate-500 font-medium">All recent emails, follow-ups, and notifications.</p>
                                        </div>
                                        <button className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">See all</button>
                                    </div>

                                    {/* Column Headers */}
                                    <div className="hidden sm:grid grid-cols-[0.5fr_1.5fr_3fr_1fr_1fr_0.5fr] gap-0 px-6 lg:px-12 pb-2 border-b border-slate-100 bg-slate-50/50">
                                        <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">#</span>
                                        <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Lead</span>
                                        <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Subject Line</span>
                                        <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Status</span>
                                        <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase text-right">Timestamp</span>
                                        <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase text-right">Actions</span>
                                    </div>

                                    <div className="flex flex-col gap-1 px-4 lg:px-6 py-4">
                                        {paginatedLogs.map((log, idx) => {
                                            const originalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                                            return (
                                                <div key={log._id} className="flex flex-col gap-0 border border-slate-200/60 rounded-lg hover:bg-slate-50/80 transition-colors group">
                                                    <div className="grid grid-cols-1 sm:grid-cols-[0.5fr_1.5fr_3fr_1fr_1fr_0.5fr] gap-0 items-center px-4 py-4">
                                                        {/* Number */}
                                                        <div className="hidden sm:flex items-center">
                                                            <span className="text-sm font-bold text-slate-400">{originalIdx}</span>
                                                        </div>
                                                        
                                                        {/* Lead */}
                                                        <div className="flex items-center gap-3 min-w-0 pr-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                                <User2 className="w-5 h-5 text-slate-400" />
                                                            </div>
                                                            <div className="min-w-0 flex flex-col justify-center">
                                                                <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                                                    {log.hrEmailId?.company || log.hrEmailId?.hrName || 'Direct Dispatch'}
                                                                    {log.hrEmailId?.jobRole && (
                                                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                                            {log.hrEmailId.jobRole}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{log.recipient}</p>
                                                            </div>
                                                        </div>

                                                        {/* Subject */}
                                                        <div className="hidden sm:flex flex-col justify-center min-w-0 pr-4">
                                                            <p className="text-sm font-medium text-slate-600 truncate italic">&quot;{log.subject}&quot;</p>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{log.templateId?.name || 'Manual Dispatch'}</p>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="hidden sm:flex items-center gap-2">
                                                            <div className={cn(
                                                                "flex items-center gap-2",
                                                                log.status === 'sent' ? "text-emerald-600" : "text-rose-600"
                                                            )}>
                                                                <div className={cn("w-2 h-2 rounded-full shrink-0", log.status === 'sent' ? "bg-emerald-500" : "bg-rose-500")} />
                                                                <span className="text-sm font-semibold capitalize">{log.status === 'sent' ? 'Delivered' : 'Failed'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Timestamp */}
                                                        <div className="hidden sm:flex flex-col items-end pr-4">
                                                            <span className="text-sm font-bold text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="hidden sm:flex items-center justify-end">
                                                            <button
                                                                onClick={() => setSelectedLog(log)}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                                title="Inspect Payload"
                                                            >
                                                                <Eye className="w-4 h-4 cursor-pointer" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer Pagination */}
                                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl mt-auto">
                                        <p className="text-xs font-medium text-slate-500">
                                            {filteredLogs.length > 0 ? (
                                                <>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} Logs</>
                                            ) : (
                                                <>No Logs</>
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

                        {/* Detail Inspector Modal */}
                        {selectedLog && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-sans">
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedLog(null)} />
                                <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-5 duration-500 flex flex-col max-h-[90vh] overflow-hidden">
                                    <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white relative shrink-0">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
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
                                            className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
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
                                                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">{selectedLog.recipient}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Transmission Time
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">{formatDate(selectedLog.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        Organizational Context
                                                    </p>
                                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-1">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{selectedLog.hrEmailId?.company || 'N/A'}</p>
                                                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter italic">{selectedLog.hrEmailId?.jobRole || 'No role defined'}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        Template Asset
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">{selectedLog.templateId?.name || 'Custom Dispatch'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email Content */}
                                        <div className="space-y-4">
                                            <div className="p-4 md:p-8 rounded-xl bg-slate-50 border border-slate-200/60 shadow-inner relative overflow-hidden group">
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
                                            <div className="p-6 rounded-xl bg-rose-50 border border-rose-100 flex gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
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

                                    <div className="p-4 md:p-8 bg-white border-t border-slate-100 shrink-0">
                                        <button
                                            onClick={() => setSelectedLog(null)}
                                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-sm transition-all active:scale-95 hover:bg-slate-800 shadow-xl shadow-slate-900/10 cursor-pointer"
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
