import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const OutreachPage = dynamic(() => import('@/features/outreach/components/OutreachPage'), {
    ssr: false,
});

export default function Page() {
    return (
        <Suspense>
            <OutreachPage />
        </Suspense>
    );
}