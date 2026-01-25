import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        return NextResponse.json({
            hasSession: !!session,
            session: session ? {
                user: {
                    name: session.user?.name,
                    email: session.user?.email,
                    id: session.user?.id,
                },
                hasAccessToken: !!session.accessToken,
            } : null,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json({
            error: error.message,
            hasSession: false,
        }, { status: 500 });
    }
}
