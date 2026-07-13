import React from 'react';
import { FiSend, FiCheckCircle, FiXCircle, FiBarChart2, FiRepeat, FiMessageCircle } from 'react-icons/fi';

const TrackingStats = ({ metrics }) => {
    return (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-6">
            {[
                { label: "Total", value: metrics.total, icon: <FiBarChart2 size={17} />, color: "text-text", iconColor: "text-muted", bg: "bg-surface" },
                { label: "Sent", value: metrics.sent, icon: <FiSend size={17} />, color: "text-blue-500", iconColor: "text-blue-500", bg: "bg-indigo-50" },
                { label: "Follow-ups", value: metrics.followUps, icon: <FiRepeat size={17} />, color: "text-purple-500", iconColor: "text-purple-500", bg: "bg-purple-50" },
                { label: "Replied", value: metrics.replied, icon: <FiMessageCircle size={17} />, color: "text-emerald-500", iconColor: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Interviews", value: metrics.interviews, icon: <FiCheckCircle size={17} />, color: "text-emerald-500", iconColor: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Rejected", value: metrics.rejected, icon: <FiXCircle size={17} />, color: "text-red-500", iconColor: "text-red-500", bg: "bg-red-50" },
            ].map((m, i) => (
                <div key={i} className={`${m.bg} border border-border rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm`}>
                    <span className={m.iconColor}>{m.icon}</span>
                    <div>
                        <span className={`text-[24px] font-extrabold leading-none ${m.color}`}>{m.value}</span>
                        <p className="text-[10px] font-bold text-muted tracking-widest uppercase mt-1">{m.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrackingStats;
