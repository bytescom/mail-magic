import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ContactPage = dynamic(() => import('@/features/marketing/ContactPage'), {
    ssr: true,
});

export default function Page() {
    return (
        <Suspense>
            <ContactPage />
        </Suspense>
    );
}
