import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '../../../../lib/simple-auth';

export async function GET(request: NextRequest) {
    try {
        const sessionId = request.cookies.get('simple-auth-session')?.value;

        if (!sessionId) {
            return NextResponse.json({ user: null });
        }

        const user = getSessionUser(sessionId);

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ user: null });
    }
}