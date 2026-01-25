import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/providers/AuthProvider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'MailMagic - Apply to 10x More Jobs in 10x Less Time',
    description: 'Job application automation SaaS that helps you apply to multiple jobs without rewriting the same email repeatedly. Safe, professional, and efficient.',
    keywords: ['job search', 'email automation', 'job application', 'career', 'gmail automation'],
    authors: [{ name: 'MailMagic' }],
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#A855F7',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
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
            </body>
        </html>
    );
}
