import { Metadata } from 'next';
import TemplatesManager from '@/components/admin/templates/TemplatesManager';
import { TemplatesService } from '@/lib/admin/services/templates-service';

export const metadata: Metadata = {
    title: 'Templates - Admin Panel',
    description: 'Quản lý mẫu prompt cho các mục đích giáo dục khác nhau',
};

async function getInitialTemplatesData() {
    try {
        const templatesService = new TemplatesService();
        const result = await templatesService.getTemplates({
            page: 1,
            limit: 25,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        });
        return result;
    } catch (error) {
        console.error('Error loading initial templates data:', error);
        return undefined;
    }
}

export default async function AdminTemplatesPage() {
    const initialData = await getInitialTemplatesData();

    return (
        <div className="space-y-6">
            <TemplatesManager initialData={initialData} />
        </div>
    );
}