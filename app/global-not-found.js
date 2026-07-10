import './globals.css'
import { Manrope } from 'next/font/google'
import { FiMail } from 'react-icons/fi'

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
});

export const metadata = {
    title: '404 - Page Not Found | Desento',
    description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
    return (
        <html lang="en" className={`${manrope.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col font-sans bg-background" suppressHydrationWarning>
                {/* overlay */}
                <div
                    className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(var(--background) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 overflow-hidden">

                    {/* 404 Content */}
                    <div className="space-y-8 max-w-md relative z-10 flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2 sm:gap-4 opacity-0 animate-[pageFadeIn_0.5s_ease-out_forwards]">
                            <h1 className="text-[120px] sm:text-[160px] leading-none font-black tracking-tighter text-text-dark drop-shadow-lg">
                                4
                            </h1>
                            <div className="relative flex items-center justify-center h-[90px] w-[90px] sm:h-[120px] sm:w-[120px] rounded-full bg-secondary/10 border border-foreground shadow-[0_0_40px_rgba(249,115,22,0.15)]">
                                <FiMail className="w-10 h-10 sm:w-14 sm:h-14 text-secondary" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-[120px] sm:text-[160px] leading-none font-black tracking-tighter text-text-dark drop-shadow-lg">
                                4
                            </h1>
                        </div>

                        <div className="space-y-4 mt-8 opacity-0 animate-[pageFadeIn_0.5s_ease-out_0.15s_forwards]">
                            <h2 className="text-3xl font-bold text-text-dark">
                                Page not found
                            </h2>
                            <p className="text-text font-medium leading-relaxed text-[15px]">
                                Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
                            </p>
                        </div>
                    </div>

                    {/* overlapping blobs for a crafted, intentional gradient feel */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-[75%] -translate-y-[65%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-indigo-600/10 rounded-full blur-[100px] sm:blur-[120px] -z-10 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-[25%] -translate-y-[35%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-orange-500/5 rounded-full blur-[80px] sm:blur-[100px] -z-10 pointer-events-none" />
                </main>
            </body>
        </html>
    )
}


