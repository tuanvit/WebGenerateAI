-- Migration: Thay đổi "giáo án" thành "kế hoạch bài dạy"
-- Date: 2025-10-26
-- Description: Cập nhật tất cả các text trong database từ "giáo án" sang "kế hoạch bài dạy"

-- 1. Cập nhật bảng templates
UPDATE templates 
SET name = REPLACE(REPLACE(REPLACE(name, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE name LIKE '%giáo án%' OR name LIKE '%Giáo án%' OR name LIKE '%GIÁO ÁN%';

UPDATE templates 
SET description = REPLACE(REPLACE(REPLACE(description, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE description LIKE '%giáo án%' OR description LIKE '%Giáo án%' OR description LIKE '%GIÁO ÁN%';

UPDATE templates 
SET "templateContent" = REPLACE(REPLACE(REPLACE("templateContent", 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE "templateContent" LIKE '%giáo án%' OR "templateContent" LIKE '%Giáo án%' OR "templateContent" LIKE '%GIÁO ÁN%';

-- 2. Cập nhật bảng ai_tools
UPDATE ai_tools 
SET description = REPLACE(REPLACE(REPLACE(description, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE description LIKE '%giáo án%' OR description LIKE '%Giáo án%' OR description LIKE '%GIÁO ÁN%';

UPDATE ai_tools 
SET "useCase" = REPLACE(REPLACE(REPLACE("useCase", 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE "useCase" LIKE '%giáo án%' OR "useCase" LIKE '%Giáo án%' OR "useCase" LIKE '%GIÁO ÁN%';

UPDATE ai_tools 
SET features = REPLACE(REPLACE(REPLACE(features, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE features LIKE '%giáo án%' OR features LIKE '%Giáo án%' OR features LIKE '%GIÁO ÁN%';

UPDATE ai_tools 
SET "samplePrompts" = REPLACE(REPLACE(REPLACE("samplePrompts", 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE "samplePrompts" LIKE '%giáo án%' OR "samplePrompts" LIKE '%Giáo án%' OR "samplePrompts" LIKE '%GIÁO ÁN%';

-- 3. Cập nhật bảng shared_content
UPDATE shared_content 
SET title = REPLACE(REPLACE(REPLACE(title, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE title LIKE '%giáo án%' OR title LIKE '%Giáo án%' OR title LIKE '%GIÁO ÁN%';

UPDATE shared_content 
SET description = REPLACE(REPLACE(REPLACE(description, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE description LIKE '%giáo án%' OR description LIKE '%Giáo án%' OR description LIKE '%GIÁO ÁN%';

UPDATE shared_content 
SET content = REPLACE(REPLACE(REPLACE(content, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE content LIKE '%giáo án%' OR content LIKE '%Giáo án%' OR content LIKE '%GIÁO ÁN%';

-- 4. Cập nhật bảng generated_prompts
UPDATE generated_prompts 
SET "generatedText" = REPLACE(REPLACE(REPLACE("generatedText", 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE "generatedText" LIKE '%giáo án%' OR "generatedText" LIKE '%Giáo án%' OR "generatedText" LIKE '%GIÁO ÁN%';

-- 5. Cập nhật bảng template_examples
UPDATE template_examples 
SET title = REPLACE(REPLACE(REPLACE(title, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE title LIKE '%giáo án%' OR title LIKE '%Giáo án%' OR title LIKE '%GIÁO ÁN%';

UPDATE template_examples 
SET description = REPLACE(REPLACE(REPLACE(description, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE description LIKE '%giáo án%' OR description LIKE '%Giáo án%' OR description LIKE '%GIÁO ÁN%';

UPDATE template_examples 
SET "expectedOutput" = REPLACE(REPLACE(REPLACE("expectedOutput", 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE "expectedOutput" LIKE '%giáo án%' OR "expectedOutput" LIKE '%Giáo án%' OR "expectedOutput" LIKE '%GIÁO ÁN%';

-- 6. Cập nhật bảng prompt_versions
UPDATE prompt_versions 
SET content = REPLACE(REPLACE(REPLACE(content, 'giáo án', 'kế hoạch bài dạy'), 'Giáo án', 'Kế hoạch bài dạy'), 'GIÁO ÁN', 'KẾ HOẠCH BÀI DẠY')
WHERE content LIKE '%giáo án%' OR content LIKE '%Giáo án%' OR content LIKE '%GIÁO ÁN%';
