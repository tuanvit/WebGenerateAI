'use client';

import { useState } from 'react';

export default function TestRatingPage() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testRating = async (rating: number) => {
        setLoading(true);
        try {
            // First get a real content ID
            const contentResponse = await fetch('/api/community/content');
            const contentData = await contentResponse.json();
            const contentId = contentData.data?.[0]?.id || 'test-id';

            setResult(prev => prev + `\n\nTesting rating ${rating} for content: ${contentId}`);

            // Test with the simple rating API (no session required)
            const response = await fetch('/api/debug/test-rating-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId, rating }),
            });

            const data = await response.json();
            setResult(prev => prev + '\n\n' + JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(prev => prev + '\n\nError: ' + error);
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
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Test Rating System</h1>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                            <button
                                key={rating}
                                onClick={() => testRating(rating)}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Testing...' : `Rate ${rating} ⭐`}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const response = await fetch('/api/debug/test-db');
                                    const data = await response.json();
                                    setResult(JSON.stringify(data, null, 2));
                                } catch (error) {
                                    setResult(`DB Test Error: ${error}`);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test Database'}
                        </button>

                        <button
                            onClick={seedData}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Seeding...' : 'Seed Community Data'}
                        </button>

                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const response = await fetch('/api/debug/simple-setup', { method: 'POST' });
                                    const data = await response.json();
                                    setResult(JSON.stringify(data, null, 2));
                                } catch (error) {
                                    setResult(`Setup Error: ${error}`);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Setting up...' : 'Simple Setup'}
                        </button>

                        <button
                            onClick={() => setResult('')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Clear Results
                        </button>

                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const response = await fetch('/api/debug/reset-ratings', { method: 'POST' });
                                    const data = await response.json();
                                    setResult(prev => prev + '\n\nReset: ' + JSON.stringify(data, null, 2));
                                } catch (error) {
                                    setResult(prev => prev + '\n\nReset Error: ' + error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Reset All Ratings
                        </button>

                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const response = await fetch('/api/debug/test-session');
                                    const data = await response.json();
                                    setResult(prev => prev + '\n\nSession Test: ' + JSON.stringify(data, null, 2));
                                } catch (error) {
                                    setResult(prev => prev + '\n\nSession Test Error: ' + error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                        >
                            Test Session
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">Result:</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {result}
                        </pre>
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Click "Seed Community Data" to create sample content</li>
                        <li>Test rating logic by clicking different star ratings above</li>
                        <li>Notice that rating the same content multiple times updates (not adds) the rating</li>
                        <li>Go to <a href="/library/community" className="text-blue-600 hover:underline">/library/community</a></li>
                        <li>Try rating the content with stars - should work the same way</li>
                    </ol>

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">Expected Behavior:</h3>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                            <li>First rating: "Đánh giá đã được ghi nhận" + increases rating count</li>
                            <li>Subsequent ratings: "Đánh giá đã được cập nhật" + keeps same rating count</li>
                            <li>Each user can only have 1 rating per content item</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}