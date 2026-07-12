import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/features/landing/components/Hero";
import Features from "@/features/landing/components/Features";
import HowItWork from "@/features/landing/components/HowItWork";
import Faqs from "@/features/landing/components/Faqs";
import Footer from "@/components/layout/Footer";
import Cta from "@/features/landing/components/Cta";

export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-screen bg-primary
     font-sans selection:bg-primary/20 selection:text-primary-dark animate-page-transition">

      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-xl transition-all shadow-sm">
        <Navbar />
      </header>

      <main className="flex-1 flex flex-col w-full pt-16">
        {/* Hero Section */}
        <Hero />

        {/* Features */}
        <Features />

        {/* How It Works */}
        <HowItWork />

        {/* --- FAQS --- */}
        <section id="faq" className="w-full bg-[#fcfcfd] py-24 sm:py-32 border-t border-gray-100">
          <Faqs />
        </section>

        {/* --- CTA --- */}
        <Cta />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
