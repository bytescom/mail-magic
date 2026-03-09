import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classifyReply } from '@/lib/classify';

/**
 * POST /api/ai-classify
 *
 * Classifies an email reply body into one of:
 * - interview   → HR wants to schedule an interview
 * - positive    → Positive response, interest expressed
 * - negative    → Rejection
 * - neutral     → Generic acknowledgement, no clear signal
 *
 * Uses rule-based classification (fast, free, no API key needed).
 * Can be upgraded to use OpenAI/Gemini later by swapping the classify() function.
 */
export async function POST(request) {
    try {
        // 🔒 SECURITY: Require authentication — this endpoint must not be publicly accessible
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { emailBody } = await request.json();

        if (!emailBody || typeof emailBody !== 'string') {
            return NextResponse.json({ error: 'emailBody is required' }, { status: 400 });
        }

        // 🔒 SECURITY: Cap input size to prevent computational abuse (10KB limit)
        if (emailBody.length > 10000) {
            return NextResponse.json({ error: 'emailBody too long (max 10,000 characters)' }, { status: 400 });
        }

        const result = classifyReply(emailBody);

        return NextResponse.json(result);
    } catch (error) {
        console.error('AI classify error:', error);
        return NextResponse.json({ error: 'Classification failed' }, { status: 500 });
    }
}

