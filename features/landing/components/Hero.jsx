"use client";

import React from 'react'
import Link from 'next/link'
import { FiArrowRight, FiSend, FiCheckCircle, FiTrendingUp, FiZap } from 'react-icons/fi'

const Hero = () => {
    return (
        <section className="relative w-full overflow-hidden bg-white min-h-[92vh] flex items-center justify-center pt-20 pb-16">
            {/* Layered Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-50"></div>
                <div className="absolute top-[-10%] right-[10%] w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '5s' }}></div>
                <div className="absolute bottom-[-15%] left-[5%] w-[600px] h-[600px] bg-secondary/6 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }}></div>
                <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-primary-dark/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-text-dark leading-[1.08] max-w-4xl">
                    Stop Sending Generic Outreach. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,var(--color-primary)_0%,#6366f1_40%,var(--color-primary-dark)_100%)]">
                        Automate Personalization at Scale.
                    </span>
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl text-text/70 max-w-3xl leading-relaxed font-medium">
                    Create personalized emails, send high-converting outreach, and track every reply — all from a single, unified workspace.
                </p>

                <div className="w-full mt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link href="/auth/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg h-14 px-8 text-base font-bold bg-primary text-white shadow-[0_8px_30px_rgb(79,70,229,0.35)] hover:bg-primary-dark hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(79,70,229,0.4)] transition-all duration-300 group">
                        Get Started for Free
                        <FiArrowRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg h-14 px-8 text-base font-bold bg-white text-text-dark border border-border hover:bg-surface hover:-translate-y-1 transition-all duration-300 shadow-sm group">
                        See How It Works
                        <FiArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Hero