import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PrivacyPage = dynamic(() => import('@/features/marketing/components/PrivacyPage'), {
    ssr: true,
});

export default function Page() {
    return (
        <Suspense>
            <PrivacyPage />
        </Suspense>
    );
}
