# Requirements Document

## Introduction

Hệ thống quản lý admin cho phép người dùng không có kiến thức kỹ thuật có thể dễ dàng quản lý toàn bộ AI tools và Templates của trang web thông qua giao diện trực quan và thân thiện.

## Glossary

- **Admin System**: Hệ thống quản lý dành cho quản trị viên
- **AI Tool**: Công cụ AI được tích hợp vào hệ thống bao gồm 40+ tools như ChatGPT, Gemini, Copilot, Canva AI, Gamma App, HeyGen, Synthesia, Pictory, ElevenLabs, PhET Simulation, Labster, Tinkercad, CoSpaces Edu, Chemix AI, Quizizz AI, QuestionWell, Formative AI, Kahoot, Google Earth, ArcGIS StoryMaps, Gapminder, Flourish, Datawrapper, MakeCode, Scratch, TimelineJS, Blooket, Wolfram Alpha, GeoGebra, Desmos, Microsoft Designer, Leonardo AI, Perplexity AI, Tome, và các tools khác
- **Template**: Mẫu prompt được định nghĩa sẵn cho các mục đích giáo dục khác nhau
- **Server Component**: Component Next.js chạy trên server để load dữ liệu động
- **Database**: Cơ sở dữ liệu PostgreSQL lưu trữ thông tin AI tools và templates
- **Non-technical User**: Người dùng không có kiến thức lập trình hoặc kỹ thuật
- **AI Tool Categories**: Các danh mục công cụ AI bao gồm TEXT_GENERATION, PRESENTATION, IMAGE, VIDEO, SIMULATION, ASSESSMENT, DATA_ANALYSIS

## Requirements

### Requirement 1

**User Story:** Là một quản trị viên không có kiến thức kỹ thuật, tôi muốn có một trang admin để quản lý 40+ AI tools hiện có, để có thể thêm, sửa, xóa các công cụ AI mà không cần biết code.

#### Acceptance Criteria

1. THE Admin_System SHALL provide a dedicated admin page accessible through authentication
2. WHEN an admin accesses the AI tools management section, THE Admin_System SHALL display all 40+ existing AI tools organized by categories (TEXT_GENERATION, PRESENTATION, IMAGE, VIDEO, SIMULATION, ASSESSMENT, DATA_ANALYSIS)
3. THE Admin_System SHALL allow admins to add new AI tools through a comprehensive form interface including fields for name, description, URL, category, subjects, grade levels, use case, Vietnamese support, difficulty level, features, pricing model, integration instructions, and sample prompts
4. THE Admin_System SHALL allow admins to edit existing AI tool information through inline editing or modal forms with all tool properties editable
5. THE Admin_System SHALL allow admins to delete AI tools with confirmation prompts and cascade handling for related data

### Requirement 2

**User Story:** Là một quản trị viên, tôi muốn quản lý Templates thông qua giao diện web, để có thể tạo và chỉnh sửa các mẫu prompt mà không cần chỉnh sửa code.

#### Acceptance Criteria

1. THE Admin_System SHALL provide a templates management section within the admin interface
2. WHEN an admin views the templates section, THE Admin_System SHALL display all templates organized by category and subject
3. THE Admin_System SHALL allow admins to create new templates using a rich text editor with Vietnamese language support
4. THE Admin_System SHALL allow admins to edit template content, metadata, and categorization
5. THE Admin_System SHALL allow admins to preview templates before saving changes

### Requirement 3

**User Story:** Là một quản trị viên, tôi muốn hệ thống sử dụng server components để load dữ liệu động, để đảm bảo hiệu suất tốt và dữ liệu luôn được cập nhật.

#### Acceptance Criteria

1. THE Admin_System SHALL use Next.js server components to fetch AI tools data from the database
2. THE Admin_System SHALL use server components to load templates data dynamically from the database
3. WHEN data changes are made, THE Admin_System SHALL automatically refresh the display without manual page reload
4. THE Admin_System SHALL implement proper error handling for database connection issues
5. THE Admin_System SHALL provide loading states during data fetching operations

### Requirement 4

**User Story:** Là một người dùng không có kiến thức kỹ thuật, tôi muốn giao diện admin đơn giản và trực quan, để có thể sử dụng mà không cần đào tạo phức tạp.

#### Acceptance Criteria

1. THE Admin_System SHALL provide a clean, intuitive interface with Vietnamese language labels and instructions
2. THE Admin_System SHALL use visual icons and clear navigation to guide users through different sections
3. WHEN users perform actions, THE Admin_System SHALL provide clear feedback messages in Vietnamese
4. THE Admin_System SHALL implement form validation with helpful error messages in Vietnamese
5. THE Admin_System SHALL provide help tooltips and guidance text for complex operations

### Requirement 5

**User Story:** Là một quản trị viên, tôi muốn có khả năng backup và restore dữ liệu, để đảm bảo an toàn thông tin khi thực hiện các thay đổi lớn.

#### Acceptance Criteria

1. THE Admin_System SHALL provide export functionality for AI tools and templates data
2. THE Admin_System SHALL allow importing data from previously exported files
3. WHEN performing bulk operations, THE Admin_System SHALL create automatic backups
4. THE Admin_System SHALL provide rollback functionality for recent changes
5. THE Admin_System SHALL log all admin actions for audit purposes

### Requirement 6

**User Story:** Là một quản trị viên, tôi muốn có dashboard tổng quan, để có thể nhanh chóng nắm bắt tình trạng hệ thống và các thống kê quan trọng.

#### Acceptance Criteria

1. THE Admin_System SHALL display a dashboard with key metrics about AI tools usage
2. THE Admin_System SHALL show statistics about template usage and popularity
3. THE Admin_System SHALL provide visual charts and graphs for data visualization
4. THE Admin_System SHALL display recent activities and system health status
5. THE Admin_System SHALL allow customization of dashboard widgets and layout

### Requirement 7

**User Story:** Là một quản trị viên, tôi muốn quản lý đầy đủ thông tin chi tiết của từng AI tool, để đảm bảo thông tin chính xác và cập nhật cho giáo viên sử dụng.

#### Acceptance Criteria

1. THE Admin_System SHALL allow management of all AI tool properties including id, name, description, URL, category, subjects array, grade levels array, use case, Vietnamese support flag, difficulty level, features array, pricing model, integration instructions, sample prompts array, and related tools array
2. THE Admin_System SHALL provide category-based filtering for AI tools including TEXT_GENERATION (ChatGPT, Gemini, Copilot, Perplexity AI), PRESENTATION (Canva AI, Gamma, Tome), IMAGE (Microsoft Designer, Leonardo AI), VIDEO (HeyGen, Synthesia, Pictory, ElevenLabs), SIMULATION (PhET, Labster, Tinkercad, CoSpaces Edu, Chemix AI, GeoGebra, Desmos, MakeCode, Scratch), ASSESSMENT (Quizizz AI, QuestionWell, Formative AI, Kahoot, Blooket), and DATA_ANALYSIS (Google Earth, ArcGIS StoryMaps, Gapminder, Flourish, Datawrapper, TimelineJS, Wolfram Alpha)
3. THE Admin_System SHALL support subject-based filtering for tools across Toán, Văn, Khoa học tự nhiên, Lịch sử & Địa lí, Giáo dục công dân, and Công nghệ subjects
4. THE Admin_System SHALL allow grade level filtering for tools supporting grades 6, 7, 8, and 9
5. THE Admin_System SHALL provide Vietnamese language support status management for each tool

### Requirement 8

**User Story:** Là một quản trị viên, tôi muốn có khả năng bulk operations để quản lý nhiều AI tools cùng lúc, để tiết kiệm thời gian khi cập nhật hàng loạt.

#### Acceptance Criteria

1. THE Admin_System SHALL provide bulk edit functionality for common properties like category, subjects, grade levels, and Vietnamese support status
2. THE Admin_System SHALL allow bulk import of AI tools from CSV or JSON files with proper validation
3. THE Admin_System SHALL provide bulk export functionality for backup and data migration purposes
4. THE Admin_System SHALL support bulk delete operations with comprehensive confirmation dialogs
5. THE Admin_System SHALL maintain audit logs for all bulk operations performed