'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function TestSessionRatingPage() {
    const { data: session, status } = useSession();
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [contents, setContents] = useState<any[]>([]);

    const testUserCreation = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/debug/test-user-creation');
            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const loadContents = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/community/content');
            const data = await response.json();
            if (data.success) {
                setContents(data.data.slice(0, 3)); // Get first 3 items
                setResult('Contents loaded successfully');
            }
        } catch (error) {
            setResult(`Error loading contents: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testRating = async (contentId: string, rating: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/community/content/${contentId}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating }),
            });

            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));

            if (data.success) {
                // Reload contents to see updated ratings
                await loadContents();
            }
        } catch (error) {
            setResult(`Error rating: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            loadContents();
        }
    }, [session]);

    if (status === 'loading') {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Test Session & Rating</h1>

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
                            <p className="mb-4">User ID: {session.user?.id}</p>

                            <div className="space-x-2">
                                <button
                                    onClick={testUserCreation}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Testing...' : 'Test User Creation'}
                                </button>

                                <button
                                    onClick={loadContents}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Loading...' : 'Load Contents'}
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

                {session && contents.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Test Rating</h2>

                        <div className="space-y-4">
                            {contents.map((content) => (
                                <div key={content.id} className="border rounded p-4">
                                    <h3 className="font-semibold mb-2">{content.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Rating: {content.rating.toFixed(1)}⭐ ({content.ratingCount} ratings)
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">ID: {content.id}</p>

                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => testRating(content.id, rating)}
                                                disabled={loading}
                                                className="px-2 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 rounded disabled:opacity-50"
                                            >
                                                {rating}⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {result && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Result</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {result}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}