"use client"
import React, { useState } from 'react'
import { Playfair_Display } from "next/font/google";
import ProfileTab from '@/features/settings/components/ProfileTab';
import IntegrationsTab from '@/features/settings/components/IntegrationsTab';
import AutomationTab from '@/features/settings/components/AutomationTab';
import UsageTab from '@/features/settings/components/UsageTab';
import DangerZoneTab from '@/features/settings/components/DangerZoneTab';

const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const tabs = ["Profile", "Integrations", "Automation", "Usage Quotas", "Danger Zone"];

export default function Settings() {
    const [activeTab, setActiveTab] = useState("Profile");

    const tabContent = {
        "Profile": <ProfileTab />,
        "Integrations": <IntegrationsTab />,
        "Automation": <AutomationTab />,
        "Usage Quotas": <UsageTab />,
        "Danger Zone": <DangerZoneTab />,
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
                    {tabContent[activeTab]}
                </div>
            </section>
        </div>
    );
}
