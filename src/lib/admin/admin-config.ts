/**
 * Admin system configuration
 * Centralized configuration for admin features and limits
 */

export const adminConfig = {
    // File upload limits
    maxFileUploadSize: parseInt(process.env.MAX_FILE_UPLOAD_SIZE || '10485760'), // 10MB in bytes
    allowedFileTypes: ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    allowedFileExtensions: ['.json', '.csv', '.xlsx'],

    // Backup and retention
    backupRetentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90'),

    // Pagination limits
    defaultPageSize: 20,
    maxPageSize: 100,

    // Bulk operation limits
    maxBulkOperationSize: 1000,
    bulkOperationBatchSize: 100,

    // Cache settings
    cacheTimeout: 300, // 5 minutes in seconds

    // Rate limiting
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes in milliseconds
    rateLimitMax: 100, // max requests per window

    // Admin dashboard
    dashboardRefreshInterval: 30000, // 30 seconds in milliseconds
    recentActivityLimit: 10,

    // Validation limits
    maxAIToolNameLength: 100,
    maxAIToolDescriptionLength: 1000,
    maxAIToolUseCaseLength: 500,
    maxAIToolFeaturesCount: 20,
    maxAIToolSamplePromptsCount: 10,
    maxAIToolRelatedToolsCount: 10,

    maxTemplateNameLength: 100,
    maxTemplateDescriptionLength: 1000,
    maxTemplateContentLength: 10000,
    maxTemplateVariablesCount: 50,
    maxTemplateExamplesCount: 10,
    maxTemplateTagsCount: 20,

    // Vietnamese education system constants
    validSubjects: [
        'Toán',
        'Văn',
        'Khoa học tự nhiên',
        'Lịch sử & Địa lí',
        'Giáo dục công dân',
        'Công nghệ'
    ],

    validGradeLevels: [6, 7, 8, 9],

    validAIToolCategories: [
        'TEXT_GENERATION',
        'PRESENTATION',
        'IMAGE',
        'VIDEO',
        'SIMULATION',
        'ASSESSMENT',
        'DATA_ANALYSIS'
    ],

    validDifficultyLevels: ['beginner', 'intermediate', 'advanced'],

    validPricingModels: ['free', 'freemium', 'paid'],

    validTemplateOutputTypes: [
        'lesson-plan',
        'presentation',
        'assessment',
        'interactive',
        'research'
    ],

    validTemplateVariableTypes: [
        'text',
        'textarea',
        'select',
        'multiselect'
    ],

    // Compliance standards
    complianceStandards: [
        'GDPT 2018',
        'CV 5512',
        'Thông tư 32/2020/TT-BGDĐT'
    ],

    // Default values
    defaults: {
        aiTool: {
            vietnameseSupport: false,
            difficulty: 'beginner' as const,
            pricingModel: 'freemium' as const,
            features: [],
            samplePrompts: [],
            relatedTools: []
        },
        template: {
            difficulty: 'beginner' as const,
            outputType: 'lesson-plan' as const,
            tags: [],
            compliance: ['GDPT 2018', 'CV 5512'],
            variables: [],
            examples: []
        }
    },

    // Error messages
    errorMessages: {
        fileUpload: {
            tooLarge: 'File quá lớn. Kích thước tối đa là 10MB',
            invalidType: 'Định dạng file không được hỗ trợ. Chỉ chấp nhận JSON, CSV, và Excel',
            uploadFailed: 'Tải file lên thất bại. Vui lòng thử lại'
        },
        bulkOperation: {
            tooManyItems: `Không thể xử lý quá ${1000} mục cùng lúc`,
            noItemsSelected: 'Vui lòng chọn ít nhất một mục',
            operationFailed: 'Thao tác hàng loạt thất bại'
        },
        validation: {
            required: 'Trường này là bắt buộc',
            tooLong: 'Nội dung quá dài',
            tooShort: 'Nội dung quá ngắn',
            invalidFormat: 'Định dạng không hợp lệ',
            invalidChoice: 'Lựa chọn không hợp lệ'
        }
    },

    // Success messages
    successMessages: {
        aiTool: {
            created: 'Tạo công cụ AI thành công',
            updated: 'Cập nhật công cụ AI thành công',
            deleted: 'Xóa công cụ AI thành công',
            bulkUpdated: 'Cập nhật hàng loạt thành công',
            bulkDeleted: 'Xóa hàng loạt thành công',
            imported: 'Import dữ liệu thành công',
            exported: 'Export dữ liệu thành công'
        },
        template: {
            created: 'Tạo template thành công',
            updated: 'Cập nhật template thành công',
            deleted: 'Xóa template thành công',
            bulkUpdated: 'Cập nhật hàng loạt thành công',
            bulkDeleted: 'Xóa hàng loạt thành công',
            imported: 'Import template thành công',
            exported: 'Export template thành công'
        },
        system: {
            backupCreated: 'Tạo backup thành công',
            dataRestored: 'Khôi phục dữ liệu thành công',
            cacheCleared: 'Xóa cache thành công'
        }
    }
};

export type AdminConfig = typeof adminConfig;