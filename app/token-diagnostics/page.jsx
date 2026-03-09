'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TokenDiagnostics() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [diagnostics, setDiagnostics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runDiagnostics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/validate-tokens');
            const data = await response.json();
            setDiagnostics(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        router.push('/api/auth/signout');
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
                    <p className="text-gray-600 mb-6">Please sign in to view token diagnostics.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
                        <h1 className="text-3xl font-bold text-white">🔐 OAuth Token Diagnostics</h1>
                        <p className="text-blue-100 mt-2">Check your Gmail OAuth token status</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Session Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Session Information</h2>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">User:</span> {session.user?.name}</p>
                                <p><span className="font-medium">Email:</span> {session.user?.email}</p>
                                <p><span className="font-medium">User ID:</span> {session.user?.id || 'Not available'}</p>
                            </div>
                        </div>

                        {/* Run Diagnostics Button */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                            <button
                                onClick={runDiagnostics}
                                disabled={loading}
                                className="flex-1 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors text-sm sm:text-base"
                            >
                                {loading ? '🔄 Running Diagnostics...' : '🔍 Run Token Diagnostics'}
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="px-4 sm:px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                            >
                                🚪 Sign Out & Re-authenticate
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Diagnostics Results */}
                        {diagnostics && (
                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className={`p-4 rounded-lg border-2 ${diagnostics.valid
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className={`text-lg font-bold ${diagnostics.valid ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                {diagnostics.valid ? '✅ Tokens Valid' : '❌ Token Issue Detected'}
                                            </h3>
                                            <p className={`text-sm ${diagnostics.valid ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                {diagnostics.message}
                                            </p>
                                        </div>
                                        {diagnostics.refreshed && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                Auto-Refreshed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Token Details</h3>
                                    <div className="space-y-2 text-sm">
                                        {diagnostics.details && Object.entries(diagnostics.details).map(([key, value]) => (
                                            <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 last:border-0 gap-1">
                                                <span className="font-medium text-gray-700 text-xs sm:text-sm">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                                </span>
                                                <span className={`font-mono text-xs sm:text-sm break-all ${typeof value === 'boolean'
                                                    ? value ? 'text-green-600' : 'text-red-600'
                                                    : 'text-gray-900'
                                                    }`}>
                                                    {typeof value === 'boolean'
                                                        ? (value ? '✓ Yes' : '✗ No')
                                                        : value?.toString() || 'N/A'
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Re-authentication Warning */}
                                {diagnostics.requiresReauth && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h3 className="text-yellow-800 font-semibold mb-2">⚠️ Re-authentication Required</h3>
                                        <p className="text-yellow-700 text-sm mb-3">
                                            Your OAuth tokens are invalid or expired and cannot be refreshed.
                                            Please sign out and sign in again to restore Gmail access.
                                        </p>
                                        <button
                                            onClick={handleSignOut}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium text-sm"
                                        >
                                            Sign Out Now
                                        </button>
                                    </div>
                                )}

                                {/* Reason/Error */}
                                {diagnostics.reason && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Issue Reason</h3>
                                        <p className="text-gray-700 text-sm font-mono">{diagnostics.reason}</p>
                                        {diagnostics.error && (
                                            <p className="text-gray-600 text-xs mt-2">{diagnostics.error}</p>
                                        )}
                                    </div>
                                )}

                                {/* Raw Response (for debugging) */}
                                <details className="p-4 bg-gray-50 rounded-lg">
                                    <summary className="font-semibold text-gray-900 cursor-pointer">
                                        🔧 Raw Response (for debugging)
                                    </summary>
                                    <pre className="mt-3 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-auto">
                                        {JSON.stringify(diagnostics, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}

                        {/* Help Section */}
                        <div className="mt-8 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">💡 Troubleshooting Tips</h3>
                            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800 leading-relaxed">
                                <li className="flex gap-2"><span className="shrink-0">•</span><span><strong>304 Status in Production?</strong> Check if your environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL) are correctly set in your hosting provider.</span></li>
                                <li className="flex gap-2"><span className="shrink-0">•</span><span><strong>Missing Refresh Token?</strong> Sign out completely and sign in again to get a new refresh token.</span></li>
                                <li className="flex gap-2"><span className="shrink-0">•</span><span><strong>Token Expired?</strong> Click &quot;Run Token Diagnostics&quot; - it will attempt to auto-refresh your token.</span></li>
                                <li className="flex gap-2"><span className="shrink-0">•</span><span><strong>Still Not Working?</strong> Revoke access in your Google Account settings, then sign in again.</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
