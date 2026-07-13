import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FollowUpPage = dynamic(() => import('@/features/followup/components/FollowUpPage'));

export default function Page() {
    return (
        <Suspense>
            <FollowUpPage />
        </Suspense>
    );
}
