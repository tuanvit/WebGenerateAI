import { NextResponse } from 'next/server';

export async function GET() {
    const config = {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT SET',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '***SET***' : 'NOT SET',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '***SET***' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
        message: 'Auth Configuration Debug',
        config,
        requiredRedirectURI: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        timestamp: new Date().toISOString()
    });
}