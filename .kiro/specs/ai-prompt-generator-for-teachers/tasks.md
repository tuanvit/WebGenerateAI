# Implementation Plan

- [x] 1. Set up project structure and core configuration





  - Initialize Next.js project with TypeScript
  - Configure PostgreSQL database connection
  - Set up NextAuth.js for authentication
  - Configure environment variables and deployment settings
  - _Requirements: All requirements need foundational setup_

- [x] 2. Implement core data models and database schema





- [x] 2.1 Create database schema and migrations


  - Design and implement PostgreSQL tables for users, generated_prompts, shared_content, content_ratings, user_libraries, prompt_versions
  - Set up database migrations and seed data
  - _Requirements: 3.1, 6.1, 6.2_

- [x] 2.2 Implement TypeScript interfaces and data models


  - Create User, GeneratedPrompt, SharedContent, and related interfaces
  - Implement data validation schemas using Zod or similar
  - _Requirements: 1.1, 3.1, 6.1_

- [x] 2.3 Create database access layer


  - Implement repository pattern for data access operations
  - Create CRUD operations for all entities
  - _Requirements: 3.1, 6.1, 6.2_

- [ ]* 2.4 Write unit tests for data models
  - Create unit tests for data validation
  - Test database operations and repository methods
  - _Requirements: 2.1, 3.1, 6.1_

- [x] 3. Implement authentication and user management





- [x] 3.1 Set up NextAuth.js configuration


  - Configure authentication providers and session management
  - Implement user registration and login flows
  - _Requirements: 6.1_

- [x] 3.2 Create user profile management


  - Implement user profile creation and editing
  - Add subject and grade level selection (restricted to grades 6-9)
  - _Requirements: 6.1_

- [ ]* 3.3 Write authentication tests
  - Test login/logout functionality
  - Test user profile management
  - _Requirements: 6.1_

- [x] 4. Implement core prompt generation engine





- [x] 4.1 Create prompt generation service


  - Implement PromptGeneratorService with methods for lesson plans, presentations, and assessments
  - Create prompt templates for different output types
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 4.1_

- [x] 4.2 Implement lesson plan prompt generation


  - Create specialized prompts for 4-column and 5-column lesson plan formats
  - Ensure compliance with GDPT 2018 and CV 5512 standards
  - Include pedagogical keywords and role definitions
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 4.3 Implement presentation outline generation


  - Create prompts for structured slide outlines with title, bullet points, and image suggestions
  - Limit content to original curriculum text only
  - Structure with introduction, main content (7 slides), and conclusion
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 4.4 Implement assessment question generation


  - Create prompts for questions across Bloom's Taxonomy levels
  - Include answer keys and scoring rubrics
  - Support multiple choice format with distractors
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.5 Write unit tests for prompt generation
  - Test prompt generation for different input types
  - Validate output format compliance
  - _Requirements: 1.1, 2.1, 4.1_

- [x] 5. Implement AI tool integration system





- [x] 5.1 Create AI tool integration manager


  - Implement AIToolIntegration interface with methods for different AI tools
  - Support ChatGPT, Gemini, Copilot, Canva AI, and Gamma App
  - _Requirements: 5.1, 5.2_

- [x] 5.2 Implement direct tool access functionality


  - Create buttons for each supported AI tool
  - Implement URL generation and new tab opening with pre-filled prompts
  - _Requirements: 5.1, 5.2_

- [x] 5.3 Add copy-to-clipboard functionality


  - Implement one-click copy for generated prompts
  - Maintain formatting compatibility for each target tool
  - _Requirements: 5.3, 5.4_

- [x] 5.4 Create tool-specific formatting


  - Optimize prompt format for each AI tool's requirements
  - Add clear usage instructions for each tool
  - _Requirements: 5.4, 5.5_

- [ ]* 5.5 Write integration tests for AI tools
  - Test URL generation and formatting
  - Test copy functionality
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Implement personal library management





- [x] 6.1 Create personal library service


  - Implement PersonalLibraryService with save, retrieve, and update operations
  - Support organizing prompts by subject, grade level, and date
  - _Requirements: 6.1, 6.2, 6.4_

- [x] 6.2 Implement prompt version management


  - Create version history tracking for saved prompts
  - Allow comparison between different versions
  - _Requirements: 6.5_

- [x] 6.3 Add prompt editing and refinement features


  - Allow users to edit and refine saved prompts
  - Maintain input parameters with generated text
  - _Requirements: 6.2, 6.3_

- [ ]* 6.4 Write tests for personal library
  - Test save, retrieve, and update operations
  - Test version management functionality
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 7. Implement community library system





- [x] 7.1 Create community library service


  - Implement CommunityLibraryService with search, share, and rating functionality
  - Support filtering by subject, grade level, and topic
  - _Requirements: 3.1, 3.2_

- [x] 7.2 Implement content sharing functionality


  - Allow users to share prompts and lesson plans to community
  - Add tagging system with labels like "#Chuẩn5512", "#SángTạo", "#HoạtĐộngMới"
  - _Requirements: 3.3, 3.4_

- [x] 7.3 Add rating and feedback system


  - Implement community ratings for shared content
  - Display ratings and tags for each shared item
  - _Requirements: 3.4_

- [x] 7.4 Create save-to-personal-library feature


  - Allow users to save community content to personal library
  - Support adapting shared prompts for personal use
  - _Requirements: 3.5_

- [ ]* 7.5 Write tests for community features
  - Test search and filtering functionality
  - Test sharing and rating systems
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 8. Create user interface components





- [x] 8.1 Implement main prompt generation form


  - Create form for inputting subject, grade level, lesson name, and standards
  - Add dropdown for target AI tool selection
  - Support Vietnamese language interface
  - _Requirements: 1.1, 2.1, 4.1_

- [x] 8.2 Create prompt display and action components


  - Display generated prompts with formatting
  - Add direct access buttons for AI tools
  - Implement copy-to-clipboard functionality
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 8.3 Implement personal library interface


  - Create dashboard for saved prompts
  - Add search and filtering for personal content
  - Implement prompt editing interface
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 8.4 Create community library interface


  - Implement browse and search interface for shared content
  - Add rating and tagging components
  - Create sharing interface for publishing content
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 8.5 Add responsive design and accessibility


  - Ensure mobile responsiveness for common devices
  - Implement WCAG 2.1 AA compliance
  - Add keyboard navigation and screen reader support
  - _Requirements: All requirements benefit from accessible interface_

- [ ]* 8.6 Write component tests
  - Test form validation and submission
  - Test user interactions and state management
  - _Requirements: 1.1, 3.1, 6.1_

- [x] 9. Implement API routes and backend logic





- [x] 9.1 Create prompt generation API endpoints


  - Implement REST endpoints for lesson plan, presentation, and assessment generation
  - Add input validation and error handling
  - _Requirements: 1.1, 2.1, 4.1_

- [x] 9.2 Create personal library API endpoints


  - Implement CRUD operations for saved prompts
  - Add version management endpoints
  - _Requirements: 6.1, 6.2, 6.5_



- [x] 9.3 Create community library API endpoints





  - Implement endpoints for sharing, searching, and rating content
  - Add content moderation capabilities


  - _Requirements: 3.1, 3.2, 3.4_

- [x] 9.4 Add authentication middleware



  - Implement route protection for authenticated users
  - Add role-based access control if needed
  - _Requirements: 6.1, 3.1_

- [ ]* 9.5 Write API integration tests
  - Test all endpoints with various input scenarios
  - Test authentication and authorization
  - _Requirements: 1.1, 3.1, 6.1_

- [x] 10. Implement error handling and validation





- [x] 10.1 Create comprehensive error handling system


  - Implement client-side validation with real-time feedback
  - Add server-side validation and error responses
  - Create Vietnamese error messages for user experience
  - _Requirements: All requirements need proper error handling_

- [x] 10.2 Add input validation for educational standards


  - Validate compliance with GDPT 2018 and CV 5512 requirements
  - Ensure grade level restrictions (6-9 only)
  - Validate pedagogical terminology and standards
  - _Requirements: 1.3, 1.5, 2.3_

- [ ]* 10.3 Write error handling tests
  - Test validation rules and error responses
  - Test graceful degradation scenarios
  - _Requirements: All requirements_

- [x] 11. Add deployment configuration and optimization





- [x] 11.1 Configure production deployment


  - Set up Docker containers or Vercel deployment
  - Configure environment variables for production
  - Set up database migrations for production
  - _Requirements: All requirements need deployment_

- [x] 11.2 Implement performance optimizations


  - Add caching for frequently generated prompts
  - Optimize database queries and indexing
  - Implement lazy loading for large content lists
  - _Requirements: 3.2, 6.4_

- [x] 11.3 Add monitoring and logging


  - Implement error logging and monitoring
  - Add performance metrics tracking
  - Set up health checks and alerts
  - _Requirements: All requirements benefit from monitoring_

- [ ] 11.4 Write end-to-end tests
  - Test complete user workflows
  - Test cross-browser compatibility
  - Test performance under load
  - _Requirements: All requirements_

- [x] 12. Implement Enhanced AI Tool Recommendation System

- [x] 12.1 Create comprehensive AI tools database

  - Import 50+ AI tools from KHTN_GDCD_CONG_NGHE_LS_DL_TOAN_VAN.md
  - Categorize tools by purpose and subject
  - Add Vietnamese support indicators and difficulty levels
  - _Requirements: 7.1, 7.2, 8.1_

- [x] 12.2 Implement intelligent recommendation engine

  - Create recommendation algorithm based on subject, grade, and teaching objective
  - Implement tool filtering and search functionality
  - Add relevance scoring for better recommendations
  - _Requirements: 7.1, 7.3, 7.4_

- [x] 12.3 Create AI tool recommendation UI components


  - Design tool recommendation cards with descriptions and links
  - Implement category-based tool browsing
  - Add tool comparison and favorites functionality
  - _Requirements: 7.4, 7.5_

- [x] 12.4 Integrate recommendation system with prompt generation



  - Show recommended tools based on selected subject and output type
  - Add tool-specific prompt optimization
  - Implement direct tool integration buttons
  - _Requirements: 7.5, 8.2, 8.3_

- [-]* 12.5 Write tests for recommendation system

  - Test recommendation algorithm accuracy
  - Test tool filtering and search functionality
  - Test integration with existing prompt generation
  - _Requirements: 7.1, 7.2, 8.1_

- [ ] 13. Implement Subject-specific Templates System

- [x] 13.1 Create subject-specific prompt templates





  - Design templates for each subject based on KHTN_GDCD_CONG_NGHE_LS_DL_TOAN_VAN.md requirements
  - Include specialized prompts for Toán, Văn, KHTN, Lịch sử & Địa lí, GDCD, Công nghệ
  - Integrate with AI tool recommendations for optimal results
  - _Requirements: 1.1, 1.2, 7.1_

- [x] 13.2 Implement template selection engine



  - Create intelligent template matching based on subject, grade, and output type
  - Support template customization and user preferences
  - Add template preview and comparison features
  - _Requirements: 1.1, 7.1, 7.4_

- [ ] 13.3 Create template management UI
  - Design interface for browsing and selecting templates
  - Add template preview with sample outputs
  - Implement template customization options
  - _Requirements: 1.1, 7.4, 7.5_

- [ ] 13.4 Integrate templates with existing prompt generation
  - Update generate page to use subject-specific templates
  - Combine templates with AI tool recommendations
  - Add template-based prompt optimization
  - _Requirements: 1.1, 1.2, 7.5_

- [ ]* 13.5 Write tests for template system
  - Test template selection algorithm
  - Test template customization features
  - Test integration with prompt generation
  - _Requirements: 1.1, 7.1_