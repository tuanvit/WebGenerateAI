# Project Structure & Organization

## Architecture Pattern
Layered architecture with Next.js full-stack approach:
- **Frontend Layer**: Next.js with SSR for Vietnamese language support
- **API Layer**: Next.js API routes for backend logic
- **Business Logic Layer**: Services for prompt generation and content management
- **Data Access Layer**: Repository pattern with PostgreSQL

## Core Modules

### Prompt Generation Engine
- **Location**: `services/prompt/`
- **Purpose**: Convert pedagogical requirements into AI-optimized prompts
- **Key Files**: 
  - `PromptGeneratorService.ts` - Main prompt generation logic
  - `templates/` - Prompt templates for different output types
  - `validators/` - Input validation for educational standards

### AI Tool Integration
- **Location**: `services/integration/`
- **Purpose**: Handle direct connections to AI platforms
- **Key Files**:
  - `AIToolIntegration.ts` - Integration manager
  - `formatters/` - Tool-specific prompt formatting
  - `connectors/` - Direct tool access implementations

### Community & Personal Libraries
- **Location**: `services/library/`
- **Purpose**: Manage shared and personal content
- **Key Files**:
  - `CommunityLibraryService.ts` - Shared content management
  - `PersonalLibraryService.ts` - User's saved prompts
  - `ContentRatingService.ts` - Community rating system

## Data Organization

### Database Schema
- **Users**: Teacher profiles with subject/grade preferences
- **Generated Prompts**: All created prompts with metadata
- **Shared Content**: Community library items
- **Content Ratings**: User feedback on shared content
- **User Libraries**: Personal saved content references

### File Structure Conventions
```
├── components/
│   ├── forms/          # Input forms for prompt generation
│   ├── display/        # Prompt display and formatting
│   ├── library/        # Personal and community library UI
│   └── integration/    # AI tool connection components
├── services/
│   ├── prompt/         # Core prompt generation
│   ├── integration/    # AI tool connections
│   └── library/        # Content management
├── types/
│   ├── prompt.ts       # Prompt-related interfaces
│   ├── user.ts         # User and authentication types
│   └── content.ts      # Library and sharing types
```

## Grade Level Restrictions
- **Scope**: Grades 6-9 only (Vietnamese middle school)
- **Validation**: Enforce at both client and server levels
- **Standards**: Strict compliance with GDPT 2018 and CV 5512

## Vietnamese Language Considerations
- **Encoding**: UTF-8 throughout the application
- **UI Language**: Vietnamese interface with educational terminology
- **Content**: Support for Vietnamese pedagogical standards and keywords
- **Error Messages**: All user-facing errors in Vietnamese