"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FiZap, FiCheckCircle, FiArrowRight, FiBox, FiShield, FiTrendingUp } from "react-icons/fi";

// ── Version config ──────────────────────────────────────────────────────
// Bump this version string whenever you ship a major release.
// Users who have never seen this version will get the upgrade splash once.
const CURRENT_VERSION = "3.0.0";
const STORAGE_KEY = "desento_seen_version";

const HIGHLIGHTS = [
    {
        icon: <FiZap size={18} />,
        title: "Smarter Outreach Engine",
        desc: "Redesigned campaign builder with template variables and batch sending.",
        color: "text-amber-500",
        bg: "bg-amber-50 border-amber-100",
    },
    {
        icon: <FiTrendingUp size={18} />,
        title: "Real-Time Tracking",
        desc: "Live application status, follow-up counters, and reply detection.",
        color: "text-emerald-500",
        bg: "bg-emerald-50 border-emerald-100",
    },
    {
        icon: <FiShield size={18} />,
        title: "Improved Security & Performance",
        desc: "Faster dashboard loads, smarter token refresh, and better error handling.",
        color: "text-sky-500",
        bg: "bg-sky-50 border-sky-100",
    },
    {
        icon: <FiBox size={18} />,
        title: "New Settings & Workspace",
        desc: "Profile enrichment, danger zone controls, and usage analytics.",
        color: "text-violet-500",
        bg: "bg-violet-50 border-violet-100",
    },
];

// Hydration-safe mount detection
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function VersionUpgradeModal() {
    const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
    const [visible, setVisible] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);

    useEffect(() => {
        if (!mounted) return;

        try {
            const seenVersion = localStorage.getItem(STORAGE_KEY);

            // Show only if user has a PREVIOUS version stored (returning user)
            // but hasn't seen the current version yet.
            // Brand-new users (no key at all) get the current version silently.
            if (seenVersion === null) {
                // First-ever visit — silently stamp version, no modal
                localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
                return;
            }

            if (seenVersion !== CURRENT_VERSION) {
                // Returning user who hasn't seen this version → show modal
                // Deferred to avoid React 19 cascading-render error
                const timer = setTimeout(() => setVisible(true), 0);
                return () => clearTimeout(timer);
            }
        } catch {
            // localStorage blocked — fail silently
        }
    }, [mounted]);

    const dismiss = () => {
        setAnimatingOut(true);
        setTimeout(() => {
            setVisible(false);
            setAnimatingOut(false);
            try {
                localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
            } catch { /* noop */ }
        }, 400);
    };

    if (!mounted || !visible) return null;

    const modal = (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 ${animatingOut ? "animate-[upgradeFadeOut_0.4s_ease-in_forwards]" : "animate-[upgradeFadeIn_0.5s_ease-out_forwards]"}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={dismiss}
            />

            {/* Modal Card */}
            <div
                className={`relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden ${animatingOut ? "animate-[upgradeCardOut_0.35s_ease-in_forwards]" : "animate-[upgradeCardIn_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]"}`}
            >
                {/* Header gradient */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-violet-700 px-8 pt-10 pb-8">
                    {/* Decorative blobs */}
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                    {/* Version badge */}
                    <div className="relative flex items-center gap-2 mb-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-bold text-white tracking-wider uppercase">
                            <FiZap size={12} />
                            v{CURRENT_VERSION}
                        </span>
                    </div>

                    <h2 className="relative text-[28px] sm:text-[32px] font-extrabold text-white leading-[1.15] tracking-tight mb-2">
                        Desento just got<br />
                        a major upgrade.
                    </h2>
                    <p className="relative text-[14px] text-white/75 font-medium leading-relaxed max-w-sm">
                        We&apos;ve rebuilt core systems for speed, reliability, and a better experience. Here&apos;s what&apos;s new.
                    </p>
                </div>

                {/* Highlights */}
                <div className="px-8 py-6 space-y-3">
                    {HIGHLIGHTS.map((h, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-colors hover:shadow-sm ${h.bg}`}
                            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                        >
                            <div className={`mt-0.5 shrink-0 ${h.color}`}>{h.icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-gray-900 leading-snug">{h.title}</p>
                                <p className="text-[12px] text-gray-500 font-medium mt-0.5 leading-relaxed">{h.desc}</p>
                            </div>
                            <FiCheckCircle size={14} className="shrink-0 text-emerald-400 mt-1" />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 pt-2">
                    <button
                        onClick={dismiss}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-dark text-white text-[14px] font-bold rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    >
                        Continue to Desento
                        <FiArrowRight size={16} />
                    </button>
                    <p className="text-center text-[11px] text-gray-400 font-medium mt-3">
                        You won&apos;t see this again.
                    </p>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
