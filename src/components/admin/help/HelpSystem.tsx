"use client"

import { useState, useEffect } from 'react';
import {
    HelpCircle,
    Book,
    MessageCircle,
    Search,
    ChevronRight,
    X,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HelpSystemProps {
    isOpen: boolean;
    onClose: () => void;
    currentSection?: string;
}

interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: 'guide' | 'faq' | 'troubleshooting';
    section?: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
}

interface TroubleshootingItem {
    id: string;
    problem: string;
    solution: string;
    severity: 'low' | 'medium' | 'high';
    category: string;
}

const helpArticles: HelpArticle[] = [
    {
        id: 'getting-started',
        title: 'Bắt đầu với Admin Panel',
        content: `
# Chào mừng đến với Admin Panel

Admin Panel cho phép bạn quản lý toàn bộ hệ thống AI Tools và Templates một cách dễ dàng.

## Các tính năng chính:

### 1. Dashboard (Tổng quan)
- Xem thống kê tổng quan về AI Tools và Templates
- Theo dõi hoạt động gần đây của hệ thống
- Kiểm tra tình trạng sức khỏe hệ thống

### 2. Quản lý AI Tools
- Thêm, sửa, xóa các công cụ AI
- Quản lý 40+ công cụ AI hiện có
- Phân loại theo danh mục và môn học
- Hỗ trợ thao tác hàng loạt

### 3. Quản lý Templates
- Tạo và chỉnh sửa mẫu prompt
- Quản lý biến và ví dụ template
- Xem trước template trước khi lưu

### 4. Backup & Restore
- Sao lưu dữ liệu tự động và thủ công
- Khôi phục dữ liệu từ backup
- Xuất/nhập dữ liệu

## Bắt đầu sử dụng:

1. **Đăng nhập**: Sử dụng tài khoản admin để truy cập
2. **Khám phá Dashboard**: Xem tổng quan hệ thống
3. **Quản lý dữ liệu**: Bắt đầu với AI Tools hoặc Templates
4. **Sao lưu**: Thiết lập backup tự động
        `,
        category: 'guide',
        tags: ['getting-started', 'overview', 'basics'],
        difficulty: 'beginner'
    },
    {
        id: 'ai-tools-management',
        title: 'Quản lý AI Tools',
        content: `
# Quản lý AI Tools

Hướng dẫn chi tiết cách quản lý 40+ công cụ AI trong hệ thống.

## Thêm AI Tool mới

1. **Truy cập trang AI Tools**: Nhấp vào "AI Tools" trong menu bên trái
2. **Nhấp "Thêm AI Tool"**: Nút màu xanh ở góc trên bên phải
3. **Điền thông tin**:
   - **Tên**: Tên công cụ AI (bắt buộc)
   - **Mô tả**: Mô tả chi tiết về công cụ
   - **URL**: Đường dẫn đến công cụ
   - **Danh mục**: Chọn từ 7 danh mục có sẵn
   - **Môn học**: Chọn các môn học phù hợp
   - **Lớp**: Chọn lớp 6-9
   - **Hỗ trợ tiếng Việt**: Đánh dấu nếu có
   - **Độ khó**: Beginner/Intermediate/Advanced
   - **Tính năng**: Danh sách các tính năng chính
   - **Mô hình giá**: Free/Freemium/Paid

## Chỉnh sửa AI Tool

1. **Tìm công cụ**: Sử dụng tìm kiếm hoặc lọc
2. **Nhấp biểu tượng chỉnh sửa**: Biểu tượng bút chì
3. **Cập nhật thông tin**: Thay đổi các trường cần thiết
4. **Lưu**: Nhấp "Cập nhật AI Tool"

## Xóa AI Tool

1. **Chọn công cụ**: Đánh dấu checkbox
2. **Nhấp "Xóa"**: Nút màu đỏ
3. **Xác nhận**: Nhấp "Xác nhận xóa" trong hộp thoại

## Thao tác hàng loạt

### Chỉnh sửa hàng loạt:
1. Chọn nhiều AI Tools bằng checkbox
2. Nhấp "Chỉnh sửa hàng loạt"
3. Thay đổi các thuộc tính chung
4. Áp dụng cho tất cả

### Xuất dữ liệu:
1. Chọn AI Tools cần xuất
2. Nhấp "Xuất"
3. Chọn định dạng (JSON/CSV)
4. Tải file về

### Nhập dữ liệu:
1. Nhấp "Nhập"
2. Chọn file JSON/CSV
3. Xem trước dữ liệu
4. Xác nhận nhập
        `,
        category: 'guide',
        section: 'ai-tools',
        tags: ['ai-tools', 'crud', 'bulk-operations'],
        difficulty: 'intermediate'
    },
    {
        id: 'templates-management',
        title: 'Quản lý Templates',
        content: `
# Quản lý Templates

Hướng dẫn tạo và quản lý mẫu prompt cho giáo dục.

## Tạo Template mới

1. **Truy cập Templates**: Nhấp "Templates" trong menu
2. **Nhấp "Tạo Template"**: Nút xanh ở góc trên
3. **Điền thông tin cơ bản**:
   - **Tên**: Tên template (bắt buộc)
   - **Mô tả**: Mô tả mục đích sử dụng
   - **Môn học**: Chọn môn học phù hợp
   - **Lớp**: Chọn lớp 6-9
   - **Loại đầu ra**: Lesson plan/Presentation/Assessment...

## Tạo nội dung Template

### Sử dụng biến:
- Biến được đặt trong dấu ngoặc nhọn: \`{{ten_bien}}\`
- Ví dụ: \`Tạo bài giảng về {{chu_de}} cho lớp {{lop}}\`

### Thêm biến:
1. Nhấp "Thêm biến"
2. Điền thông tin biến:
   - **Tên**: Tên biến (không dấu, gạch dưới)
   - **Nhãn**: Tên hiển thị
   - **Mô tả**: Hướng dẫn sử dụng
   - **Loại**: Text/Number/Select/Textarea
   - **Bắt buộc**: Có/Không
   - **Giá trị mặc định**: Nếu có

### Thêm ví dụ:
1. Nhấp "Thêm ví dụ"
2. Điền:
   - **Tiêu đề**: Tên ví dụ
   - **Mô tả**: Mô tả tình huống
   - **Dữ liệu mẫu**: Giá trị cho các biến
   - **Kết quả mong đợi**: Kết quả sau khi áp dụng

## Xem trước Template

1. **Nhấp "Xem trước"**: Trong form chỉnh sửa
2. **Điền giá trị biến**: Nhập dữ liệu thử nghiệm
3. **Xem kết quả**: Template được render với dữ liệu thực

## Quản lý Template

### Sao chép Template:
1. Tìm template cần sao chép
2. Nhấp biểu tượng sao chép
3. Chỉnh sửa thông tin mới
4. Lưu template mới

### Xuất Template:
1. Chọn templates cần xuất
2. Nhấp "Xuất"
3. Chọn định dạng
4. Tải về máy
        `,
        category: 'guide',
        section: 'templates',
        tags: ['templates', 'variables', 'examples'],
        difficulty: 'intermediate'
    }
];

const faqItems: FAQItem[] = [
    {
        id: 'faq-1',
        question: 'Làm thế nào để thêm AI Tool mới?',
        answer: 'Truy cập trang AI Tools, nhấp nút "Thêm AI Tool", điền đầy đủ thông tin và nhấp "Lưu". Đảm bảo điền đúng URL và chọn đúng danh mục.',
        category: 'ai-tools',
        tags: ['add', 'create', 'ai-tools']
    },
    {
        id: 'faq-2',
        question: 'Tại sao không thể xóa AI Tool?',
        answer: 'Có thể do AI Tool đang được sử dụng trong templates hoặc bạn không có quyền xóa. Kiểm tra quyền admin và đảm bảo không có dependencies.',
        category: 'ai-tools',
        tags: ['delete', 'permissions', 'dependencies']
    },
    {
        id: 'faq-3',
        question: 'Template variables hoạt động như thế nào?',
        answer: 'Variables được đặt trong dấu {{}} và sẽ được thay thế bằng giá trị thực khi render. Ví dụ: {{chu_de}} sẽ được thay bằng chủ đề cụ thể.',
        category: 'templates',
        tags: ['variables', 'syntax', 'templates']
    },
    {
        id: 'faq-4',
        question: 'Làm sao để backup dữ liệu?',
        answer: 'Truy cập trang Backup & Restore, chọn "Tạo backup mới", chọn dữ liệu cần backup và nhấp "Tạo backup". Hệ thống cũng có backup tự động hàng ngày.',
        category: 'backup',
        tags: ['backup', 'export', 'data']
    },
    {
        id: 'faq-5',
        question: 'Tại sao dashboard không hiển thị dữ liệu?',
        answer: 'Kiểm tra kết nối internet và quyền truy cập. Nếu vẫn không được, thử refresh trang hoặc liên hệ admin hệ thống.',
        category: 'dashboard',
        tags: ['dashboard', 'data', 'loading']
    }
];

const troubleshootingItems: TroubleshootingItem[] = [
    {
        id: 'trouble-1',
        problem: 'Không thể đăng nhập vào admin panel',
        solution: 'Kiểm tra: 1) Tài khoản có role admin, 2) Mật khẩu đúng, 3) Session chưa hết hạn. Thử đăng xuất và đăng nhập lại.',
        severity: 'high',
        category: 'authentication'
    },
    {
        id: 'trouble-2',
        problem: 'Lỗi "500 Internal Server Error" khi lưu dữ liệu',
        solution: 'Kiểm tra: 1) Kết nối database, 2) Dữ liệu nhập có hợp lệ, 3) Dung lượng storage. Thử lại sau vài phút.',
        severity: 'high',
        category: 'server'
    },
    {
        id: 'trouble-3',
        problem: 'Template không render đúng variables',
        solution: 'Kiểm tra: 1) Syntax {{variable_name}} đúng, 2) Tên biến không có dấu cách, 3) Biến đã được định nghĩa trong form.',
        severity: 'medium',
        category: 'templates'
    },
    {
        id: 'trouble-4',
        problem: 'Import file CSV/JSON thất bại',
        solution: 'Kiểm tra: 1) Format file đúng, 2) Encoding UTF-8, 3) Dữ liệu hợp lệ, 4) Kích thước file < 10MB.',
        severity: 'medium',
        category: 'import'
    },
    {
        id: 'trouble-5',
        problem: 'Dashboard loading chậm',
        solution: 'Thử: 1) Refresh trang, 2) Clear browser cache, 3) Kiểm tra kết nối mạng, 4) Đợi trong giờ ít traffic.',
        severity: 'low',
        category: 'performance'
    }
];

export default function HelpSystem({ isOpen, onClose, currentSection }: HelpSystemProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('guide');
    const [filteredArticles, setFilteredArticles] = useState(helpArticles);
    const [filteredFAQs, setFilteredFAQs] = useState(faqItems);
    const [filteredTroubleshooting, setFilteredTroubleshooting] = useState(troubleshootingItems);

    // Filter content based on search query
    useEffect(() => {
        if (!searchQuery) {
            setFilteredArticles(helpArticles);
            setFilteredFAQs(faqItems);
            setFilteredTroubleshooting(troubleshootingItems);
            return;
        }

        const query = searchQuery.toLowerCase();

        setFilteredArticles(
            helpArticles.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query) ||
                article.tags.some(tag => tag.toLowerCase().includes(query))
            )
        );

        setFilteredFAQs(
            faqItems.filter(faq =>
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query) ||
                faq.tags.some(tag => tag.toLowerCase().includes(query))
            )
        );

        setFilteredTroubleshooting(
            troubleshootingItems.filter(item =>
                item.problem.toLowerCase().includes(query) ||
                item.solution.toLowerCase().includes(query)
            )
        );
    }, [searchQuery]);

    // Auto-focus on current section
    useEffect(() => {
        if (currentSection && isOpen) {
            const sectionArticles = helpArticles.filter(article => article.section === currentSection);
            if (sectionArticles.length > 0) {
                setActiveTab('guide');
            }
        }
    }, [currentSection, isOpen]);

    if (!isOpen) return null;

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'medium':
                return <Info className="w-4 h-4 text-yellow-500" />;
            case 'low':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-800';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Trung tâm trợ giúp
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm hướng dẫn, FAQ, hoặc giải pháp..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
                            <TabsTrigger value="guide" className="flex items-center space-x-2">
                                <Book className="w-4 h-4" />
                                <span>Hướng dẫn</span>
                            </TabsTrigger>
                            <TabsTrigger value="faq" className="flex items-center space-x-2">
                                <MessageCircle className="w-4 h-4" />
                                <span>FAQ</span>
                            </TabsTrigger>
                            <TabsTrigger value="troubleshooting" className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Khắc phục sự cố</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto p-6">
                            <TabsContent value="guide" className="space-y-4 mt-0">
                                {filteredArticles.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Không tìm thấy hướng dẫn nào phù hợp
                                    </div>
                                ) : (
                                    filteredArticles.map((article) => (
                                        <Card key={article.id} className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        {article.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={getDifficultyColor(article.difficulty)}>
                                                            {article.difficulty}
                                                        </Badge>
                                                        {article.section && (
                                                            <Badge variant="outline">
                                                                {article.section}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="prose prose-sm max-w-none text-gray-600">
                                                <div dangerouslySetInnerHTML={{
                                                    __html: article.content
                                                        .replace(/\n/g, '<br>')
                                                        .replace(/#{1,6}\s(.+)/g, '<strong>$1</strong>')
                                                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                                        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
                                                }} />
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="faq" className="space-y-4 mt-0">
                                {filteredFAQs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Không tìm thấy câu hỏi nào phù hợp
                                    </div>
                                ) : (
                                    filteredFAQs.map((faq) => (
                                        <Card key={faq.id} className="p-6">
                                            <div className="mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {faq.question}
                                                </h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {faq.category}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="troubleshooting" className="space-y-4 mt-0">
                                {filteredTroubleshooting.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Không tìm thấy giải pháp nào phù hợp
                                    </div>
                                ) : (
                                    filteredTroubleshooting.map((item) => (
                                        <Card key={item.id} className="p-6">
                                            <div className="flex items-start space-x-3 mb-4">
                                                {getSeverityIcon(item.severity)}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        {item.problem}
                                                    </h3>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge
                                                            variant={item.severity === 'high' ? 'destructive' :
                                                                item.severity === 'medium' ? 'default' : 'secondary'}
                                                        >
                                                            {item.severity === 'high' ? 'Nghiêm trọng' :
                                                                item.severity === 'medium' ? 'Trung bình' : 'Thấp'}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {item.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-7">
                                                <h4 className="font-medium text-gray-900 mb-2">Giải pháp:</h4>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {item.solution}
                                                </p>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div>
                            Cần thêm trợ giúp? Liên hệ admin hệ thống
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Tài liệu kỹ thuật
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}