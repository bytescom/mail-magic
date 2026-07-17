import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const LeadsPage = dynamic(() => import('@/features/leads/components/LeadsPage'));

export default function Page() {
    return (
        <Suspense>
            <LeadsPage />
        </Suspense>
    );
}
