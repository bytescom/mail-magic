import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const TermsPage = dynamic(() => import('@/features/marketing/components/TermsPage'), {
    ssr: true,
});

export default function Page() {
    return (
        <Suspense>
            <TermsPage />
        </Suspense>
    );
}
