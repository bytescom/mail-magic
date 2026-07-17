"use client"
import React from 'react'
import { FiZap, FiLock, FiStar, FiCheck, FiArrowRight } from 'react-icons/fi'

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started with job outreach.",
        badge: null,
        color: "border-border",
        features: [
            "50 AI email generations / month",
            "Up to 3 active campaigns",
            "Basic follow-up automation",
            "1 Gmail account",
            "Community support",
        ],
        cta: "Current Plan",
        ctaStyle: "bg-surface border border-border text-muted cursor-default",
        disabled: true,
    },
    {
        name: "Pro",
        price: "$12",
        period: "per month",
        description: "For serious job seekers running high-volume outreach.",
        badge: "Coming Soon",
        color: "border-primary/40",
        features: [
            "1,000 AI email generations / month",
            "Unlimited campaigns",
            "Advanced follow-up sequences",
            "3 Gmail accounts",
            "Reply sentiment analysis",
            "Priority support",
        ],
        cta: "Notify Me",
        ctaStyle: "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20",
        disabled: false,
    },
    {
        name: "Team",
        price: "$29",
        period: "per month",
        description: "For teams and agencies managing outreach at scale.",
        badge: "Coming Soon",
        color: "border-violet-300/50",
        features: [
            "5,000 AI email generations / month",
            "Unlimited campaigns & users",
            "Team collaboration workspace",
            "10 Gmail accounts",
            "Analytics dashboard",
            "Dedicated support",
        ],
        cta: "Notify Me",
        ctaStyle: "bg-violet-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20",
        disabled: false,
    },
];

export default function PricingTab() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-full">

            {/* Coming soon banner */}
            <div className="flex items-center gap-3 px-5 py-4 bg-primary/5 border border-primary/20 rounded-xl mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FiLock size={15} className="text-primary" />
                </div>
                <div>
                    <p className="text-[13px] font-bold text-primary">Billing & Plans — Coming Soon</p>
                    <p className="text-[12px] text-muted font-medium mt-0.5">We're building a beautiful subscription experience. Get notified when it launches.</p>
                </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative flex flex-col bg-background border-2 ${plan.color} rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md`}
                    >
                        {/* Badge */}
                        {plan.badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-[10px] font-extrabold rounded-full shadow-sm tracking-wider uppercase">
                                    <FiStar size={9} /> {plan.badge}
                                </span>
                            </div>
                        )}

                        {/* Plan name & price */}
                        <div className="mb-5">
                            <h3 className="text-[15px] font-extrabold text-text-dark mb-1">{plan.name}</h3>
                            <div className="flex items-end gap-1.5 mb-2">
                                <span className="text-[32px] font-black text-text-dark leading-none">{plan.price}</span>
                                <span className="text-[12px] font-medium text-muted mb-1">{plan.period}</span>
                            </div>
                            <p className="text-[12px] text-muted leading-relaxed">{plan.description}</p>
                        </div>

                        {/* Features */}
                        <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <FiCheck size={10} className="text-primary" />
                                    </div>
                                    <span className="text-[13px] text-text font-medium leading-tight">{f}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <button
                            disabled={plan.disabled}
                            className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${plan.ctaStyle}`}
                        >
                            {plan.cta}
                            {!plan.disabled && <FiArrowRight size={13} />}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-muted font-medium">
                <FiZap size={12} className="text-primary" />
                All plans include end-to-end encryption and data privacy. No hidden fees.
            </div>
        </div>
    );
}
