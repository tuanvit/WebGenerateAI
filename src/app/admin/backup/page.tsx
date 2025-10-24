import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { BackupManager } from '@/components/admin/backup/BackupManager';

export const metadata: Metadata = {
    title: 'Backup & Restore - Admin',
    description: 'Quản lý backup và khôi phục dữ liệu hệ thống'
};

export default function BackupPage() {
    return (
        <AdminLayout currentSection="backup">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
                    <p className="text-muted-foreground">
                        Quản lý backup và khôi phục dữ liệu AI tools và templates
                    </p>
                </div>

                <BackupManager />
            </div>
        </AdminLayout>
    );
}