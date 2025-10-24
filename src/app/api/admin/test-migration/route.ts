/**
 * Test Migration API Endpoint
 * Simple endpoint to test template migration functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { testTemplateMigration } from '@/lib/admin/test-migration';

export async function GET(request: NextRequest) {
    try {
        const result = await testTemplateMigration();

        return NextResponse.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('Test migration error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
}