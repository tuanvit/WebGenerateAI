'use client';

import React, { useState, useEffect } from 'react';
import { TemplateData } from '@/lib/admin/repositories/templates-repository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Eye,
    Play,
    RefreshCw,
    Copy,
    Download,
    AlertCircle,
    CheckCircle,
    X,
    FileText,
    Settings,
    TestTube
} from 'lucide-react';
import { toast } from 'sonner';

interface TemplatePreviewModalProps {
    isOpen: boolean;
    template?: TemplateData;
    onClose: () => void;
}

interface ValidationResult {
    isValid: boolean;
    missingVariables: string[];
    unusedVariables: string[];
    errors: string[];
}

export default function TemplatePreviewModal({
    isOpen,
    template,
    onClose
}: TemplatePreviewModalProps) {
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [selectedExample, setSelectedExample] = useState<number>(-1);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [validation, setValidation] = useState<ValidationResult>({
        isValid: true,
        missingVariables: [],
        unusedVariables: [],
        errors: []
    });
    const [activeTab, setActiveTab] = useState('preview');

    // Initialize variable values when template changes
    useEffect(() => {
        if (template) {
            const initialValues: Record<string, string> = {};

            // Set default values from template variables
            template.variables?.forEach(variable => {
                initialValues[variable.name] = variable.defaultValue || '';
            });

            setVariableValues(initialValues);
            setSelectedExample(-1);
            setActiveTab('preview');
        }
    }, [template]);

    // Update preview content when variables change
    useEffect(() => {
        if (template) {
            updatePreview();
        }
    }, [template, variableValues]);

    // Extract variables from template content
    const extractVariables = (content: string): string[] => {
        const variableRegex = /{{([^}]+)}}/g;
        const variables: string[] = [];
        let match;

        while ((match = variableRegex.exec(content)) !== null) {
            const variableName = match[1].trim();
            if (!variables.includes(variableName)) {
                variables.push(variableName);
            }
        }

        return variables;
    };

    // Validate template variables
    const validateTemplate = (): ValidationResult => {
        if (!template) {
            return {
                isValid: false,
                missingVariables: [],
                unusedVariables: [],
                errors: ['Template không tồn tại']
            };
        }

        const templateVariables = extractVariables(template.templateContent);
        const definedVariables = template.variables?.map(v => v.name) || [];
        const providedVariables = Object.keys(variableValues);

        // Find missing variables (used in template but not defined)
        const missingVariables = templateVariables.filter(v => !definedVariables.includes(v));

        // Find unused variables (defined but not used in template)
        const unusedVariables = definedVariables.filter(v => !templateVariables.includes(v));

        // Find required variables without values
        const requiredVariables = template.variables?.filter(v => v.required).map(v => v.name) || [];
        const emptyRequiredVariables = requiredVariables.filter(v => !variableValues[v] || variableValues[v].trim() === '');

        const errors: string[] = [];
        if (emptyRequiredVariables.length > 0) {
            errors.push(`Các biến bắt buộc chưa được điền: ${emptyRequiredVariables.join(', ')}`);
        }

        return {
            isValid: missingVariables.length === 0 && errors.length === 0,
            missingVariables,
            unusedVariables,
            errors
        };
    };

    // Update preview content
    const updatePreview = () => {
        if (!template) return;

        let content = template.templateContent;

        // Replace variables with values
        Object.entries(variableValues).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value || `[${key}]`);
        });

        // Highlight unreplaced variables
        content = content.replace(/{{([^}]+)}}/g, '<span style="background-color: #fef2f2; color: #dc2626; padding: 2px 4px; border-radius: 4px;">[Thiếu: $1]</span>');

        setPreviewContent(content);
        setValidation(validateTemplate());
    };

    // Handle variable value change
    const handleVariableChange = (variableName: string, value: string) => {
        setVariableValues(prev => ({
            ...prev,
            [variableName]: value
        }));
    };

    // Load example data
    const loadExample = (exampleIndex: number) => {
        if (!template?.examples || exampleIndex < 0 || exampleIndex >= template.examples.length) {
            return;
        }

        const example = template.examples[exampleIndex];
        setVariableValues(example.sampleInput);
        setSelectedExample(exampleIndex);
        toast.success(`Đã tải ví dụ: ${example.title}`);
    };

    // Reset variables to default values
    const resetVariables = () => {
        if (!template) return;

        const defaultValues: Record<string, string> = {};
        template.variables?.forEach(variable => {
            defaultValues[variable.name] = variable.defaultValue || '';
        });

        setVariableValues(defaultValues);
        setSelectedExample(-1);
        toast.success('Đã reset về giá trị mặc định');
    };

    // Copy preview content to clipboard
    const copyToClipboard = async () => {
        try {
            // Remove HTML tags for plain text copy
            const plainText = previewContent.replace(/<[^>]*>/g, '');
            await navigator.clipboard.writeText(plainText);
            toast.success('Đã sao chép nội dung');
        } catch (error) {
            toast.error('Không thể sao chép nội dung');
        }
    };

    // Download preview as text file
    const downloadPreview = () => {
        if (!template) return;

        const plainText = previewContent.replace(/<[^>]*>/g, '');
        const blob = new Blob([plainText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.replace(/[^a-zA-Z0-9]/g, '_')}_preview.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Đã tải xuống file preview');
    };

    if (!template) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Xem trước Template: {template.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="preview">
                                <Eye className="h-4 w-4 mr-2" />
                                Xem trước
                            </TabsTrigger>
                            <TabsTrigger value="variables">
                                <Settings className="h-4 w-4 mr-2" />
                                Biến
                            </TabsTrigger>
                            <TabsTrigger value="examples">
                                <TestTube className="h-4 w-4 mr-2" />
                                Ví dụ
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="preview" className="space-y-4">
                            {/* Validation Status */}
                            {!validation.isValid && (
                                <Card className="border-red-200 bg-red-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-red-800">Có lỗi trong template</h4>
                                                <ul className="mt-2 text-sm text-red-700 space-y-1">
                                                    {validation.errors.map((error, index) => (
                                                        <li key={index}>• {error}</li>
                                                    ))}
                                                    {validation.missingVariables.length > 0 && (
                                                        <li>• Biến chưa được định nghĩa: {validation.missingVariables.join(', ')}</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {validation.unusedVariables.length > 0 && (
                                <Card className="border-yellow-200 bg-yellow-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Cảnh báo</h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Biến được định nghĩa nhưng không sử dụng: {validation.unusedVariables.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Preview Actions */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={updatePreview}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Làm mới
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={resetVariables}>
                                        <X className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Sao chép
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={downloadPreview}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Tải xuống
                                    </Button>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Kết quả Preview
                                        {validation.isValid && (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm border min-h-[300px]"
                                        dangerouslySetInnerHTML={{ __html: previewContent }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="variables" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nhập giá trị cho các biến</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {template.variables && template.variables.length > 0 ? (
                                        <div className="space-y-4">
                                            {template.variables.map((variable, index) => (
                                                <div key={index} className="space-y-2">
                                                    <Label className="flex items-center gap-2">
                                                        {variable.label}
                                                        {variable.required && (
                                                            <span className="text-red-500">*</span>
                                                        )}
                                                    </Label>

                                                    {variable.description && (
                                                        <p className="text-sm text-gray-600">{variable.description}</p>
                                                    )}

                                                    {variable.type === 'textarea' ? (
                                                        <Textarea
                                                            value={variableValues[variable.name] || ''}
                                                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                            placeholder={variable.placeholder}
                                                            rows={4}
                                                        />
                                                    ) : variable.type === 'select' ? (
                                                        <Select
                                                            value={variableValues[variable.name] || ''}
                                                            onValueChange={(value) => handleVariableChange(variable.name, value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={variable.placeholder || 'Chọn giá trị'} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {variable.options?.map((option, optIndex) => (
                                                                    <SelectItem key={optIndex} value={option}>
                                                                        {option}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input
                                                            value={variableValues[variable.name] || ''}
                                                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                            placeholder={variable.placeholder}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Template này không có biến nào.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="examples" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ví dụ mẫu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {template.examples && template.examples.length > 0 ? (
                                        <div className="space-y-4">
                                            {template.examples.map((example, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium">{example.title}</h4>
                                                            {example.description && (
                                                                <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => loadExample(index)}
                                                            variant={selectedExample === index ? "default" : "outline"}
                                                        >
                                                            <Play className="h-4 w-4 mr-2" />
                                                            {selectedExample === index ? 'Đang sử dụng' : 'Sử dụng'}
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium">Dữ liệu đầu vào:</Label>
                                                            <pre className="bg-gray-50 p-2 rounded text-xs mt-1 overflow-x-auto">
                                                                {JSON.stringify(example.sampleInput, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium">Kết quả mong đợi:</Label>
                                                            <div className="bg-gray-50 p-2 rounded text-xs mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                                {example.expectedOutput}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Template này chưa có ví dụ nào.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end pt-6 border-t">
                        <Button onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}