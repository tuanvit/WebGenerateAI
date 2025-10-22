# Design Document - AI Prompt Generator for Teachers

## Overview

The AI Prompt Generator for Teachers is a web application designed to help Vietnamese educators transform specific pedagogical requirements into professional AI prompts. The system optimizes prompts for generating lesson plans and presentation content according to the General Education Program 2018 standards and Circular 5512 guidelines.

The application serves as a bridge between traditional Vietnamese educational standards and modern AI tools, enabling teachers to leverage AI effectively while maintaining compliance with national curriculum requirements.

## Architecture

### System Architecture

The system follows a modern web application architecture with the following layers:

```
┌─────────────────────────────────────────┐
│         Next.js Frontend (SSR)          │
├─────────────────────────────────────────┤
│         Next.js API Routes              │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   Prompt    │  │   Community     │   │
│  │  Generator  │  │    Library      │   │
│  └─────────────┘  └─────────────────┘   │
├─────────────────────────────────────────┤
│           Data Access Layer             │
├─────────────────────────────────────────┤
│         Database (PostgreSQL)           │
└─────────────────────────────────────────┘
```

**Design Rationale**: A layered architecture with Next.js ensures separation of concerns while providing server-side rendering capabilities. The modular approach allows for independent development and testing of core features, with API routes co-located with frontend components for better maintainability.

### Technology Stack

- **Frontend & Backend**: Next.js with TypeScript for full-stack development, server-side rendering, and better SEO
- **Database**: PostgreSQL for robust data storage and complex queries
- **Authentication**: NextAuth.js for seamless authentication integration
- **Deployment**: Vercel or Docker containers for consistent deployment across environments

**Design Rationale**: Next.js provides excellent Vietnamese language support, built-in API routes, server-side rendering for better performance, and simplified deployment. The full-stack approach reduces complexity and improves development velocity for educational applications.

## Components and Interfaces

### Core Components

#### 1. Prompt Generator Engine
**Purpose**: Converts pedagogical requirements into optimized AI prompts

**Key Interfaces**:
```typescript
interface PromptGeneratorService {
  generateLessonPlanPrompt(input: LessonPlanInput): Promise<GeneratedPrompt>
  generatePresentationPrompt(input: PresentationInput): Promise<GeneratedPrompt>
  generateAssessmentPrompt(input: AssessmentInput): Promise<GeneratedPrompt>
  optimizeForTargetTool(prompt: string, tool: TargetAITool): string
}

interface LessonPlanInput {
  subject: string
  gradeLevel: 6 | 7 | 8 | 9  // Restricted to grades 6-9 only
  lessonName: string
  pedagogicalStandard: string
  outputFormat: 'four-column' | 'five-column'
  targetTool: TargetAITool
}
```

**Design Rationale**: Separate methods for different output types allow for specialized prompt optimization while maintaining a consistent interface.

#### 2. AI Tool Integration Manager
**Purpose**: Handles direct integration with various AI platforms

**Key Interfaces**:
```typescript
interface AIToolIntegration {
  openWithPrompt(tool: TargetAITool, prompt: string): Promise<void>
  copyToClipboard(prompt: string): Promise<void>
  formatForTool(prompt: string, tool: TargetAITool): string
}

enum AIToolCategory {
  TEXT_GENERATION = 'text-generation',
  PRESENTATION = 'presentation', 
  VIDEO = 'video',
  SIMULATION = 'simulation',
  IMAGE = 'image',
  DATA_ANALYSIS = 'data-analysis',
  ASSESSMENT = 'assessment',
  SUBJECT_SPECIFIC = 'subject-specific'
}

interface AITool {
  id: string
  name: string
  description: string
  url: string
  category: AIToolCategory
  subjects: string[]
  gradeLevel: (6 | 7 | 8 | 9)[]
  useCase: string
  vietnameseSupport: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}
```

**Design Rationale**: Abstraction layer allows for easy addition of new AI tools and handles platform-specific formatting requirements.

#### 2.1. Enhanced AI Tool Recommendation Engine
**Purpose**: Intelligently recommends the most suitable AI tools based on subject, grade level, and teaching objectives

**Key Interfaces**:
```typescript
interface AIToolRecommendationService {
  getRecommendedTools(criteria: RecommendationCriteria): Promise<AITool[]>
  getToolsByCategory(category: AIToolCategory): Promise<AITool[]>
  getSubjectSpecificTools(subject: string): Promise<AITool[]>
  searchTools(query: string, filters?: ToolFilters): Promise<AITool[]>
  getToolDetails(toolId: string): Promise<AIToolDetails>
}

interface RecommendationCriteria {
  subject: string
  gradeLevel: 6 | 7 | 8 | 9
  teachingObjective: 'lesson-planning' | 'presentation' | 'assessment' | 'interactive-content' | 'research'
  outputType: 'text' | 'visual' | 'video' | 'interactive'
  difficultyPreference?: 'beginner' | 'intermediate' | 'advanced'
}

interface AIToolDetails extends AITool {
  features: string[]
  pricingModel: 'free' | 'freemium' | 'paid'
  integrationInstructions: string
  samplePrompts: string[]
  relatedTools: string[]
}
```

**Design Rationale**: Smart recommendation system that considers multiple factors to suggest the most appropriate tools, reducing cognitive load on teachers and improving tool adoption.

#### 3. Community Library System
**Purpose**: Manages shared prompts and lesson plans

**Key Interfaces**:
```typescript
interface CommunityLibraryService {
  searchContent(filters: SearchFilters): Promise<SharedContent[]>
  shareContent(content: ShareableContent): Promise<void>
  rateContent(contentId: string, rating: number): Promise<void>
  saveToPersonalLibrary(contentId: string, userId: string): Promise<void>
}

interface SearchFilters {
  subject?: string
  gradeLevel?: 6 | 7 | 8 | 9  // Restricted to grades 6-9 only
  topic?: string
  tags?: string[]
}
```

**Design Rationale**: Flexible search and filtering system supports the collaborative nature of educational content sharing.

#### 4. Personal Library Manager
**Purpose**: Handles user's saved prompts and version management

**Key Interfaces**:
```typescript
interface PersonalLibraryService {
  savePrompt(prompt: SavedPrompt): Promise<void>
  getPrompts(userId: string, filters?: LibraryFilters): Promise<SavedPrompt[]>
  updatePrompt(promptId: string, updates: Partial<SavedPrompt>): Promise<void>
  getVersionHistory(promptId: string): Promise<PromptVersion[]>
}
```

## Data Models

### Core Data Models

#### User Model
```typescript
interface User {
  id: string
  email: string
  name: string
  school?: string
  subjects: string[]
  gradeLevel: (6 | 7 | 8 | 9)[]  // Restricted to grades 6-9 only
  createdAt: Date
  lastLoginAt: Date
}
```

#### Generated Prompt Model
```typescript
interface GeneratedPrompt {
  id: string
  userId: string
  inputParameters: PromptInput
  generatedText: string
  targetTool: TargetAITool
  createdAt: Date
  isShared: boolean
  tags: string[]
}
```

#### Shared Content Model
```typescript
interface SharedContent {
  id: string
  authorId: string
  title: string
  description: string
  content: string
  subject: string
  gradeLevel: 6 | 7 | 8 | 9  // Restricted to grades 6-9 only
  tags: string[]
  rating: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
}
```

**Design Rationale**: Models are designed to support both individual use and community sharing, with clear separation between personal and public content.

### Database Schema Design

The database uses PostgreSQL with the following key tables:
- `users` - User account information
- `generated_prompts` - All generated prompts with metadata
- `shared_content` - Community-shared content
- `content_ratings` - User ratings for shared content
- `user_libraries` - Personal saved content references
- `prompt_versions` - Version history for iterative improvements

## Error Handling

### Error Categories and Handling Strategy

#### 1. Input Validation Errors
- **Strategy**: Client-side validation with server-side verification
- **User Experience**: Real-time feedback with clear Vietnamese error messages
- **Example**: "Vui lòng chọn môn học và lớp học trước khi tạo prompt"

#### 2. AI Tool Integration Errors
- **Strategy**: Graceful degradation with fallback to copy-to-clipboard
- **User Experience**: Clear instructions for manual prompt usage
- **Retry Logic**: Automatic retry for transient network issues

#### 3. Database Errors
- **Strategy**: Transaction rollback with user-friendly error messages
- **Logging**: Comprehensive error logging for debugging
- **Recovery**: Automatic retry for connection issues

#### 4. Authentication Errors
- **Strategy**: Secure error messages that don't reveal system information
- **Session Management**: Automatic token refresh with fallback to re-login

**Design Rationale**: Comprehensive error handling ensures system reliability and provides clear guidance to users in their native language.

## Testing Strategy

### Testing Approach

#### 1. Unit Testing
- **Coverage Target**: 80% code coverage for core business logic
- **Focus Areas**: Prompt generation algorithms, data validation, utility functions
- **Tools**: Jest for JavaScript/TypeScript testing

#### 2. Integration Testing
- **API Testing**: All REST endpoints with various input scenarios
- **Database Testing**: Data persistence and retrieval operations
- **External Service Testing**: Mock AI tool integrations

#### 3. End-to-End Testing
- **User Workflows**: Complete prompt generation and sharing workflows
- **Cross-browser Testing**: Support for major browsers used in Vietnamese schools
- **Mobile Responsiveness**: Testing on common mobile devices

#### 4. Performance Testing
- **Load Testing**: System performance under concurrent user load
- **Database Performance**: Query optimization for large datasets
- **Response Time**: Target <2 seconds for prompt generation

#### 5. Localization Testing
- **Vietnamese Language**: Proper display of Vietnamese characters and formatting
- **Educational Standards**: Compliance with GDPT 2018 and CV 5512 requirements
- **Cultural Context**: Appropriate pedagogical terminology and examples

**Design Rationale**: Comprehensive testing strategy ensures reliability for educational use and proper handling of Vietnamese educational standards and language requirements.

### Quality Assurance

#### Accessibility Standards
- **WCAG 2.1 AA Compliance**: Ensuring accessibility for teachers with disabilities
- **Keyboard Navigation**: Full functionality without mouse interaction
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

#### Security Considerations
- **Data Privacy**: Compliance with Vietnamese data protection regulations
- **User Content**: Secure handling of shared educational content
- **Authentication**: Secure session management and password policies

**Design Rationale**: Educational applications require high standards for accessibility and security to serve all teachers effectively and protect sensitive educational content.