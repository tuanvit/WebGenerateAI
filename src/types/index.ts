// Main types export file
export * from './user';
export * from './prompt';
export * from './content';
export * from './services';
export * from './api';

// Re-export commonly used types for convenience
export type {
    User,
    GradeLevel,
    VietnameseSubject,
} from './user';

export type {
    GeneratedPrompt,
    LessonPlanInput,
    PresentationInput,
    AssessmentInput,
    TargetAITool,
    BloomTaxonomyLevel,
} from './prompt';

export type {
    SharedContent,
    ContentRating,
    UserLibrary,
    SearchFilters,
    LibraryFilters,
} from './content';

export type {
    PromptGeneratorService,
    AIToolIntegration,
    CommunityLibraryService,
    PersonalLibraryService,
    ApiResponse,
    PaginatedResponse,
} from './services';

export {
    TargetAITool,
    BloomTaxonomyLevel,
    VIETNAMESE_SUBJECTS,
    GRADE_LEVELS,
    PEDAGOGICAL_STANDARDS,
    COMMON_TAGS,
} from './prompt';

export {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    DatabaseError,
} from './services';