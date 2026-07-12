"use client"
import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Playfair_Display } from "next/font/google";
import Loading from "@/components/Loading";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Lazy load each tab — only downloads JS when user clicks
const ProfileTab = dynamic(() => import('@/features/settings/components/ProfileTab'), { ssr: false });
const IntegrationsTab = dynamic(() => import('@/features/settings/components/IntegrationsTab'), { ssr: false });
const AutomationTab = dynamic(() => import('@/features/settings/components/AutomationTab'), { ssr: false });
const UsageTab = dynamic(() => import('@/features/settings/components/UsageTab'), { ssr: false });
const DangerZoneTab = dynamic(() => import('@/features/settings/components/DangerZoneTab'), { ssr: false });

const tabs = ["Profile", "Integrations", "Automation", "Usage Quotas", "Danger Zone"];

export default function Settings() {
    const [activeTab, setActiveTab] = useState("Profile");

    const renderTab = () => {
        switch (activeTab) {
            case "Profile": return <ProfileTab />;
            case "Integrations": return <IntegrationsTab />;
            case "Automation": return <AutomationTab />;
            case "Usage Quotas": return <UsageTab />;
            case "Danger Zone": return <DangerZoneTab />;
            default: return null;
        }
    };

    return (
        <div className="max-w-full h-full min-h-screen overflow-x-hidden w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 px-2 md:px-0">
                <div>
                    <h1 className={`text-[32px] font-extrabold text-text-dark leading-[1.1] mb-1.5 tracking-tight ${serif.className}`}>
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
