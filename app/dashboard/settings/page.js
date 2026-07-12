import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Settings = dynamic(() => import('@/features/settings/SettingPage'), {
    ssr: false,
});

export default function Page() {
    return (
        <Suspense>
            <Settings />
        </Suspense>
    );
}