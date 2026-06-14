import { Inter, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/providers/AuthProvider';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import '@/styles/globals.css';

// Optimize font loading with Next.js font optimization
const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-inter',
    display: 'swap', // Prevent invisible text while fonts load
    preload: true,
    fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const outfit = Outfit({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-outfit',
    display: 'swap',
    preload: true,
    fallback: ['sans-serif'],
});

export const metadata = {
    title: 'MailMagic - Apply to 10x More Jobs in 10x Less Time',
    description: 'Job application automation SaaS that helps you apply to multiple jobs without rewriting the same email repeatedly. Safe, professional, and efficient.',
    keywords: ['job search', 'email automation', 'job application', 'career', 'gmail automation'],
    authors: [{ name: 'MailMagic' }],
    icons: {
        icon: '/favicon.png',
        apple: '/favicon.png',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3B82F6',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth">
            <head>
                {/* Preconnect to external domains for faster resource loading */}
                <link rel="preconnect" href="https://api.dicebear.com" />
                <link rel="preconnect" href="https://lh3.googleusercontent.com" />
                <link rel="dns-prefetch" href="https://api.dicebear.com" />
                <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
            </head>
            <body className="font-sans antialiased">
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        expand={true}
                        richColors
                        closeButton
                        theme="dark"
                    />
                </AuthProvider>
                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    );
}
