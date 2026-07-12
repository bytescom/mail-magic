import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const LandingPage = dynamic(() => import('@/features/landing/LandingPage'), {
    ssr: true,
});

export default function Page() {
    return (
        <Suspense>
            <LandingPage />
        </Suspense>
    );
}
