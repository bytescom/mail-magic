import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/Loading";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/features/landing/components/Hero";

// Below-the-fold: lazy loaded for optimal LCP
const Features = dynamic(() => import("@/features/landing/components/Features"), { ssr: true });
const HowItWork = dynamic(() => import("@/features/landing/components/HowItWork"), { ssr: true });
const Faqs = dynamic(() => import("@/features/landing/components/Faqs"), { ssr: true });
const Cta = dynamic(() => import("@/features/landing/components/Cta"), { ssr: true });
const Footer = dynamic(() => import("@/components/layout/Footer"), { ssr: true });

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-primary
         font-sans selection:bg-primary/20 selection:text-primary-dark animate-page-transition">

            {/* Navbar — always loaded instantly */}
            <header className="fixed top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-xl transition-all shadow-sm">
                <Navbar />
            </header>

            <main className="flex-1 flex flex-col w-full pt-16">
                {/* Hero — always loaded instantly for optimal LCP */}
                <Hero />

                {/* Below-the-fold — lazy loaded */}
                <Suspense fallback={<Loading />}>
                    <Features />
                    <HowItWork />
                    <section id="faq" className="w-full bg-[#fcfcfd] py-24 sm:py-32 border-t border-gray-100">
                        <Faqs />
                    </section>
                    <Cta />
                </Suspense>
            </main>

            <Suspense fallback={<Loading />}>
                <Footer />
            </Suspense>
        </div>
    );
}
