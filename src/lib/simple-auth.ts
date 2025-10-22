// Simple authentication system for testing
export interface SimpleUser {
    id: string;
    email: string;
    name: string;
    role: 'teacher' | 'admin';
}

// Predefined test accounts
export const TEST_ACCOUNTS: SimpleUser[] = [
    {
        id: 'teacher-1',
        email: 'giaovien@demo.com',
        name: 'Cô Nguyễn Thị Lan',
        role: 'teacher'
    },
    {
        id: 'teacher-2',
        email: 'thayminh@demo.com',
        name: 'Thầy Trần Văn Minh',
        role: 'teacher'
    },
    {
        id: 'admin-1',
        email: 'admin@demo.com',
        name: 'Quản trị viên',
        role: 'admin'
    }
];

export function validateCredentials(email: string, password: string): SimpleUser | null {
    // Simple validation - in real app, this would check against database
    if (password !== 'demo123') {
        return null;
    }

    return TEST_ACCOUNTS.find(account => account.email === email) || null;
}

export function getUserById(id: string): SimpleUser | null {
    return TEST_ACCOUNTS.find(account => account.id === id) || null;
}

// Session management
const SESSIONS = new Map<string, { userId: string; expires: Date }>();

export function createSession(userId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    SESSIONS.set(sessionId, { userId, expires });
    return sessionId;
}

export function getSessionUser(sessionId: string): SimpleUser | null {
    const session = SESSIONS.get(sessionId);
    if (!session || session.expires < new Date()) {
        if (session) SESSIONS.delete(sessionId);
        return null;
    }

    return getUserById(session.userId);
}

export function deleteSession(sessionId: string): void {
    SESSIONS.delete(sessionId);
}