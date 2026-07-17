import React, { useState } from 'react';
import { FiChevronDown, FiMail, FiStar, FiCalendar, FiRepeat, FiMoreHorizontal } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { openDrawer } from '../trackingSlice';

const statusStyles = {
    "Replied": { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-600" },
    "Sent": { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", text: "text-blue-600" },
    "Interview": { bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500", text: "text-violet-600" },
    "Rejected": { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", text: "text-red-600" },
    "Closed": { bg: "bg-surface", border: "border-border", dot: "bg-gray-400", text: "text-text" },
    "Draft": { bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400", text: "text-gray-600" },
};

const AccordionRow = ({ app, onClick }) => {
    const [open, setOpen] = useState(false);
    const ss = statusStyles[app.status] || statusStyles["Sent"];
    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${open ? 'border-primary/30 shadow-sm' : 'border-border'}`}>
            <button
                onClick={(e) => {
                    // Stop propagation so we don't open the accordion if clicking the main row designed to open the drawer
                    // Or we could let the accordion open and also open the drawer. Let's just open the drawer.
                    onClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-background hover:bg-surface transition-colors text-left cursor-pointer"
            >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 font-extrabold text-text text-[15px]">
                    {app.letter}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-text-dark truncate">{app.company}</p>
                    <p className="text-[12px] text-muted font-medium truncate">{app.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${ss.bg} border ${ss.border} rounded-full`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                        <span className={`text-[11px] font-extrabold ${ss.text}`}>{app.status}</span>
                    </div>
                </div>
            </button>
        </div>
    );
};

const TrackingTable = ({ applications, loading }) => {
    const dispatch = useDispatch();

    const handleRowClick = (appId) => {
        dispatch(openDrawer(appId));
    };

    if (loading && applications.length === 0) {
        return (
            <div className="p-8 text-center text-muted font-medium">Loading applications...</div>
        );
    }

    return (
        <>
            {/* MOBILE: Accordion cards */}
            <div className="lg:hidden flex flex-col gap-2 p-4">
                {applications.length === 0 ? (
                    <p className="text-center text-muted font-bold py-10 text-[14px]">No applications match this filter.</p>
                ) : (
                    applications.map((app) => (
                        <AccordionRow key={app.id} app={app} onClick={() => handleRowClick(app.id)} />
                    ))
                )}
            </div>

            {/* DESKTOP: Full table */}
            <div className="hidden lg:block overflow-x-auto max-w-full min-h-0">
                <table className="w-full text-left border-separate border-spacing-y-1.5 px-3 min-w-[900px]">
                    <thead>
                        <tr className="bg-background">
                            <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[26%] border-b border-border">Company & Role</th>
                            <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[22%] border-b border-border">HR Contact</th>
                            <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[12%] border-b border-border">Status</th>
                            <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[14%] border-b border-border">Reply</th>
                            <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[13%] border-b border-border">Sent</th>
                            <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase w-[13%] border-b border-border">Follow-Up</th>
                            <th className="px-4 pb-2 pt-3 text-[11px] font-extrabold text-muted tracking-[0.1em] uppercase text-right border-b border-border"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-10 text-center">
                                    <p className="text-muted font-bold text-[14px]">No applications match this filter.</p>
                                </td>
                            </tr>
                        ) : (
                            applications.map((app) => {
                                const ss = statusStyles[app.status] || statusStyles["Sent"];
                                return (
                                    <tr 
                                        key={app.id} 
                                        onClick={() => handleRowClick(app.id)}
                                        className="group hover:bg-surface transition-colors border border-border rounded-xl bg-background cursor-pointer"
                                    >
                                        <td className="px-4 py-3.5 rounded-l-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0 border border-border font-extrabold text-text text-[14px]">
                                                    {app.letter}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-text-dark">{app.company}</p>
                                                    <p className="text-[11px] font-medium text-muted">{app.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-[12px] font-bold text-text">{app.hrName}</p>
                                            <p className="text-[11px] font-medium text-muted truncate max-w-[180px]">{app.hrEmail}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${ss.bg} border ${ss.border} rounded-full`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                                <span className={`text-[11px] font-extrabold tracking-wide ${ss.text}`}>{app.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {app.reply === '—' ? (
                                                <span className="text-muted font-medium">—</span>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-full">
                                                    <FiStar className="text-muted" size={11} />
                                                    <span className="text-[11px] font-bold text-text truncate max-w-[120px]">{app.reply}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-[12px] font-medium text-text">{app.sentDate}</p>
                                            <p className="text-[11px] font-medium text-muted">{app.sentRelative}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {app.followUpDate === '—' ? (
                                                <span className="text-muted font-medium">—</span>
                                            ) : (
                                                <div>
                                                    <p className="text-[12px] font-medium text-text">{app.followUpDate}</p>
                                                    <p className="text-[11px] font-extrabold text-purple-500">{app.followUpCount}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right rounded-r-xl">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 rounded-lg text-muted hover:text-text-dark hover:bg-surface transition-colors cursor-pointer" onClick={e => e.stopPropagation()}>
                                                    <FiMoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default TrackingTable;
