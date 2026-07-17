import React from 'react'
import Link from 'next/link'

const Navbar = () => {
    return (
        <nav className="h-[60px] max-w-[1280px] w-full mx-auto flex justify-between items-center px-6 sm:px-8 lg:px-12">

            {/* Left - Logo */}
            <div className="flex items-center shrink-0">
                <Link href="/" className="flex items-center gap-2" aria-label="Desento">
                    <img src="/icon.svg" alt="Desento Logo" className="w-6 h-6" />
                    <h1 className="text-lg font-bold tracking-tight text-primary">
                        Desento<span className="text-secondary">.</span>
                    </h1>
                </Link>
            </div>

            {/* Center - Links */}
            <ul className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 gap-7">
                <li>
                    <Link href="#features" className="flex items-center gap-1.5 text-base font-medium text-text hover:text-text-dark transition-colors">
                        Features
                    </Link>
                </li>
                <li>
                    <Link href="#solutions" className="flex items-center gap-1.5 text-base font-medium text-text hover:text-text-dark transition-colors">
                        Solutions
                    </Link>
                </li>
                <li>
                    <Link href="#resources" className="flex items-center gap-1.5 text-base font-medium text-text hover:text-text-dark transition-colors">
                        Resources
                    </Link>
                </li>
                <li>
                    <Link href="#pricing" className="text-base font-medium text-text hover:text-text-dark transition-colors">
                        Pricing
                    </Link>
                </li>
            </ul>

            {/* Right - Auth */}
            <div className="flex items-center gap-5 shrink-0">
                <Link href="/login" className="hidden sm:block text-base font-medium text-text hover:text-text-dark transition-colors">
                    Log in
                </Link>
                <Link
                    href="/signup"
                    className="flex items-center justify-center px-4 py-2 rounded-full border border-border/80 bg-surface/50 text-base font-medium text-text-dark hover:bg-border/30 transition-colors backdrop-blur-sm shadow-sm"
                >
                    Get started
                </Link>
            </div>

        </nav>
    )
}

export default Navbar