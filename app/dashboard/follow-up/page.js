import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FollowUpPage = dynamic(() => import('@/features/outreach/components/FollowUpAutomationPage'));

export default function Page() {
    return (
        <Suspense>
            <FollowUpPage />
        </Suspense>
    );
}
