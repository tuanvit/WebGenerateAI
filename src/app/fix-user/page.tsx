'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

// Extend session type to include id
interface ExtendedUser {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
}

export default function FixUserPage() {
    const { data: session, status } = useSession();
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const fixUserData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/debug/fix-user-data', { method: 'POST' });
            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testRating = async () => {
        setLoading(true);
        try {
            // Get first content
            const contentResponse = await fetch('/api/community/content');
            const contentData = await contentResponse.json();

            if (contentData.success && contentData.data.length > 0) {
                const contentId = contentData.data[0].id;

                // Try to rate it
                const ratingResponse = await fetch(`/api/community/content/${contentId}/rating`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rating: 5 }),
                });

                const ratingData = await ratingResponse.json();
                setResult(JSON.stringify(ratingData, null, 2));
            } else {
                setResult('No content found to rate');
            }
        } catch (error) {
            setResult(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Fix User Data & Test Rating</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Session Status</h2>

                    {!session ? (
                        <div>
                            <p className="mb-4">Not signed in</p>
                            <button
                                onClick={() => signIn('google')}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Sign in with Google
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-2">Signed in as: {session.user?.email}</p>
                            <p className="mb-2">Name: {session.user?.name}</p>
                            <p className="mb-4">User ID: {(session.user as ExtendedUser)?.id || 'Not available'}</p>

                            <div className="space-x-2 space-y-2">
                                <button
                                    onClick={fixUserData}
                                    disabled={loading}
                                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {loading ? 'Fixing...' : '🔧 Fix User Data'}
                                </button>

                                <button
                                    onClick={testRating}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Testing...' : '⭐ Test Rating'}
                                </button>

                                <button
                                    onClick={() => signOut()}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {result && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Result</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                            {result}
                        </pre>
                    </div>
                )}

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
                        <li>Sign in with Google first</li>
                        <li>Click "Fix User Data" to resolve any user ID conflicts</li>
                        <li>Click "Test Rating" to test the rating functionality</li>
                        <li>Check the result to see if everything works</li>
                        <li>Go to <a href="/library/community" className="underline">/library/community</a> to test in real UI</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}