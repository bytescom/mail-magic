import React from 'react'
import Link from 'next/link'

const Navbar = () => {
    return (
        <nav className="h-[60px] max-w-6xl m-auto flex justify-between items-center py-2 px-4 sm:px-6 lg:px-8">
            {/* Logo Section */}
            <div className="flex items-center">
                <Link href="/" className="flex items-center gap-3 group" aria-label="Desento">
                    <h1 className="text-2xl font-black tracking-tighter text-text-dark group-hover:text-primary transition-colors">
                        Desento<span className="text-secondary">.</span>
                    </h1>
                </Link>
            </div>

            {/* Links and Buttons Section */}
            <ul className="flex items-center gap-5 text-[15px] font-bold text-text-dark/70">
                <li className="hidden md:block"><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li className="hidden md:block"><Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li className="hidden md:block"><Link href="#faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                <li>
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-md shadow-primary/30 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 border border-primary/20"
                    >
                        Sign In
                    </Link>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar