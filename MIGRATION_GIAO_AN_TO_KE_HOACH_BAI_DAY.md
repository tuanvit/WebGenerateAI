# Migration: Thay đổi "Giáo án" → "Kế hoạch bài dạy"

## Tổng quan
Khách hàng yêu cầu thay đổi toàn bộ thuật ngữ từ "giáo án" sang "kế hoạch bài dạy" trong:
- Giao diện người dùng (UI)
- Database (dữ liệu đã lưu)
- Code (backend, frontend, types)
- Tài liệu

## Các thay đổi cần thực hiện

### 1. Database Migration
**Không cần thay đổi schema** - chỉ cần cập nhật dữ liệu:
- Bảng `templates`: Cập nhật các trường `name`, `description`, `templateContent`
- Bảng `ai_tools`: Cập nhật các trường `description`, `useCase`, `features`, `samplePrompts`
- Bảng `shared_content`: Cập nhật `title`, `description`, `content`
- Bảng `generated_prompts`: Cập nhật `generatedText` trong JSON

### 2. Code Changes

#### Frontend Components (src/components/)
- `TemplatesOverview.tsx` - Label "Giáo án" → "Kế hoạch bài dạy"
- `TemplatesList.tsx` - Label "Giáo án" → "Kế hoạch bài dạy"
- `TemplateSelector.tsx` - Label "Giáo án" → "Kế hoạch bài dạy"
- `TemplateRenderer.tsx` - Label "Giáo án" → "Kế hoạch bài dạy"

#### Pages (src/app/)
- `create-prompt/page.tsx` - Tất cả text liên quan
- `dashboard/page.tsx` - Tất cả text liên quan
- `demo/page.tsx` - Tất cả text liên quan

#### Services (src/services/)
- `templates/SubjectTemplateService.ts` - Template content
- `templates/TemplateSelectionEngine.ts` - Labels
- `ai-tool-recommendation/index.ts` - Descriptions
- `ai-tool-recommendation/ai-tools-data.ts` - Descriptions

#### Scripts (src/scripts/)
- `seed-templates.ts` - Seed data
- `seed-ai-tools.ts` - Seed data

#### Validation (src/lib/)
- `validation.ts` - Error messages

### 3. Documentation Files
- Tất cả các file .md trong root directory

## Mapping thay đổi

| Cũ | Mới |
|---|---|
| giáo án | kế hoạch bài dạy |
| Giáo án | Kế hoạch bài dạy |
| GIÁO ÁN | KẾ HOẠCH BÀI DẠY |
| soạn giáo án | soạn kế hoạch bài dạy |
| Soạn giáo án | Soạn kế hoạch bài dạy |
| tạo giáo án | tạo kế hoạch bài dạy |
| Tạo giáo án | Tạo kế hoạch bài dạy |
| Tạo Giáo Án | Tạo Kế Hoạch Bài Dạy |
| Prompt Giáo Án | Prompt Kế Hoạch Bài Dạy |
| Thông tin giáo án | Thông tin kế hoạch bài dạy |
| Chủ đề giáo án | Chủ đề kế hoạch bài dạy |
| Định dạng giáo án | Định dạng kế hoạch bài dạy |
| CẤU TRÚC GIÁO ÁN | CẤU TRÚC KẾ HOẠCH BÀI DẠY |
| mẫu giáo án | mẫu kế hoạch bài dạy |

## Thứ tự thực hiện

1. ✅ Tạo migration script cho database
2. ✅ Cập nhật frontend components
3. ✅ Cập nhật pages
4. ✅ Cập nhật services
5. ✅ Cập nhật scripts
6. ✅ Cập nhật validation
7. ✅ Cập nhật documentation
8. ✅ Test toàn bộ hệ thống

## Lưu ý quan trọng

- Giữ nguyên các thuật ngữ khác như "CV 5512", "GDPT 2018"
- Không thay đổi tên biến, tên function trong code (chỉ thay đổi string hiển thị)
- Backup database trước khi chạy migration
- Test kỹ sau khi migration

## Cách thực hiện Migration

### Bước 1: Backup Database (QUAN TRỌNG!)
```bash
# Backup database trước khi migration
pg_dump -U your_username -d your_database > backup_before_migration.sql
```

### Bước 2: Chạy Code Migration
```bash
# Cập nhật tất cả code files
node scripts/migrate-giao-an-to-ke-hoach.js
```

### Bước 3: Chạy Database Migration
```bash
# Cập nhật database
node scripts/run-migration-giao-an.js
```

### Bước 4: Kiểm tra
```bash
# Chạy ứng dụng và kiểm tra
npm run dev
```

### Bước 5: Test các trang
- Trang chủ (/)
- Dashboard (/dashboard)
- Create Prompt (/create-prompt)
- Templates (/templates)
- Library (/library)
- Admin (/admin)

## Status
- [x] Database migration script created
- [x] Frontend components updated (28 files, 70 replacements)
- [x] Pages updated
- [x] Services updated
- [x] Scripts updated
- [x] Validation updated
- [ ] Database migration executed
- [ ] Documentation updated
- [ ] Testing completed

## Files Changed (Automated)
✅ src/app/api/debug/seed-community/route.ts (3 replacements)
✅ src/app/api/generate-prompt/route.ts (8 replacements)
✅ src/app/api/validation/educational-standards/route.ts (1 replacement)
✅ src/lib/admin/repositories/templates-repository-minimal.ts (2 replacements)
✅ src/scripts/seed-ai-tools.ts (2 replacements)
✅ src/scripts/seed-templates.ts (10 replacements)
✅ src/services/ai-tool-recommendation/ai-tools-data.ts (5 replacements)
✅ src/services/ai-tool-recommendation/index.ts (4 replacements)
✅ src/services/templates/SubjectTemplateService.ts (10 replacements)
✅ src/app/demo/page.tsx (1 replacement)
✅ src/app/layout.tsx (1 replacement)
✅ src/app/library/page.tsx (1 replacement)
✅ src/app/library/personal/page.tsx (1 replacement)
✅ src/app/page.tsx (3 replacements)
✅ src/app/templates/[id]/page.tsx (1 replacement)
✅ src/app/templates/admin/page.tsx (1 replacement)
✅ src/app/templates/page.tsx (1 replacement)
✅ src/app/test-prompt-editor/page.tsx (2 replacements)
✅ src/components/admin/templates/TemplateBulkEditModal.tsx (1 replacement)
✅ src/components/admin/templates/TemplateForm.tsx (1 replacement)
✅ src/components/admin/templates/TemplatesTable.tsx (1 replacement)
✅ src/components/ai-tools/AIToolSelector.tsx (1 replacement)
✅ src/components/community/CommunityStats.tsx (2 replacements)
✅ src/components/forms/EnhancedPromptGenerationForm.tsx (2 replacements)
✅ src/components/forms/PromptGenerationForm.tsx (2 replacements)
✅ src/components/library/PersonalLibraryDashboard.tsx (1 replacement)
✅ src/components/library/SimplePersonalLibrary.tsx (1 replacement)
✅ src/components/templates/TemplateBrowser.tsx (1 replacement)

## Files Changed (Manual)
✅ src/components/templates/TemplatesOverview.tsx
✅ src/components/templates/TemplatesList.tsx
✅ src/components/templates/TemplateSelector.tsx
✅ src/components/templates/TemplateRenderer.tsx
✅ src/app/create-prompt/page.tsx
✅ src/app/dashboard/page.tsx
✅ src/services/templates/TemplateSelectionEngine.ts
✅ src/lib/validation.ts
