import { Toaster } from 'sonner';
import AuthProvider from '@/components/providers/AuthProvider';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import '@/styles/globals.css';

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
        <html lang="en">
            <body className="font-sans">
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
