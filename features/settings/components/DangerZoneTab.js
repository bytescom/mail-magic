"use client"
import React, { useState } from 'react'
import { FiAlertTriangle, FiX, FiLoader } from 'react-icons/fi';

const DangerZoneTab = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [result, setResult] = useState('');

    const CONFIRM_PHRASE = 'delete my data';

    const handleDelete = async () => {
        if (confirmText.toLowerCase() !== CONFIRM_PHRASE) return;
        setDeleting(true);
        setResult('');
        try {
            const res = await fetch('/api/user/workspace', { method: 'DELETE' });
            if (res.ok) {
                setResult('success');
                setShowConfirm(false);
            } else {
                setResult('error');
            }
        } catch (e) {
            setResult('error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full max-w-full">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 w-full">
                <div>
                    <h3 className="text-[16px] font-bold text-red-600 mb-1.5">Danger Zone</h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                        Irreversible actions. Proceed with extreme caution.
                    </p>
                </div>

                <div className="flex flex-col gap-4 bg-red-50/50 border border-red-100 rounded-2xl p-6 relative overflow-hidden group w-full">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-200/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="flex items-start gap-4 relative z-10 w-full">
                        <div className="w-10 h-10 shrink-0 bg-red-100 text-red-600 rounded-full flex items-center justify-center border border-red-200 shadow-sm">
                            <FiAlertTriangle size={18} className="animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[15px] font-bold text-red-700 mb-2">Erase Workspace Data</h4>
                            <p className="text-[14px] text-red-900/80 max-w-lg leading-relaxed mb-5">
                                This action will remove all your application logs, email records, and tracking data.
                                <strong className="font-semibold block mt-1 text-red-700">This is completely irreversible. Your Google account login will remain intact.</strong>
                            </p>

                            {result === 'success' && (
                                <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-700 font-bold">
                                    ✓ All workspace data has been deleted successfully.
                                </div>
                            )}
                            {result === 'error' && (
                                <div className="mb-4 px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-[13px] text-red-700 font-bold">
                                    Failed to delete data. Please try again.
                                </div>
                            )}

                            {!showConfirm ? (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="px-5 py-2.5 bg-background border border-red-200 rounded-xl text-[14px] font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer"
                                >
                                    <FiAlertTriangle size={14} /> Delete All Data
                                </button>
                            ) : (
                                <div className="flex flex-col gap-3 p-4 bg-red-100/60 border border-red-200 rounded-xl max-w-md">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[13px] font-bold text-red-700">Type <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">{CONFIRM_PHRASE}</span> to confirm:</p>
                                        <button onClick={() => { setShowConfirm(false); setConfirmText(''); }} className="text-muted hover:text-text-dark cursor-pointer p-1">
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={e => setConfirmText(e.target.value)}
                                        placeholder={CONFIRM_PHRASE}
                                        className="w-full px-3.5 py-2.5 bg-white border border-red-200 rounded-lg text-[14px] text-text-dark outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                    />
                                    <button
                                        onClick={handleDelete}
                                        disabled={confirmText.toLowerCase() !== CONFIRM_PHRASE || deleting}
                                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-[14px] font-bold disabled:opacity-50 hover:bg-red-700 transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        {deleting ? <FiLoader className="animate-spin" size={14} /> : <FiAlertTriangle size={14} />}
                                        {deleting ? 'Deleting...' : 'Confirm Delete'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DangerZoneTab;
