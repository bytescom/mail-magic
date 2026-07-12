import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DashboardHome = dynamic(() => import('@/features/analytics/components/DashboardHome'), {
    ssr: false,
});

export default function Page() {
    return (
        <Suspense>
            <DashboardHome />
        </Suspense>
    );
}
