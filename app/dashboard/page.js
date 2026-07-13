import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DashboardHome = dynamic(() => import('@/features/analytics/components/DashboardHome'));

export default function Page() {
    return (
        <Suspense>
            <DashboardHome />
        </Suspense>
    );
}
