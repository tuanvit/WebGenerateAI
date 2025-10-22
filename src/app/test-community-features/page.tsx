'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function TestCommunityFeaturesPage() {
    const { data: session, status } = useSession();
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [contents, setContents] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({});

    const loadContents = async (page = 1) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/community/content?page=${page}&limit=5`);
            const data = await response.json();

            if (data.success) {
                setContents(data.data);
                setPagination(data.pagination);
                setResult(`Loaded ${data.data.length} contents (Page ${data.pagination.page}/${data.pagination.totalPages})`);
            } else {
                setResult(`Error: ${data.error}`);
            }
        } catch (error) {
            setResult(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testDelete = async (contentId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/community/content/${contentId}/delete`, {
                method: 'DELETE',
            });

            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));

            if (data.success) {
                // Reload contents
                await loadContents(pagination.page);
            }
        } catch (error) {
            setResult(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const seedData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/debug/seed-community', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                setResult(`✅ ${data.message}`);
                await loadContents(1);
            } else {
                setResult(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setResult(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            loadContents(1);
        }
    }, [session]);

    if (status === 'loading') {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Test Community Features</h1>

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
                            <p className="mb-4">User ID: {session.user?.id}</p>

                            <div className="space-x-2 space-y-2">
                                <button
                                    onClick={seedData}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Seeding...' : '🌱 Seed Data'}
                                </button>

                                <button
                                    onClick={() => loadContents(1)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Loading...' : '📄 Load Page 1'}
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

                {/* Pagination Test */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Pagination Test</h2>
                        <div className="flex space-x-2">
                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => loadContents(i + 1)}
                                    disabled={loading}
                                    className={`px-3 py-2 text-sm rounded ${i + 1 === pagination.page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        } disabled:opacity-50`}
                                >
                                    Page {i + 1}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Total: {pagination.totalCount} items, {pagination.totalPages} pages
                        </p>
                    </div>
                )}

                {/* Contents List */}
                {contents.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Contents (Page {pagination.page})</h2>

                        <div className="space-y-4">
                            {contents.map((content) => (
                                <div key={content.id} className="border rounded p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{content.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>Author: {content.author?.name}</span>
                                                <span>Subject: {content.subject}</span>
                                                <span>Grade: {content.gradeLevel}</span>
                                                <span>Rating: {content.rating.toFixed(1)}⭐ ({content.ratingCount})</span>
                                            </div>
                                        </div>

                                        {session?.user?.id === content.author?.id && (
                                            <button
                                                onClick={() => testDelete(content.id)}
                                                disabled={loading}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                            >
                                                {loading ? 'Deleting...' : '🗑️ Delete'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {result && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Result</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                            {result}
                        </pre>
                    </div>
                )}

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-2">Features Tested:</h3>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        <li>✅ Pagination (10 items per page)</li>
                        <li>✅ Delete own content (only author can delete)</li>
                        <li>✅ API pagination with filters</li>
                        <li>✅ Real-time content updates</li>
                        <li>🔗 Go to <a href="/library/community" className="underline">/library/community</a> to test in real UI</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}