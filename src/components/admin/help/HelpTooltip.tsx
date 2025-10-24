"use client"

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpTooltipProps {
    content: string;
    title?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
    trigger?: 'hover' | 'click';
    className?: string;
}

export default function HelpTooltip({
    content,
    title,
    position = 'top',
    size = 'md',
    trigger = 'hover',
    className = ''
}: HelpTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState(position);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Calculate optimal position based on viewport
    useEffect(() => {
        if (isVisible && tooltipRef.current && triggerRef.current) {
            const tooltip = tooltipRef.current;
            const trigger = triggerRef.current;
            const rect = trigger.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let newPosition = position;

            // Check if tooltip goes outside viewport and adjust
            if (position === 'top' && rect.top - tooltipRect.height < 10) {
                newPosition = 'bottom';
            } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight - 10) {
                newPosition = 'top';
            } else if (position === 'left' && rect.left - tooltipRect.width < 10) {
                newPosition = 'right';
            } else if (position === 'right' && rect.right + tooltipRect.width > window.innerWidth - 10) {
                newPosition = 'left';
            }

            setActualPosition(newPosition);
        }
    }, [isVisible, position]);

    // Close tooltip when clicking outside
    useEffect(() => {
        if (trigger === 'click' && isVisible) {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    tooltipRef.current &&
                    triggerRef.current &&
                    !tooltipRef.current.contains(event.target as Node) &&
                    !triggerRef.current.contains(event.target as Node)
                ) {
                    setIsVisible(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isVisible, trigger]);

    const handleTrigger = () => {
        if (trigger === 'click') {
            setIsVisible(!isVisible);
        }
    };

    const handleMouseEnter = () => {
        if (trigger === 'hover') {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (trigger === 'hover') {
            setIsVisible(false);
        }
    };

    const getTooltipClasses = () => {
        const baseClasses = `
            absolute z-50 bg-gray-900 text-white text-sm rounded-lg shadow-lg
            transition-opacity duration-200 pointer-events-auto
            ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `;

        const sizeClasses = {
            sm: 'p-2 max-w-xs',
            md: 'p-3 max-w-sm',
            lg: 'p-4 max-w-md'
        };

        const positionClasses = {
            top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
            bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
            left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
            right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
        };

        return `${baseClasses} ${sizeClasses[size]} ${positionClasses[actualPosition]}`;
    };

    const getArrowClasses = () => {
        const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';

        const arrowPositions = {
            top: 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2',
            bottom: 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2',
            left: 'left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2',
            right: 'right-full top-1/2 transform -translate-y-1/2 translate-x-1/2'
        };

        return `${baseClasses} ${arrowPositions[actualPosition]}`;
    };

    return (
        <div className={`relative inline-block ${className}`}>
            <Button
                ref={triggerRef}
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-gray-400 hover:text-gray-600 transition-colors"
                onClick={handleTrigger}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Trợ giúp"
            >
                <HelpCircle className="w-4 h-4" />
            </Button>

            <div
                ref={tooltipRef}
                className={getTooltipClasses()}
                role="tooltip"
            >
                {/* Arrow */}
                <div className={getArrowClasses()} />

                {/* Content */}
                <div>
                    {title && (
                        <div className="font-semibold mb-1 text-white">
                            {title}
                        </div>
                    )}
                    <div className="text-gray-200 leading-relaxed">
                        {content}
                    </div>
                </div>

                {/* Close button for click trigger */}
                {trigger === 'click' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 p-1 h-auto text-gray-400 hover:text-white"
                        onClick={() => setIsVisible(false)}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// Predefined help tooltips for common admin operations
export const AdminHelpTooltips = {
    // AI Tools
    aiToolCategory: {
        title: "Danh mục AI Tool",
        content: "Chọn danh mục phù hợp: TEXT_GENERATION (ChatGPT, Gemini), PRESENTATION (Canva AI, Gamma), IMAGE (Leonardo AI), VIDEO (HeyGen, Synthesia), SIMULATION (PhET, Labster), ASSESSMENT (Quizizz AI, Kahoot), DATA_ANALYSIS (Google Earth, Flourish)"
    },
    aiToolSubjects: {
        title: "Môn học",
        content: "Chọn các môn học mà AI tool này hỗ trợ: Toán, Văn, Khoa học tự nhiên, Lịch sử & Địa lí, Giáo dục công dân, Công nghệ"
    },
    aiToolGradeLevels: {
        title: "Lớp học",
        content: "Chọn các lớp phù hợp từ 6-9. Có thể chọn nhiều lớp nếu tool phù hợp với nhiều cấp độ"
    },
    aiToolVietnameseSupport: {
        title: "Hỗ trợ tiếng Việt",
        content: "Đánh dấu nếu AI tool có thể hiểu và phản hồi bằng tiếng Việt một cách chính xác"
    },
    aiToolDifficulty: {
        title: "Độ khó sử dụng",
        content: "Beginner: Dễ sử dụng, không cần kinh nghiệm. Intermediate: Cần một ít kinh nghiệm. Advanced: Cần kinh nghiệm và kỹ năng cao"
    },
    aiToolPricingModel: {
        title: "Mô hình giá",
        content: "Free: Hoàn toàn miễn phí. Freemium: Có phiên bản miễn phí và trả phí. Paid: Chỉ có phiên bản trả phí"
    },

    // Templates
    templateVariables: {
        title: "Biến Template",
        content: "Sử dụng cú pháp {{ten_bien}} trong nội dung template. Tên biến không được có dấu cách, sử dụng gạch dưới thay thế"
    },
    templateExamples: {
        title: "Ví dụ Template",
        content: "Thêm ví dụ cụ thể để người dùng hiểu cách sử dụng template. Bao gồm dữ liệu mẫu và kết quả mong đợi"
    },
    templateOutputType: {
        title: "Loại đầu ra",
        content: "Lesson-plan: Kế hoạch bài dạy. Presentation: Bài thuyết trình. Assessment: Đánh giá, kiểm tra. Interactive: Hoạt động tương tác. Research: Nghiên cứu, tìm hiểu"
    },
    templateCompliance: {
        title: "Tuân thủ chuẩn",
        content: "Đảm bảo template tuân thủ GDPT 2018 (Chương trình Giáo dục phổ thông 2018) và CV 5512 (Thông tư 5512)"
    },

    // Dashboard
    dashboardStats: {
        title: "Thống kê hệ thống",
        content: "Hiển thị tổng quan về số lượng AI tools, templates, người dùng hoạt động và các chỉ số quan trọng khác"
    },
    dashboardActivity: {
        title: "Hoạt động gần đây",
        content: "Theo dõi các hoạt động mới nhất của người dùng và admin trong hệ thống"
    },
    dashboardHealth: {
        title: "Tình trạng hệ thống",
        content: "Kiểm tra tình trạng hoạt động của database, API, và các dịch vụ quan trọng khác"
    },

    // Backup
    backupSchedule: {
        title: "Lịch sao lưu",
        content: "Thiết lập sao lưu tự động hàng ngày, hàng tuần hoặc hàng tháng. Khuyến nghị sao lưu hàng ngày cho dữ liệu quan trọng"
    },
    backupRetention: {
        title: "Thời gian lưu trữ",
        content: "Số ngày lưu trữ backup trước khi tự động xóa. Khuyến nghị 30 ngày cho backup hàng ngày, 90 ngày cho backup hàng tuần"
    },
    backupRestore: {
        title: "Khôi phục dữ liệu",
        content: "Chọn backup cần khôi phục và xác nhận. Quá trình này sẽ ghi đè dữ liệu hiện tại, hãy cẩn thận"
    }
};