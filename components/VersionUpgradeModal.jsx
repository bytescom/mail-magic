"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { FiZap, FiCheckCircle, FiArrowRight, FiBox, FiShield, FiTrendingUp } from "react-icons/fi";

// ── Version config ──────────────────────────────────────────────────────
// Bump this version string whenever you ship a major release.
// Users who have never seen this version will get the upgrade splash once.
const CURRENT_VERSION = "3.0.0";
const STORAGE_KEY = "desento_seen_version";

const HIGHLIGHTS = [
    {
        icon: <FiZap size={16} />,
        title: "Smarter Outreach Engine",
        desc: "Redesigned campaign builder with template variables and batch sending.",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.07)",
        border: "rgba(245,158,11,0.16)",
    },
    {
        icon: <FiTrendingUp size={16} />,
        title: "Real-Time Tracking",
        desc: "Live application status, follow-up counters, and reply detection.",
        color: "#10b981",
        bg: "rgba(16,185,129,0.07)",
        border: "rgba(16,185,129,0.16)",
    },
    {
        icon: <FiShield size={16} />,
        title: "Improved Security & Performance",
        desc: "Faster dashboard loads, smarter token refresh, and better error handling.",
        color: "#0ea5e9",
        bg: "rgba(14,165,233,0.07)",
        border: "rgba(14,165,233,0.16)",
    },
    {
        icon: <FiBox size={16} />,
        title: "New Settings & Workspace",
        desc: "Profile enrichment, danger zone controls, and usage analytics.",
        color: "#8b5cf6",
        bg: "rgba(139,92,246,0.07)",
        border: "rgba(139,92,246,0.16)",
    },
];

// Hydration-safe mount detection
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function VersionUpgradeModal() {
    const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
    const { status } = useSession();
    const [visible, setVisible] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);

    useEffect(() => {
        if (!mounted) return;
        // Only show after user is authenticated (after login, before dashboard renders)
        if (status !== "authenticated") return;

        try {
            const seenVersion = localStorage.getItem(STORAGE_KEY);
            if (seenVersion !== CURRENT_VERSION) {
                const timer = setTimeout(() => setVisible(true), 300);
                return () => clearTimeout(timer);
            }
        } catch {
            // localStorage blocked — fail silently
        }
    }, [mounted, status]);

    const dismiss = () => {
        setAnimatingOut(true);
        setTimeout(() => {
            setVisible(false);
            setAnimatingOut(false);
            try {
                localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
            } catch { /* noop */ }
        }, 350);
    };

    if (!mounted || !visible) return null;

    const modal = (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                animation: animatingOut
                    ? "upgradeFadeOut 0.35s ease-in forwards"
                    : "upgradeFadeIn 0.4s ease-out forwards",
            }}
        >
            {/* Backdrop */}
            <div
                onClick={dismiss}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                }}
            />

            {/* Modal Card — horizontal split layout */}
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    width: "100%",
                    maxWidth: "720px",
                    minHeight: "420px",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
                    animation: animatingOut
                        ? "upgradeCardOut 0.3s ease-in forwards"
                        : "upgradeCardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
                }}
            >
                {/* ── LEFT PANEL ── */}
                <div
                    style={{
                        width: "42%",
                        flexShrink: 0,
                        background: "linear-gradient(145deg, #312e81 0%, #4f46e5 45%, #7c3aed 100%)",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "36px 32px",
                        overflow: "hidden",
                    }}
                >
                    {/* Decorative orbs */}
                    <div style={{
                        position: "absolute", top: "-60px", right: "-60px",
                        width: "220px", height: "220px",
                        background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
                        borderRadius: "50%",
                        pointerEvents: "none",
                    }} />
                    <div style={{
                        position: "absolute", bottom: "-40px", left: "-40px",
                        width: "160px", height: "160px",
                        background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
                        borderRadius: "50%",
                        pointerEvents: "none",
                    }} />
                    <div style={{
                        position: "absolute", top: "40%", left: "30%",
                        width: "280px", height: "280px",
                        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
                        borderRadius: "50%",
                        pointerEvents: "none",
                    }} />

                    {/* Content */}
                    <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Version badge */}
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "999px",
                            marginBottom: "20px",
                            backdropFilter: "blur(8px)",
                        }}>
                            <FiZap size={11} color="white" />
                            <span style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "white",
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                            }}>
                                v{CURRENT_VERSION}
                            </span>
                        </div>

                        <h2 style={{
                            fontSize: "clamp(20px, 2.5vw, 26px)",
                            fontWeight: 800,
                            color: "white",
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                            margin: "0 0 14px",
                        }}>
                            Desento just got<br />
                            a major upgrade.
                        </h2>
                        <p style={{
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.68)",
                            lineHeight: 1.65,
                            margin: 0,
                            fontWeight: 500,
                        }}>
                            We&apos;ve rebuilt core systems for speed, reliability, and a better experience.
                        </p>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div
                    style={{
                        flex: 1,
                        background: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        padding: "28px 26px 24px",
                    }}
                >
                    {/* Section label */}
                    <p style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        margin: "0 0 14px",
                    }}>
                        What&apos;s new in this release
                    </p>

                    {/* Feature list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                        {HIGHLIGHTS.map((h, i) => (
                            <FeatureCard key={i} item={h} />
                        ))}
                    </div>

                    {/* CTA */}
                    <div style={{ marginTop: "18px" }}>
                        <button
                            id="version-modal-continue-btn"
                            onClick={dismiss}
                            onMouseEnter={e => {
                                e.currentTarget.style.opacity = "0.9";
                                e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.opacity = "1";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
                            onMouseUp={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                padding: "13px 20px",
                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                color: "white",
                                fontSize: "13.5px",
                                fontWeight: 700,
                                border: "none",
                                borderRadius: "12px",
                                cursor: "pointer",
                                boxShadow: "0 6px 20px rgba(79,70,229,0.35)",
                                transition: "opacity 0.15s ease, transform 0.15s ease",
                                letterSpacing: "0.01em",
                            }}
                        >
                            Continue to Desento
                            <FiArrowRight size={15} />
                        </button>
                        <p style={{
                            textAlign: "center",
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: 500,
                            marginTop: "10px",
                            marginBottom: 0,
                        }}>
                            You won&apos;t see this again.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

// Separate component so hover state is isolated per card
function FeatureCard({ item: h }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "11px",
                padding: "11px 13px",
                background: h.bg,
                border: `1px solid ${h.border}`,
                borderRadius: "11px",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                transform: hovered ? "translateY(-1px)" : "translateY(0)",
                boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                cursor: "default",
            }}
        >
            <div style={{ color: h.color, marginTop: "1px", flexShrink: 0 }}>
                {h.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "0 0 2px",
                    lineHeight: 1.3,
                }}>
                    {h.title}
                </p>
                <p style={{
                    fontSize: "11.5px",
                    color: "#64748b",
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.5,
                }}>
                    {h.desc}
                </p>
            </div>
            <FiCheckCircle size={13} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
        </div>
    );
}
