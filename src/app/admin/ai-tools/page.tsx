import { Metadata } from 'next';
import { AIToolsService } from '@/lib/admin/services/ai-tools-service';
import AIToolsManager from '@/components/admin/ai-tools/AIToolsManager';

export const metadata: Metadata = {
    title: 'AI Tools - Admin Panel',
    description: 'Quản lý 40+ công cụ AI trong hệ thống',
};

export default async function AdminAIToolsPage() {
    // Load initial data on server side
    const aiToolsService = new AIToolsService();

    try {
        const initialData = await aiToolsService.getAITools({
            page: 1,
            limit: 25,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        });

        return <AIToolsManager initialData={initialData} />;
    } catch (error) {
        console.error('Error loading AI tools:', error);

        // Return manager without initial data - it will load on client side
        return <AIToolsManager />;
    }
}