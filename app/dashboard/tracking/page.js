import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const TrackingPage = dynamic(() => import('@/features/tracking/components/TrackingPage'), {
    ssr: false,
});

export default function Page() {
    return (
        <Suspense>
            <TrackingPage />
        </Suspense>
    );
}
