"use client"
import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Loading from "@/components/Loading";


// Lazy load each tab — only downloads JS when user clicks
const ProfileTab = dynamic(() => import('@/features/settings/components/ProfileTab'));
const IntegrationsTab = dynamic(() => import('@/features/settings/components/IntegrationsTab'));
const AutomationTab = dynamic(() => import('@/features/settings/components/AutomationTab'));
const PricingTab = dynamic(() => import('@/features/settings/components/PricingTab'));
const DangerZoneTab = dynamic(() => import('@/features/settings/components/DangerZoneTab'));

const tabs = ["Profile", "Integrations", "Automation", "Pricing", "Danger Zone"];

export default function Settings() {
    const [activeTab, setActiveTab] = useState("Profile");

    const renderTab = () => {
        switch (activeTab) {
            case "Profile": return <ProfileTab />;
            case "Integrations": return <IntegrationsTab />;
            case "Automation": return <AutomationTab />;
            case "Pricing": return <PricingTab />;
            case "Danger Zone": return <DangerZoneTab />;
            default: return null;
        }
    };

    return (
        <div className="max-w-full h-full min-h-full overflow-x-hidden w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 px-2 md:px-0">
                <div>
                    <h1 className={`text-[32px] font-extrabold text-text-dark leading-[1.1] mb-1.5 tracking-tight`}>
                        Settings
                    </h1>
                    <p className="text-[14px] text-text">Manage your account settings and preferences.</p>
                </div>
            </div>

            <section className='bg-background p-4 rounded-xl border border-border w-full max-w-full'>
                {/* Tab Bar */}
                <div className="w-full bg-surface flex overflow-x-auto mb-8 border-b border-border rounded-lg max-w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3.5 text-[13px] font-medium transition-all whitespace-nowrap sm:flex-1 text-center cursor-pointer ${activeTab === tab
                                    ? 'bg-background text-text-dark border-t-[3px] border-t-primary shadow-[0_-1px_0_0_theme(colors.gray.100)]'
                                    : 'text-muted hover:text-primary hover:bg-surface border-t-[3px] border-t-transparent'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="px-2 md:px-0 w-full max-w-full overflow-x-auto">
                    <Suspense fallback={<Loading />}>
                        {renderTab()}
                    </Suspense>
                </div>
            </section>
        </div>
    );
}
