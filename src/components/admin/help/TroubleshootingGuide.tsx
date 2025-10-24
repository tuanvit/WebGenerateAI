"use client"

import { useState } from 'react';
import {
    AlertTriangle,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    RefreshCw,
    Database,
    Server,
    Wifi,
    User,
    FileText,
    Bot
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TroubleshootingItem {
    id: string;
    title: string;
    problem: string;
    symptoms: string[];
    causes: string[];
    solutions: Solution[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    tags: string[];
    lastUpdated: string;
    relatedIssues?: string[];
}

interface Solution {
    step: number;
    description: string;
    code?: string;
    warning?: string;
    tip?: string;
}

const troubleshootingData: TroubleshootingItem[] = [
    {
        id: 'login-failed',
        title: 'Không thể đăng nhập Admin Panel',
        problem: 'Người dùng không thể truy cập vào admin panel mặc dù có tài khoản',
        symptoms: [
            'Hiển thị lỗi "Unauthorized" hoặc "Access Denied"',
            'Được chuyển hướng về trang chính sau khi đăng nhập',
            'Không thấy menu admin sau khi đăng nhập',
            'Session bị logout tự động'
        ],
        causes: [
            'Tài khoản không có role "admin"',
            'Session đã hết hạn',
            'Database connection issue',
            'Middleware authentication lỗi',
            'Browser cache cũ'
        ],
        solutions: [
            {
                step: 1,
                description: 'Kiểm tra role của tài khoản trong database',
                code: 'SELECT id, email, role FROM users WHERE email = "user@example.com";',
                tip: 'Role phải là "admin" để truy cập admin panel'
            },
            {
                step: 2,
                description: 'Cập nhật role nếu cần thiết',
                code: 'UPDATE users SET role = "admin" WHERE email = "user@example.com";',
                warning: 'Chỉ cấp quyền admin cho người dùng đáng tin cậy'
            },
            {
                step: 3,
                description: 'Clear browser cache và cookies',
                tip: 'Sử dụng Ctrl+Shift+Delete hoặc chế độ incognito để test'
            },
            {
                step: 4,
                description: 'Kiểm tra kết nối database và restart server nếu cần',
                code: 'npm run dev # hoặc restart production server'
            },
            {
                step: 5,
                description: 'Kiểm tra logs để xác định nguyên nhân cụ thể',
                code: 'tail -f logs/app.log | grep "auth"'
            }
        ],
        severity: 'high',
        category: 'authentication',
        tags: ['login', 'admin', 'role', 'permission'],
        lastUpdated: '2024-01-15',
        relatedIssues: ['session-timeout', 'database-connection']
    },
    {
        id: 'ai-tools-not-loading',
        title: 'AI Tools không hiển thị hoặc loading lâu',
        problem: 'Trang AI Tools không load được dữ liệu hoặc loading rất chậm',
        symptoms: [
            'Trang hiển thị loading spinner mãi không dừng',
            'Hiển thị "No data available"',
            'Lỗi 500 Internal Server Error',
            'Trang load chậm hơn 10 giây'
        ],
        causes: [
            'Database query chậm',
            'Quá nhiều dữ liệu không được phân trang',
            'Server overload',
            'Network connectivity issues',
            'Cache bị corrupt'
        ],
        solutions: [
            {
                step: 1,
                description: 'Kiểm tra database connection và performance',
                code: 'SELECT COUNT(*) FROM ai_tools; -- Kiểm tra số lượng records'
            },
            {
                step: 2,
                description: 'Clear cache và restart server',
                code: 'npm run build && npm run start',
                tip: 'Cache có thể bị corrupt sau khi update dữ liệu'
            },
            {
                step: 3,
                description: 'Kiểm tra network tab trong browser DevTools',
                tip: 'Xem request nào bị chậm hoặc failed'
            },
            {
                step: 4,
                description: 'Optimize database queries với indexes',
                code: 'CREATE INDEX idx_ai_tools_category ON ai_tools(category);'
            },
            {
                step: 5,
                description: 'Implement pagination nếu chưa có',
                tip: 'Giới hạn 20-50 items per page để tăng performance'
            }
        ],
        severity: 'medium',
        category: 'performance',
        tags: ['ai-tools', 'loading', 'database', 'performance'],
        lastUpdated: '2024-01-14',
        relatedIssues: ['database-slow', 'server-overload']
    },
    {
        id: 'template-variables-error',
        title: 'Template variables không render đúng',
        problem: 'Variables trong template không được thay thế hoặc hiển thị lỗi syntax',
        symptoms: [
            'Variables hiển thị dạng {{variable_name}} thay vì giá trị',
            'Lỗi "Variable not found"',
            'Template render ra kết quả trống',
            'Special characters bị lỗi encoding'
        ],
        causes: [
            'Syntax variables không đúng',
            'Variable name có ký tự đặc biệt',
            'Missing variable definition',
            'Encoding issues với tiếng Việt',
            'Template parser lỗi'
        ],
        solutions: [
            {
                step: 1,
                description: 'Kiểm tra syntax variables',
                code: '{{variable_name}} // Đúng\n{variable_name} // Sai\n{{ variable_name }} // Sai (có space)',
                tip: 'Variables phải được bao bởi {{ }} không có space'
            },
            {
                step: 2,
                description: 'Kiểm tra tên variable',
                tip: 'Chỉ sử dụng chữ cái, số và gạch dưới. Không có dấu cách hoặc ký tự đặc biệt'
            },
            {
                step: 3,
                description: 'Verify variable definitions trong database',
                code: 'SELECT * FROM template_variables WHERE template_id = "template_id";'
            },
            {
                step: 4,
                description: 'Test với dữ liệu đơn giản trước',
                tip: 'Sử dụng text thuần không có ký tự đặc biệt để test'
            },
            {
                step: 5,
                description: 'Kiểm tra encoding UTF-8',
                warning: 'Đảm bảo database và application đều sử dụng UTF-8'
            }
        ],
        severity: 'medium',
        category: 'templates',
        tags: ['template', 'variables', 'syntax', 'encoding'],
        lastUpdated: '2024-01-13',
        relatedIssues: ['template-preview-error', 'encoding-issues']
    },
    {
        id: 'backup-failed',
        title: 'Backup thất bại hoặc file corrupt',
        problem: 'Quá trình backup không hoàn thành hoặc file backup không thể restore',
        symptoms: [
            'Backup process bị dừng giữa chừng',
            'File backup có size 0 bytes',
            'Lỗi "Backup file corrupted" khi restore',
            'Timeout error trong quá trình backup'
        ],
        causes: [
            'Không đủ disk space',
            'Database lock trong quá trình backup',
            'Network interruption',
            'Permission issues',
            'Large dataset timeout'
        ],
        solutions: [
            {
                step: 1,
                description: 'Kiểm tra disk space available',
                code: 'df -h # Linux/Mac\ndir # Windows',
                warning: 'Cần ít nhất 2x kích thước database để backup an toàn'
            },
            {
                step: 2,
                description: 'Kiểm tra database locks',
                code: 'SHOW PROCESSLIST; -- MySQL\nSELECT * FROM pg_stat_activity; -- PostgreSQL'
            },
            {
                step: 3,
                description: 'Thực hiện backup trong giờ ít traffic',
                tip: 'Backup vào lúc 2-4 AM khi ít người dùng online'
            },
            {
                step: 4,
                description: 'Tăng timeout cho backup process',
                code: 'MAX_BACKUP_TIMEOUT=3600 # 1 hour'
            },
            {
                step: 5,
                description: 'Sử dụng incremental backup cho dataset lớn',
                tip: 'Backup chỉ những thay đổi từ lần backup cuối'
            }
        ],
        severity: 'high',
        category: 'backup',
        tags: ['backup', 'restore', 'disk-space', 'timeout'],
        lastUpdated: '2024-01-12',
        relatedIssues: ['disk-space-low', 'database-lock']
    },
    {
        id: 'import-csv-failed',
        title: 'Import CSV/JSON thất bại',
        problem: 'Không thể import dữ liệu từ file CSV hoặc JSON',
        symptoms: [
            'Lỗi "Invalid file format"',
            'Import process bị stuck ở 0%',
            'Một số records bị skip',
            'Encoding error với tiếng Việt'
        ],
        causes: [
            'File format không đúng',
            'Encoding không phải UTF-8',
            'Missing required fields',
            'Data validation errors',
            'File size quá lớn'
        ],
        solutions: [
            {
                step: 1,
                description: 'Kiểm tra file format và encoding',
                tip: 'File phải là UTF-8 encoding. Sử dụng Notepad++ để check encoding'
            },
            {
                step: 2,
                description: 'Validate file structure',
                code: 'head -5 file.csv # Xem 5 dòng đầu để check format'
            },
            {
                step: 3,
                description: 'Kiểm tra required fields',
                tip: 'Đảm bảo tất cả required fields có trong file'
            },
            {
                step: 4,
                description: 'Split file lớn thành nhiều file nhỏ',
                tip: 'Giới hạn mỗi file < 1000 records để tránh timeout'
            },
            {
                step: 5,
                description: 'Test với file sample nhỏ trước',
                warning: 'Luôn backup dữ liệu trước khi import'
            }
        ],
        severity: 'medium',
        category: 'import',
        tags: ['import', 'csv', 'json', 'encoding', 'validation'],
        lastUpdated: '2024-01-11'
    }
];

const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'authentication', label: 'Xác thực' },
    { value: 'performance', label: 'Hiệu suất' },
    { value: 'templates', label: 'Templates' },
    { value: 'backup', label: 'Backup' },
    { value: 'import', label: 'Import/Export' },
    { value: 'database', label: 'Database' },
    { value: 'server', label: 'Server' }
];

const severityLevels = [
    { value: 'all', label: 'Tất cả mức độ' },
    { value: 'critical', label: 'Nghiêm trọng' },
    { value: 'high', label: 'Cao' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'low', label: 'Thấp' }
];

interface TroubleshootingGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TroubleshootingGuide({ isOpen, onClose }: TroubleshootingGuideProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSeverity, setSelectedSeverity] = useState('all');
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const filteredItems = troubleshootingData.filter(item => {
        const matchesSearch = !searchQuery ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.symptoms.some(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;

        return matchesSearch && matchesCategory && matchesSeverity;
    });

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'high':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'medium':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'low':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <AlertTriangle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'medium':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'low':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'authentication':
                return <User className="w-4 h-4" />;
            case 'performance':
                return <RefreshCw className="w-4 h-4" />;
            case 'templates':
                return <FileText className="w-4 h-4" />;
            case 'backup':
                return <Database className="w-4 h-4" />;
            case 'import':
                return <ExternalLink className="w-4 h-4" />;
            case 'database':
                return <Database className="w-4 h-4" />;
            case 'server':
                return <Server className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Hướng dẫn khắc phục sự cố
                            </h2>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm sự cố, triệu chứng, hoặc giải pháp..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Chọn mức độ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {severityLevels.map(level => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Không tìm thấy sự cố phù hợp
                            </h3>
                            <p className="text-gray-600">
                                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredItems.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    {getSeverityIcon(item.severity)}
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                <p className="text-gray-600 mb-3">
                                                    {item.problem}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getSeverityColor(item.severity)}>
                                                        {item.severity === 'critical' ? 'Nghiêm trọng' :
                                                            item.severity === 'high' ? 'Cao' :
                                                                item.severity === 'medium' ? 'Trung bình' : 'Thấp'}
                                                    </Badge>
                                                    <Badge variant="outline" className="flex items-center space-x-1">
                                                        {getCategoryIcon(item.category)}
                                                        <span>{categories.find(c => c.value === item.category)?.label}</span>
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        Cập nhật: {item.lastUpdated}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedItem(
                                                    expandedItem === item.id ? null : item.id
                                                )}
                                                className="ml-4"
                                            >
                                                {expandedItem === item.id ? 'Thu gọn' : 'Xem chi tiết'}
                                            </Button>
                                        </div>

                                        {/* Expanded Content */}
                                        {expandedItem === item.id && (
                                            <div className="border-t border-gray-200 pt-6 space-y-6">
                                                {/* Symptoms */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">
                                                        🔍 Triệu chứng
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {item.symptoms.map((symptom, index) => (
                                                            <li key={index} className="flex items-start space-x-2">
                                                                <span className="text-red-500 mt-1">•</span>
                                                                <span className="text-gray-700">{symptom}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Causes */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">
                                                        🔧 Nguyên nhân có thể
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {item.causes.map((cause, index) => (
                                                            <li key={index} className="flex items-start space-x-2">
                                                                <span className="text-yellow-500 mt-1">•</span>
                                                                <span className="text-gray-700">{cause}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Solutions */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">
                                                        ✅ Cách khắc phục
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {item.solutions.map((solution) => (
                                                            <div key={solution.step} className="border-l-4 border-blue-200 pl-4">
                                                                <div className="flex items-start space-x-3">
                                                                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                                                                        {solution.step}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-gray-900 font-medium mb-2">
                                                                            {solution.description}
                                                                        </p>

                                                                        {solution.code && (
                                                                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-2">
                                                                                <code>{solution.code}</code>
                                                                            </pre>
                                                                        )}

                                                                        {solution.tip && (
                                                                            <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                                                                                <div className="flex items-start space-x-2">
                                                                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                                    <span className="text-green-800 text-sm">
                                                                                        <strong>Mẹo:</strong> {solution.tip}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {solution.warning && (
                                                                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                                                                <div className="flex items-start space-x-2">
                                                                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                                                    <span className="text-red-800 text-sm">
                                                                                        <strong>Cảnh báo:</strong> {solution.warning}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Related Issues */}
                                                {item.relatedIssues && item.relatedIssues.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-3">
                                                            🔗 Sự cố liên quan
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.relatedIssues.map((relatedId, index) => {
                                                                const relatedItem = troubleshootingData.find(i => i.id === relatedId);
                                                                return relatedItem ? (
                                                                    <Button
                                                                        key={index}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setExpandedItem(relatedId)}
                                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                    >
                                                                        {relatedItem.title}
                                                                    </Button>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div>
                            Hiển thị {filteredItems.length} sự cố trong tổng số {troubleshootingData.length}
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>Cần thêm trợ giúp?</span>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Liên hệ support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}