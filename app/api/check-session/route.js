import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        return NextResponse.json({
            authenticated: !!session,
            session: session ? {
                user: {
                    name: session.user?.name,
                    email: session.user?.email,
                    id: session.user?.id,
                },
                hasAccessToken: !!session.accessToken,
                hasRefreshToken: !!session.refreshToken,
            } : null,
        });
    } catch (error) {
        return NextResponse.json({
            authenticated: false,
            error: error.message,
        }, { status: 500 });
    }
}
