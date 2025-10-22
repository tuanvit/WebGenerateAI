'use client';

import { useState, useEffect } from 'react';
import { SimpleUser } from '../lib/simple-auth';

export function useSimpleAuth() {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/simple-auth/me');
            const data = await response.json();
            setUser(data.user);
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/simple-auth/logout', { method: 'POST' });
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return {
        user,
        loading,
        logout,
        isAuthenticated: !!user,
        checkAuth
    };
}