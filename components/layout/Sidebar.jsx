"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuPanelLeftClose, LuPanelRightClose } from "react-icons/lu";
import { FiGrid, FiBriefcase, FiFileText, FiUser, FiClock, FiSettings, FiCheckCircle, FiLogOut, FiChevronUp } from "react-icons/fi";
import { Playfair_Display } from "next/font/google";

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <FiGrid size={20} strokeWidth={1.5} /> },
  { name: 'Leads', path: '/dashboard/leads', icon: <FiBriefcase size={20} strokeWidth={1.5} /> },
  { name: 'Outreach', path: '/dashboard/outreach', icon: <FiFileText size={20} strokeWidth={1.5} /> },
  { name: 'Follow Ups', path: '/dashboard/follow-up', icon: <FiUser size={20} strokeWidth={1.5} /> },
  { name: 'Tracking', path: '/dashboard/tracking', icon: <FiClock size={20} strokeWidth={1.5} /> },
  { name: 'Settings', path: '/dashboard/settings', icon: <FiSettings size={20} strokeWidth={1.5} /> },
];

const avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop";
const displayEmail = "alex.morgan@example.com";
const userName = "Alex";

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const footerRef = useRef(null);
    const menuRef = useRef(null);

    const toggleSidebar = () => setIsOpen(prev => !prev);

    const [popupStyle, setPopupStyle] = useState({});

    useEffect(() => {
        const updatePosition = () => {
            if (profileOpen && footerRef.current) {
                const rect = footerRef.current.getBoundingClientRect();
                setPopupStyle({
                    bottom: window.innerHeight - rect.top + 8,
                    left: rect.left,
                    width: isOpen ? rect.width : 256,
                });
            }
        };
        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [profileOpen, isOpen]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                profileOpen &&
                footerRef.current && !footerRef.current.contains(e.target) &&
                menuRef.current && !menuRef.current.contains(e.target)
            ) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileOpen]);

    return (
        <aside className={`sticky top-2 h-[calc(100vh-16px)] shrink-0 bg-background/70 backdrop-blur-xl border border-border/50 shadow-sm rounded-xl flex flex-col justify-between transition-all duration-300 ${isOpen ? "w-72" : "w-16"} overflow-hidden`} >
            <nav>
                <div className={`p-5 rounded-t-lg border-b border-text/20 flex items-center ${isOpen ? "justify-between" : "justify-center"
                    }`}>

                    {isOpen &&
                        <Link href="/" className="flex items-center gap-3 group" aria-label="Desento">
                            <h1 className="text-xl font-black tracking-tighter text-primary transition-colors">
                                Desento<span className="text-secondary">.</span>
                            </h1>
                        </Link>
                    }

                    <button onClick={toggleSidebar} className='cursor-pointer text-text hover:text-primary transition-colors'>
                        {isOpen ? (
                            <LuPanelLeftClose size={22} />
                        ) : (
                            <LuPanelRightClose size={22} />
                        )}
                    </button>
                </div>

                <div className={`flex flex-col gap-5 ${isOpen ? 'p-5' : 'py-5 px-2'}`}>
                    {isOpen && (
                        <div className='flex gap-2'>
                            <h2 className={`text-xl leading-[1.2] text-text ${serif.className}`}>Welcome back,</h2>
                            <h2 className={`text-xl leading-[1.2] font-semibold text-primary ${serif.className}`}>{userName} :)</h2>
                        </div>
                    )}

                    <div className={isOpen ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2 items-center'}>
                        {navItems.filter(Boolean).map((item) => {
                            if (!item?.path) {
                                console.warn("navItem missing path:", item);
                                return null;
                            }
                            const isActive = item.path === '/dashboard'
                                ? pathname === '/dashboard'
                                : pathname?.startsWith(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={`cursor-pointer transition-all border flex items-center justify-center rounded-xl shadow-sm ${isOpen
                                        ? 'min-h-[60px] w-full flex-col gap-1.5 px-2 py-3'
                                        : 'w-10 h-10'
                                        } ${isActive
                                            ? 'bg-primary border-primary text-white shadow-primary/20 hover:opacity-90'
                                            : 'bg-surface border-border text-text hover:bg-surface'
                                        } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                >
                                    {React.cloneElement(item.icon, { className: isActive ? 'text-white' : 'text-primary' })}
                                    {isOpen && (
                                        <span className={`text-[14px] leading-tight text-center w-full truncate ${serif.className} ${isActive ? 'text-white' : 'text-text'}`}>
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <div className="border-t border-text/20">
                {/* Popup menu */}
                {profileOpen && (
                    <>
                        <div
                            className="fixed inset-0"
                            style={{ zIndex: 9998 }}
                            onClick={() => setProfileOpen(false)}
                        />
                        <div
                            ref={menuRef}
                            className="fixed bg-background border border-border rounded-2xl shadow-xl overflow-hidden"
                            style={{ ...popupStyle, zIndex: 9999 }}
                        >
                            <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-surface">
                                <div className="w-11 h-11 rounded-xl bg-orange-100 overflow-hidden border border-orange-200 shrink-0">
                                    <Image src={avatarUrl} alt="Profile" width={44} height={44} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 pr-2">
                                    <p className="text-[14px] font-bold text-text-dark flex items-center gap-1 truncate">
                                        {userName} <FiCheckCircle className="text-primary shrink-0" size={12} />
                                    </p>
                                    <p className="text-[12px] text-text font-medium truncate">{displayEmail || "\u00A0"}</p>
                                </div>
                            </div>
                            <div className="py-1.5">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setProfileOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-text hover:bg-surface hover:text-primary transition-colors"
                                >
                                    <FiUser size={15} className="text-muted" /> Profile
                                </Link>
                                <div className="mx-4 my-1 border-t border-border" />
                                <button
                                    onClick={() => {
                                        setProfileOpen(false);
                                        alert('Logout clicked');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    <FiLogOut size={15} className="text-red-400" /> Logout
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Footer button */}
                <button
                    ref={footerRef}
                    onClick={() => setProfileOpen(prev => !prev)}
                    className={`w-full flex items-center rounded-b-xl border-t border-text/20 cursor-pointer transition-all group active:scale-[0.98] ${isOpen ? 'justify-between p-5' : 'justify-center py-5 px-2'
                        } ${profileOpen ? 'bg-surface' : 'hover:bg-surface'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-200 overflow-hidden border border-orange-100 shrink-0">
                            <Image src={avatarUrl} alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
                        </div>
                        {isOpen && (
                            <div className="flex flex-col items-start leading-tight min-w-0">
                                <span className="text-[14px] font-semibold text-text-dark flex items-center gap-1 group-hover:text-primary transition-colors truncate max-w-full">
                                    <span className="truncate">{userName}</span>
                                    <FiCheckCircle className="text-primary w-3 h-3 shrink-0" />
                                </span>
                                <span className="text-xs text-text font-medium truncate max-w-full">{displayEmail}</span>
                            </div>
                        )}
                    </div>
                    {isOpen && (
                        <div className={`rounded-full p-2 transition-colors ${profileOpen ? 'bg-primary/10' : 'bg-surface group-hover:bg-gray-200'}`}>
                            <FiChevronUp className={`h-4 w-4 text-text transition-transform duration-200 ${profileOpen ? 'rotate-0' : 'rotate-180'}`} />
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}