"use client";

import React, { useRef, useState, useEffect } from 'react';
import { FiCheckCircle, FiSend, FiMail, FiBarChart2 } from 'react-icons/fi';

export default function InteractiveHeroUI() {
    const containerRef = useRef(null);
    const [tiltStyle, setTiltStyle] = useState({});

    // Handle mouse movement for the 3D tilt effect
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate mouse position relative to the center of the container (-1 to 1)
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Calculate rotation degrees (max 10 degrees)
        const rotateX = y * 10;
        const rotateY = x * 10;
        
        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.1s ease-out'
        });
    };

    const handleMouseLeave = () => {
        // Reset to default slightly rotated position on leave
        setTiltStyle({
            transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(-2deg)`,
            transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
        });
    };
    
    // Set initial slightly tilted state
    useEffect(() => {
        handleMouseLeave();
    }, []);

    return (
        <div 
            className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] max-w-[500px] mx-auto lg:ml-auto flex items-center justify-center group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: "1000px" }}
        >
            {/* Background Premium Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-full blur-[80px] -z-10 group-hover:bg-primary/20 transition-colors duration-700 pointer-events-none"></div>

            {/* Main Interactive Dashboard Card */}
            <div 
                ref={containerRef}
                className="w-full aspect-square bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden will-change-transform"
                style={tiltStyle}
            >
                {/* Window Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Active Campaign</span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-8 flex flex-col gap-6 bg-gradient-to-b from-white to-gray-50/50">
                    
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                                <FiMail size={18} />
                            </div>
                            <div className="text-sm font-medium text-gray-500">Emails Sent</div>
                            <div className="text-2xl font-bold text-gray-900 tracking-tight">12,492</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-1">
                                <FiCheckCircle size={18} />
                            </div>
                            <div className="text-sm font-medium text-gray-500">Open Rate</div>
                            <div className="text-2xl font-bold text-gray-900 tracking-tight">68.4%</div>
                        </div>
                    </div>

                    {/* Animated Chart Simulation */}
                    <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 mt-2">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-800">Activity Overview</div>
                            <FiBarChart2 className="text-gray-400" />
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-3 pb-2 pt-4">
                            {/* Animated Bars */}
                            {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                                <div key={i} className="w-full bg-gray-50 rounded-t-md relative overflow-hidden group/bar" style={{ height: '100%' }}>
                                    <div 
                                        className="absolute bottom-0 left-0 right-0 bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-1000 ease-out"
                                        style={{ height: `${height}%`, transitionDelay: `${i * 50}ms` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* Floating Element 1 - Deliverability */}
            <div className="absolute bottom-10 -left-6 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 flex items-center gap-4 animate-[bounce_4s_infinite] z-20 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                    <FiCheckCircle size={22} />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900 mb-0.5">99.8% Delivered</div>
                    <div className="text-xs text-gray-500 font-medium">Bypassing spam folders</div>
                </div>
            </div>

            {/* Floating Element 2 - Campaign Action */}
            <div className="absolute top-16 -right-6 bg-white border border-gray-100 shadow-xl rounded-2xl p-3 flex items-center gap-3 animate-[bounce_5s_infinite_0.5s] z-20 hover:scale-105 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-inner">
                    <FiSend size={16} />
                </div>
                <div className="pr-3">
                    <div className="text-sm font-bold text-gray-900 mb-0.5">Campaign live</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Sending now...</div>
                </div>
            </div>

        </div>
    );
}
