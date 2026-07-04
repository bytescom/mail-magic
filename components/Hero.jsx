import React from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

const Hero = () => {
    return (
        <section className="relative w-full overflow-hidden bg-white min-h-[90vh] flex items-center justify-center">
            {/* Background Gradient & Grid */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)] opacity-60"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-8 py-20">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-text-dark drop-shadow-sm leading-[1.1] max-w-4xl">
                    Stop Sending Generic Outreach. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark drop-shadow-sm">
                        Automate Personalization at Scale.
                    </span>
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl text-text/80 max-w-3xl leading-relaxed font-medium">
                    Create personalized emails, send high-converting outreach, and track every reply — all from a single, unified workspace.
                </p>

                <div className="w-full max-w-lg mt-2 flex justify-center">
                    <Link href="/sign-in" className="flex items-center justify-center gap-2 rounded-full h-14 px-8 text-base font-bold bg-primary text-white shadow-[0_8px_25px_rgb(79,70,229,0.3)] hover:bg-primary-dark hover:-translate-y-1 transition-all duration-300">
                        Get Started
                        <FiArrowRight size={20} strokeWidth={3} />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Hero