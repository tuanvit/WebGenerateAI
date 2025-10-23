'use client';

import { useState } from 'react';
import TemplateManager from '@/components/templates/TemplateManager';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

export default function TemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

    const handleSelectTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        // You could redirect to create-prompt page with the template
        // or show a success message
        alert(`Đã chọn template: ${template.name}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <TemplateManager
                    onSelectTemplate={handleSelectTemplate}
                    selectedTemplateId={selectedTemplate?.id}
                    showCreateButton={true}
                />
            </div>
        </div>
    );
}