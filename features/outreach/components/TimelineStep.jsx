import React from 'react';
import { FiEdit2, FiCopy, FiTrash2, FiMoreVertical } from 'react-icons/fi';

const TimelineStep = ({ step, index, moveStep, onEdit, onDuplicate, onDelete }) => {
    
    // HTML5 Drag and Drop handlers
    const handleDragStart = (e) => {
        e.dataTransfer.setData('stepIndex', index);
        e.dataTransfer.effectAllowed = 'move';
        // Add a slight delay to allow the drag image to be generated before hiding
        setTimeout(() => e.target.classList.add('opacity-50'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('stepIndex'), 10);
        if (fromIndex !== index && !isNaN(fromIndex)) {
            moveStep(fromIndex, index);
        }
    };

    return (
        <div 
            className="flex gap-4 group"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Timeline Line & Number */}
            <div className="flex flex-col items-center mt-1">
                <div className="w-8 h-8 rounded-full border border-primary/30 bg-white flex items-center justify-center text-[12px] font-bold text-primary shadow-sm z-10 shrink-0">
                    {index + 1}
                </div>
                {/* Connecting line */}
                <div className="w-px h-full bg-border/60 my-1 min-h-[40px] group-last:hidden"></div>
            </div>

            {/* Step Card */}
            <div className="flex-1 bg-white border border-border/60 rounded-xl p-5 shadow-sm mb-6 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-surface border border-border/50 rounded-full text-[11px] font-bold text-muted whitespace-nowrap">
                            {step.waitTime} Wait
                        </span>
                        <p className="text-[13px] text-text-dark font-medium">
                            <span className="text-muted mr-1">Email Template:</span>
                            {step.templateName}
                        </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(step.id)} className="p-1.5 text-muted hover:text-primary hover:bg-primary/5 rounded transition-colors" title="Edit">
                            <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => onDuplicate(step.id)} className="p-1.5 text-muted hover:text-text-dark hover:bg-surface rounded transition-colors" title="Duplicate">
                            <FiCopy size={14} />
                        </button>
                        <button onClick={() => onDelete(step.id)} className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <FiTrash2 size={14} />
                        </button>
                        <div className="w-px h-4 bg-border mx-1"></div>
                        <button className="p-1 text-muted cursor-grab active:cursor-grabbing" title="Drag to reorder">
                            <FiMoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* Subject Preview Box */}
                <div className="bg-[#f9f9fa] border border-border/40 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Subject Preview</p>
                    <p className="text-[13px] text-text-dark font-medium truncate">
                        {step.subject}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimelineStep;
