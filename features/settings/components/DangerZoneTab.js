import React from 'react'
import { FiAlertTriangle } from 'react-icons/fi';

const DangerZoneTab = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full max-w-full">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-8 w-full">
                <div>
                    <h3 className="text-[16px] font-bold text-text-dark mb-1.5 line-through decoration-red-400">Danger Zone</h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                        Irreversible actions for your workspace. Proceed with extreme caution.
                    </p>
                </div>
                
                <div className="flex flex-col items-start gap-5 bg-red-50/50 border border-red-100 rounded-2xl p-6 relative overflow-hidden group w-full">
                    {/* Decorative background blur */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-200/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    
                    <div className="flex items-start gap-4 relative z-10 w-full">
                        <div className="w-10 h-10 shrink-0 bg-red-100 text-red-600 rounded-full flex items-center justify-center border border-red-200 shadow-sm">
                            <FiAlertTriangle size={18} className="animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[15px] font-bold text-red-700 mb-2">Erase Workspace Data</h4>
                            <p className="text-[14px] text-red-900/80 max-w-lg leading-relaxed mb-5">
                                This action will disconnect your integrations and immediately remove all leads, emails, and tracking schemas. 
                                <strong className="font-semibold block mt-1 text-red-700">This action is completely irreversible. Any active email campaigns will be halted immediately.</strong>
                            </p>
                            <button className="px-5 py-2.5 bg-background border border-red-200 rounded-xl text-[14px] font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer">
                                Delete All Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DangerZoneTab
