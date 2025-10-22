# Requirements Document

## Introduction

Hệ thống AI Prompt Generator for Teachers là một ứng dụng web được thiết kế để hỗ trợ giáo viên Việt Nam chuyển đổi các yêu cầu sư phạm cụ thể thành các prompt AI chuyên nghiệp, tối ưu hóa để tạo ra giáo án/kế hoạch bài dạy và nội dung thuyết trình theo chuẩn Chương trình Giáo dục Phổ thông 2018 và Công văn 5512.

## Glossary

- **AI_Prompt_System**: Hệ thống chuyển đổi yêu cầu sư phạm thành prompt AI
- **Teacher_User**: Người dùng là giáo viên sử dụng hệ thống
- **Lesson_Plan**: Giáo án/Kế hoạch bài dạy theo chuẩn Công văn 5512
- **Presentation_Outline**: Dàn ý slide thuyết trình
- **Target_AI_Tool**: Công cụ AI đích được phân loại theo mục đích sử dụng
- **AI_Tool_Category**: Phân loại công cụ AI (text-generation, presentation, video, simulation, image, data-analysis, assessment, subject-specific)
- **Subject_Specific_Tools**: Công cụ AI chuyên biệt cho từng môn học (GeoGebra cho Toán, Google Earth cho Địa lý, PhET cho Khoa học tự nhiên)
- **GDPT_2018**: Chương trình Giáo dục Phổ thông 2018
- **CV_5512**: Công văn 5512 về xây dựng kế hoạch bài dạy
- **AI_Library**: Thư viện chia sẻ prompt và giáo án của cộng đồng

## Requirements

### Requirement 1

**User Story:** As a Teacher_User, I want to input my pedagogical requirements and receive a professional AI prompt, so that I can generate lesson plans efficiently using AI tools.

#### Acceptance Criteria

1. WHEN Teacher_User provides subject, grade level, lesson name, pedagogical standard, and desired output format, THE AI_Prompt_System SHALL generate a complete AI prompt optimized for the specified Target_AI_Tool
2. THE AI_Prompt_System SHALL include role definition, clear goals, format constraints, and context limits in every generated prompt
3. THE AI_Prompt_System SHALL ensure all prompts comply with GDPT_2018 standards and CV_5512 requirements
4. THE AI_Prompt_System SHALL optimize prompts with relevant pedagogical keywords such as "Tổ chức hoạt động dạy học" and "Phát triển năng lực"
5. WHERE Teacher_User selects lesson plan output, THE AI_Prompt_System SHALL generate prompts that create 4-column or 5-column lesson plan formats

### Requirement 2

**User Story:** As a Teacher_User, I want to convert curriculum content into presentation slide outlines, so that I can create engaging visual materials for my classes.

#### Acceptance Criteria

1. WHEN Teacher_User provides curriculum text content and specifies slide count, THE AI_Prompt_System SHALL generate a prompt that creates structured presentation outlines
2. THE AI_Prompt_System SHALL ensure generated prompts create slide outlines with title, bullet points, and image suggestions for each slide
3. THE AI_Prompt_System SHALL limit slide content to information from the original curriculum text only
4. WHERE Teacher_User specifies Target_AI_Tool as Canva AI or Gamma App, THE AI_Prompt_System SHALL optimize prompt format for those specific platforms
5. THE AI_Prompt_System SHALL structure presentation outlines with introduction, main content (7 slides), and conclusion sections

### Requirement 3

**User Story:** As a Teacher_User, I want to access a community library of shared prompts and lesson plans, so that I can learn from other educators and improve my teaching materials.

#### Acceptance Criteria

1. THE AI_Prompt_System SHALL provide an AI_Library where Teacher_Users can browse shared prompts and generated lesson plans
2. WHEN Teacher_User searches the AI_Library, THE AI_Prompt_System SHALL filter results by subject, grade level, and topic
3. THE AI_Prompt_System SHALL allow Teacher_Users to tag shared content with labels like "#Chuẩn5512", "#SángTạo", "#HoạtĐộngMới"
4. THE AI_Prompt_System SHALL display community ratings and tags for each shared item in the AI_Library
5. WHERE Teacher_User finds useful content, THE AI_Prompt_System SHALL allow them to save or adapt prompts for their own use

### Requirement 4

**User Story:** As a Teacher_User, I want to generate assessment questions based on Bloom's Taxonomy, so that I can create comprehensive evaluation materials for my students.

#### Acceptance Criteria

1. WHEN Teacher_User requests assessment generation, THE AI_Prompt_System SHALL create prompts that generate questions across different Bloom's Taxonomy levels
2. THE AI_Prompt_System SHALL ensure generated assessment prompts specify the number of questions for each cognitive level (Recognition, Comprehension, Application)
3. THE AI_Prompt_System SHALL include requirements for answer keys and scoring rubrics in assessment prompts
4. THE AI_Prompt_System SHALL generate prompts that create detailed explanations for correct answers
5. WHERE Teacher_User specifies multiple choice format, THE AI_Prompt_System SHALL ensure prompts create questions with clear distractors and explanations

### Requirement 5

**User Story:** As a Teacher_User, I want direct integration with AI tools, so that I can seamlessly transfer generated prompts to my preferred AI platforms.

#### Acceptance Criteria

1. THE AI_Prompt_System SHALL provide direct access buttons for each supported Target_AI_Tool (ChatGPT, Gemini, Canva AI, Gamma App)
2. WHEN Teacher_User clicks a direct access button, THE AI_Prompt_System SHALL open the Target_AI_Tool in a new tab with the generated prompt pre-filled
3. WHERE API limitations prevent automatic prompt insertion, THE AI_Prompt_System SHALL provide one-click copy functionality for the generated prompt
4. THE AI_Prompt_System SHALL maintain formatting compatibility for each Target_AI_Tool's input requirements
5. THE AI_Prompt_System SHALL display clear instructions for using the generated prompt with each Target_AI_Tool

### Requirement 6

**User Story:** As a Teacher_User, I want to save and manage my generated prompts, so that I can reuse and refine them for future lessons.

#### Acceptance Criteria

1. THE AI_Prompt_System SHALL allow Teacher_Users to save generated prompts to their personal library
2. WHEN Teacher_User saves a prompt, THE AI_Prompt_System SHALL store all input parameters and the generated prompt text
3. THE AI_Prompt_System SHALL enable Teacher_Users to edit and refine saved prompts
4. THE AI_Prompt_System SHALL organize saved prompts by subject, grade level, and creation date
5. WHERE Teacher_User has multiple versions of a prompt, THE AI_Prompt_System SHALL maintain version history and allow comparison between versions

### Requirement 7

**User Story:** As a Teacher_User, I want intelligent AI tool recommendations based on my subject and teaching objectives, so that I can choose the most suitable AI tools for my specific needs.

#### Acceptance Criteria

1. WHEN Teacher_User selects a subject and teaching objective, THE AI_Prompt_System SHALL recommend the most appropriate AI tools from 50+ available options
2. THE AI_Prompt_System SHALL categorize AI tools by purpose: text generation, presentation creation, video production, simulation, image generation, data analysis, assessment, and subject-specific tools
3. THE AI_Prompt_System SHALL provide subject-specific tool recommendations (GeoGebra for Toán, Google Earth for Địa lý, PhET for Khoa học tự nhiên, Timeline JS for Lịch sử)
4. THE AI_Prompt_System SHALL display tool descriptions, use cases, and direct links for each recommended AI tool
5. WHERE Teacher_User teaches multiple subjects, THE AI_Prompt_System SHALL provide cross-subject tool recommendations and integration suggestions

### Requirement 8

**User Story:** As a Teacher_User, I want access to specialized AI tools for different teaching activities, so that I can create diverse and engaging educational content.

#### Acceptance Criteria

1. THE AI_Prompt_System SHALL support video creation tools (HeyGen, Synthesia, Pictory) for creating educational videos with Vietnamese narration
2. THE AI_Prompt_System SHALL integrate simulation tools (PhET, Labster, Tinkercad, CoSpaces Edu) for interactive science and technology lessons
3. THE AI_Prompt_System SHALL provide image generation tools (Leonardo AI, DALL-E, Canva AI) for creating visual educational materials
4. THE AI_Prompt_System SHALL offer data analysis tools (Excel Copilot, Gapminder, Flourish) for creating charts and analyzing educational data
5. THE AI_Prompt_System SHALL include assessment tools (QuestionWell, Quizizz AI, Formative AI) for generating quizzes and evaluations based on Bloom's Taxonomy