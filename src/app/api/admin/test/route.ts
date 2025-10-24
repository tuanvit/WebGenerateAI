/**
 * Test API route for admin authentication
 * Verifies admin middleware and authentication is working
 */

import { NextResponse } from 'next/server';
import { withAdminMiddleware } from '@/lib/admin/admin-middleware';
import { AdminAction, AdminResource } from '@/lib/admin/admin-audit';

export const GET = withAdminMiddleware(
    async (context) => {
        return NextResponse.json({
            success: true,
            message: 'Admin authentication working',
            user: {
                id: context.user.id,
                email: context.user.email,
                name: context.user.name,
                role: context.user.role
            },
            timestamp: new Date().toISOString()
        });
    },
    {
        logAction: AdminAction.VIEW_AUDIT_LOGS,
        logResource: AdminResource.SYSTEM
    }
);