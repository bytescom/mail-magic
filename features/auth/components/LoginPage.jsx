"use client"
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { Playfair_Display } from 'next/font/google';
import { signIn } from 'next-auth/react';

const serif = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export default function LoginPage() {
    return (
        <section className="relative min-h-screen flex overflow-hidden animate-page-transition p-2 bg-slate-50">
            {/* left side */}
            <div className="hidden lg:flex w-[55%] shrink-0 h-[calc(100vh-16px)] sticky top-0 rounded-2xl overflow-hidden">
                <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between p-10">
                    {/* Bg image cover */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                        style={{ backgroundImage: 'url("/auth_side_cover.png")' }}
                    />

                    {/* Dark gradient */}
                    <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    <div className="relative z-10 flex items-center gap-4 mt-4">
                        <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em] whitespace-nowrap">A Wise Quote</span>
                    </div>


                    {/* Bottom content */}
                    <div className="relative z-10 space-y-4 max-w-sm mb-4">
                        <h2 className={`text-5xl font-semibold tracking-tight text-white leading-[1.1] ${serif.className}`}>
                            Get<br />Everything<br />You Want
                        </h2>
                        <p className="text-sm font-normal text-white/80 leading-relaxed mt-6">
                            You can get everything you want if you work hard, trust the process, and stick to the plan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex-1 min-h-[calc(100vh-16px)] bg-white rounded-2xl flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative">
                {/* Upper Spacing / Logo Header */}
                <div className="absolute top-10 left-0 w-full flex justify-center items-center">
                    <Link href="/" className="flex items-center gap-3 group" aria-label="Desento">
                        <h1 className="text-2xl font-black tracking-tighter text-text-dark transition-colors">
                            Desento<span className="text-secondary">.</span>
                        </h1>
                    </Link>
                </div>

                {/* Main Auth Form content */}
                <div className="w-full max-w-[380px] flex flex-col gap-8 mt-12">
                    {/* Welcome Header */}
                    <div className="text-center space-y-3">
                        <h1 className={`text-4xl font-semibold tracking-tight text-black ${serif.className}`}>
                            Welcome Back
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Login with your Google account to continue
                        </p>
                    </div>

                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-black hover:bg-black hover:text-white transition-colors ease-linear cursor-pointer"
                    >
                        <FcGoogle className="w-5 h-5 shrink-0" />
                        <span>Sign In with Google</span>
                    </button>
                </div>

                <div className="text-center absolute bottom-10 left-0 w-full">
                    <p className="text-sm font-medium text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-bold text-black hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
