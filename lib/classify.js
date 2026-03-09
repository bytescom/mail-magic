/**
 * Rule-based email reply classifier.
 * Returns { replyType, confidenceScore, reason }
 *
 * replyType: 'interview' | 'positive' | 'negative' | 'neutral'
 */

// ── Interview signals (highest priority) ──
const interviewSignals = [
    'schedule an interview',
    'interview',
    'call with',
    'video call',
    'zoom call',
    'meet with',
    'let\'s connect',
    'availability',
    'available for a call',
    'technical round',
    'hr round',
    'next round',
    'shortlisted',
    'selected',
    'setup a meeting',
    'set up a meeting',
    'book a time',
    'calendly',
    'schedule a time',
    'would like to speak',
    'would love to speak',
    'want to speak',
    'discuss your application',
    'move forward',
    'proceed with',
];

// ── Positive signals ──
const positiveSignals = [
    'impressed',
    'interested in your profile',
    'great profile',
    'strong background',
    'your experience',
    'look forward to',
    'will get back',
    'we will review',
    'under review',
    'keep your resume',
    'consider you',
    'reach out',
    'thank you for applying',
    'thank you for your interest',
    'appreciated',
];

// ── Rejection signals ──
const rejectionSignals = [
    'not moving forward',
    'not a good fit',
    'not the right fit',
    'position has been filled',
    'went with another candidate',
    'went with a different candidate',
    'decided to move forward with other candidates',
    'regret to inform',
    'unfortunately',
    'we will not',
    'we won\'t',
    'not selected',
    'reject',
    'rejection',
    'does not meet',
    'doesn\'t meet',
    'no longer',
    'closed the position',
    'put on hold',
    'no openings',
    'no current openings',
];

export function classifyReply(body) {
    const text = body.toLowerCase();

    let interviewScore = 0;
    let positiveScore = 0;
    let negativeScore = 0;

    interviewSignals.forEach(signal => {
        if (text.includes(signal)) interviewScore++;
    });

    positiveSignals.forEach(signal => {
        if (text.includes(signal)) positiveScore++;
    });

    rejectionSignals.forEach(signal => {
        if (text.includes(signal)) negativeScore++;
    });

    if (interviewScore > 0) {
        return {
            replyType: 'interview',
            confidenceScore: Math.min(0.5 + interviewScore * 0.15, 0.99),
            reason: `Interview signals detected: ${interviewScore} match(es)`,
        };
    }

    if (negativeScore > 0 && negativeScore >= positiveScore) {
        return {
            replyType: 'negative',
            confidenceScore: Math.min(0.5 + negativeScore * 0.15, 0.99),
            reason: `Rejection signals detected: ${negativeScore} match(es)`,
        };
    }

    if (positiveScore > 0) {
        return {
            replyType: 'positive',
            confidenceScore: Math.min(0.5 + positiveScore * 0.12, 0.9),
            reason: `Positive signals detected: ${positiveScore} match(es)`,
        };
    }

    return {
        replyType: 'neutral',
        confidenceScore: 0.4,
        reason: 'No strong signals detected',
    };
}
