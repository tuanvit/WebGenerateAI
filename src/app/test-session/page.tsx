"use client"

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TestSession() {
    const { data: session, status } = useSession();
    const [cookies, setCookies] = useState('');

    useEffect(() => {
        setCookies(document.cookie);
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Session Test</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold">Status:</h2>
                <p>{status}</p>
            </div>

            <div className="mb-4">
                <h2 className="text-lg font-semibold">Session:</h2>
                <pre className="bg-gray-100 p-2 rounded">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>

            <div className="mb-4">
                <h2 className="text-lg font-semibold">Cookies:</h2>
                <pre className="bg-gray-100 p-2 rounded text-xs">
                    {cookies}
                </pre>
            </div>

            <div className="space-y-2">
                <button
                    onClick={async () => {
                        const response = await fetch('/api/auth/demo-login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: 'admin@example.com', name: 'Admin User' })
                        });
                        const result = await response.json();
                        console.log('Demo login result:', result);
                        window.location.reload();
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                    Demo Login
                </button>

                <button
                    onClick={async () => {
                        await fetch('/api/debug/clear-session', { method: 'POST' });
                        window.location.reload();
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Clear Session
                </button>
            </div>
        </div>
    );
}