import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FollowUpPage = dynamic(() => import('@/features/followup/components/FollowUpPage'), {
    ssr: false,
});

export default function Page() {
    return (
        <Suspense>
            <FollowUpPage />
        </Suspense>
    );
}
