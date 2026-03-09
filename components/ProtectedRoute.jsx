'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Derived — no useState needed
    const isChecking = status === 'loading';

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.replace('/');
        }
    }, [status, router]);

    // Show loading while status is being determined
    if (isChecking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // If we get here and there's no session, we're about to be redirected
    if (!session) {
        return null;
    }

    return children;
}
