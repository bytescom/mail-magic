import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from '@/components/Loading';

const DashboardHome = dynamic(() => import('@/features/analytics/components/DashboardHome'));

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <DashboardHome />
        </Suspense>
    );
}
