# Community Library API Endpoints

This document describes all the community library API endpoints implemented for the AI Prompt Generator for Teachers application.

## Content Management Endpoints

### Basic Content Operations

- **GET /api/community/content** - Search shared content with filters
- **POST /api/community/content** - Share content to community library (with validation)
- **GET /api/community/content/[id]** - Get specific shared content by ID
- **GET /api/community/content/popular** - Get popular content
- **GET /api/community/content/recent** - Get recent content
- **GET /api/community/content/top-rated** - Get top rated content by time period
- **GET /api/community/content/by-tags** - Get content by specific tags

### Content Interaction Endpoints

- **GET /api/community/content/[id]/rating** - Get user's rating for content
- **POST /api/community/content/[id]/rating** - Rate content
- **DELETE /api/community/content/[id]/rating** - Remove user's rating
- **GET /api/community/content/[id]/save** - Check if content is saved
- **POST /api/community/content/[id]/save** - Save content to personal library
- **DELETE /api/community/content/[id]/save** - Remove content from personal library
- **POST /api/community/content/[id]/adapt** - Adapt community content for personal use
- **GET /api/community/content/[id]/stats** - Get statistics for specific content

### Content Moderation Endpoints

- **POST /api/community/content/[id]/report** - Report content for moderation
- **GET /api/community/content/[id]/report** - Get reports for specific content (admin)
- **POST /api/community/content/validate** - Validate content before sharing

### Advanced Operations

- **POST /api/community/content/bulk** - Perform bulk actions on multiple content items
- **GET /api/community/search** - Advanced search for community content
- **POST /api/community/search** - Advanced search with complex filters (body-based)

### Sharing and Prompt Operations

- **POST /api/community/content/share-prompt** - Share a generated prompt to community

## User Library Endpoints

- **GET /api/community/saved** - Get user's saved content from community library

## Tags and Metadata

- **GET /api/community/tags** - Get available tags and trending tags
  - Query parameters:
    - `type=all` - Get all available tags
    - `type=trending` - Get trending tags
    - `type=suggested` - Get suggested tags for content

## Admin/Moderation Endpoints

- **GET /api/admin/moderation/reports** - Get pending moderation reports (admin only)
- **POST /api/admin/moderation/reports/[id]/review** - Review a moderation report (admin only)
- **GET /api/admin/moderation/stats** - Get moderation statistics (admin only)

## Content Moderation Features

### Automated Content Validation

The system includes automated content validation that checks for:

- **Educational Appropriateness**: Ensures content is suitable for educational purposes
- **Length Validation**: Minimum 50 characters, maximum 10,000 characters
- **Language Appropriateness**: Filters inappropriate language
- **Subject Relevance**: Validates content relevance to specified subject
- **Educational Keywords**: Checks for presence of educational terminology

### Reporting System

Users can report content for various reasons:

- `inappropriate_content` - Nội dung không phù hợp
- `spam` - Spam/Rác
- `copyright_violation` - Vi phạm bản quyền
- `misleading_information` - Thông tin sai lệch
- `offensive_language` - Ngôn ngữ xúc phạm
- `non_educational` - Không có tính giáo dục
- `duplicate_content` - Nội dung trùng lặp

### Auto-Moderation

- Content with 3+ pending reports is flagged for review
- Automatic content validation on sharing
- Educational content standards enforcement

## Search and Filtering

### Basic Search Parameters

- `subject` - Filter by subject
- `gradeLevel` - Filter by grade level (6-9)
- `topic` - Search in title, description, and content
- `tags` - Filter by tags
- `rating` - Minimum rating filter
- `author` - Filter by author name

### Advanced Search Features

- **Sorting Options**: rating, recent, popular, saves
- **Pagination**: offset and limit parameters
- **Complex Filtering**: Multiple criteria combination
- **Tag-based Search**: Search by multiple tags

## Bulk Operations

The bulk endpoint supports:

- **save** - Save multiple content items to personal library
- **unsave** - Remove multiple content items from personal library
- **rate** - Rate multiple content items with the same rating

## Response Format

All endpoints follow a consistent response format:

```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

Error responses:

```json
{
  "error": "Error message in Vietnamese",
  "details": [...] // Optional validation details
}
```

## Authentication

Most endpoints require authentication via NextAuth.js session. Admin endpoints require additional role verification (to be implemented based on user roles).

## Rate Limiting and Security

- Input validation using Zod schemas
- SQL injection prevention via Prisma ORM
- Content sanitization and validation
- Vietnamese language error messages
- Educational content standards compliance