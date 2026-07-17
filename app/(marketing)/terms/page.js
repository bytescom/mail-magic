import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const TermsPage = dynamic(() => import('@/features/marketing/TermsPage'), {
    ssr: true,
});

export default function Page() {
    return (
        <Suspense>
            <TermsPage />
        </Suspense>
    );
}
