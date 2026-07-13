"use client"
import React from 'react'
import { FiX, FiCheck, FiSend } from 'react-icons/fi';
import { Playfair_Display } from "next/font/google";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const LaunchConfirmationModal = ({ onClose, onConfirm, campaignName, audienceCount }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                onClick={onClose} 
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiSend size={28} className="translate-x-0.5" />
                    </div>
                    
                    <h2 className={`text-[22px] font-bold text-text-dark mb-2 ${serif.className}`}>Launch Campaign?</h2>
                    <p className="text-[14px] text-muted font-medium mb-6">
                        You are about to launch <span className="font-bold text-text-dark">"{campaignName}"</span> to <span className="font-bold text-text-dark">{audienceCount} contacts</span>. Once launched, the first batch of emails will begin sending.
                    </p>
                    
                    <div className="bg-[#f9f9f9] border border-border/60 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-center gap-3 mb-2">
                            <FiCheck size={16} className="text-green-500" />
                            <span className="text-[13px] font-bold text-text-dark">All validations passed</span>
                        </div>
                        <p className="text-[12px] text-muted font-medium ml-7">
                            Gmail connected, audience selected, and email template is ready.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border border-border text-text-dark text-[14px] font-bold rounded-xl hover:bg-surface transition-colors cursor-pointer shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 py-3 bg-primary text-white text-[14px] font-bold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            <FiSend size={15} /> Confirm Launch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaunchConfirmationModal;
