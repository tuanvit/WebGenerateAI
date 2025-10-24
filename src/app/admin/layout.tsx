import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
    title: 'Admin Panel - AI Prompt Generator',
    description: 'Hệ thống quản lý admin cho AI Prompt Generator',
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}