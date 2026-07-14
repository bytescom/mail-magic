import React from 'react'
import Link from 'next/link'
import { FiChevronDown } from 'react-icons/fi'

const Navbar = () => {
    return (
        <nav className="h-[60px] max-w-[1280px] w-full mx-auto flex justify-between items-center px-6 sm:px-8 lg:px-12">
            
            {/* Left - Logo */}
            <div className="flex items-center shrink-0">
                <Link href="/" className="flex items-center" aria-label="Desento">
                    <h1 className="text-[17px] font-bold tracking-tight text-text-dark">
                        Desento
                    </h1>
                </Link>
            </div>

            {/* Center - Links */}
            <ul className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 gap-7">
                <li>
                    <Link href="#features" className="flex items-center gap-1.5 text-[13px] font-medium text-text hover:text-text-dark transition-colors">
                        Features <FiChevronDown className="opacity-50" size={12} />
                    </Link>
                </li>
                <li>
                    <Link href="#solutions" className="flex items-center gap-1.5 text-[13px] font-medium text-text hover:text-text-dark transition-colors">
                        Solutions <FiChevronDown className="opacity-50" size={12} />
                    </Link>
                </li>
                <li>
                    <Link href="#resources" className="flex items-center gap-1.5 text-[13px] font-medium text-text hover:text-text-dark transition-colors">
                        Resources <FiChevronDown className="opacity-50" size={12} />
                    </Link>
                </li>
                <li>
                    <Link href="#pricing" className="text-[13px] font-medium text-text hover:text-text-dark transition-colors">
                        Pricing
                    </Link>
                </li>
            </ul>

            {/* Right - Auth */}
            <div className="flex items-center gap-5 shrink-0">
                <Link href="/login" className="hidden sm:block text-[13px] font-medium text-text hover:text-text-dark transition-colors">
                    Log in
                </Link>
                <Link 
                    href="/signup" 
                    className="flex items-center justify-center px-3.5 py-1.5 rounded-full border border-border/80 bg-surface/50 text-[13px] font-medium text-text-dark hover:bg-border/30 transition-colors backdrop-blur-sm shadow-sm"
                >
                    Get started
                </Link>
            </div>
            
        </nav>
    )
}

export default Navbar