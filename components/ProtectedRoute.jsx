'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Only redirect after we've confirmed the status is unauthenticated
        // Wait for status to not be 'loading' before making any redirect decisions
        if (status === 'loading') {
            return; // Still loading, don't do anything yet
        }

        if (status === 'unauthenticated') {
            console.log('ProtectedRoute: User is not authenticated, redirecting to home...');
            router.replace('/');
        } else if (status === 'authenticated') {
            console.log('ProtectedRoute: User is authenticated');
            setIsChecking(false);
        }
    }, [status, router]);

    // Show loading while status is being determined
    if (status === 'loading' || isChecking) {
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
