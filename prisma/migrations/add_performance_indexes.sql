-- Performance optimization indexes for AI Prompt Generator

-- Indexes for shared_content table (most queried)
CREATE INDEX IF NOT EXISTS idx_shared_content_subject ON "shared_content" ("subject");
CREATE INDEX IF NOT EXISTS idx_shared_content_grade_level ON "shared_content" ("gradeLevel");
CREATE INDEX IF NOT EXISTS idx_shared_content_rating ON "shared_content" ("rating" DESC);
CREATE INDEX IF NOT EXISTS idx_shared_content_rating_count ON "shared_content" ("ratingCount" DESC);
CREATE INDEX IF NOT EXISTS idx_shared_content_created_at ON "shared_content" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_shared_content_tags ON "shared_content" USING GIN ("tags");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_shared_content_subject_grade ON "shared_content" ("subject", "gradeLevel");
CREATE INDEX IF NOT EXISTS idx_shared_content_rating_created ON "shared_content" ("rating" DESC, "createdAt" DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_shared_content_title_search ON "shared_content" USING GIN (to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS idx_shared_content_description_search ON "shared_content" USING GIN (to_tsvector('english', "description"));

-- Indexes for generated_prompts table
CREATE INDEX IF NOT EXISTS idx_generated_prompts_user_id ON "generated_prompts" ("userId");
CREATE INDEX IF NOT EXISTS idx_generated_prompts_created_at ON "generated_prompts" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_target_tool ON "generated_prompts" ("targetTool");
CREATE INDEX IF NOT EXISTS idx_generated_prompts_is_shared ON "generated_prompts" ("isShared");
CREATE INDEX IF NOT EXISTS idx_generated_prompts_tags ON "generated_prompts" USING GIN ("tags");

-- Indexes for content_ratings table
CREATE INDEX IF NOT EXISTS idx_content_ratings_content_id ON "content_ratings" ("contentId");
CREATE INDEX IF NOT EXISTS idx_content_ratings_user_id ON "content_ratings" ("userId");
CREATE INDEX IF NOT EXISTS idx_content_ratings_rating ON "content_ratings" ("rating");

-- Indexes for user_libraries table
CREATE INDEX IF NOT EXISTS idx_user_libraries_user_id ON "user_libraries" ("userId");
CREATE INDEX IF NOT EXISTS idx_user_libraries_content_id ON "user_libraries" ("contentId");
CREATE INDEX IF NOT EXISTS idx_user_libraries_saved_at ON "user_libraries" ("savedAt" DESC);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON "users" ("email");
CREATE INDEX IF NOT EXISTS idx_users_subjects ON "users" USING GIN ("subjects");
CREATE INDEX IF NOT EXISTS idx_users_grade_level ON "users" USING GIN ("gradeLevel");
CREATE INDEX IF NOT EXISTS idx_users_last_login ON "users" ("lastLoginAt" DESC);

-- Indexes for prompt_versions table
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON "prompt_versions" ("promptId");
CREATE INDEX IF NOT EXISTS idx_prompt_versions_version ON "prompt_versions" ("version");
CREATE INDEX IF NOT EXISTS idx_prompt_versions_created_at ON "prompt_versions" ("createdAt" DESC);

-- Indexes for moderation_reports table
CREATE INDEX IF NOT EXISTS idx_moderation_reports_content_id ON "moderation_reports" ("contentId");
CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter_id ON "moderation_reports" ("reporterId");
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON "moderation_reports" ("status");
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created_at ON "moderation_reports" ("createdAt" DESC);

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_shared_content_high_rating ON "shared_content" ("rating" DESC) WHERE "ratingCount" >= 3;
CREATE INDEX IF NOT EXISTS idx_shared_content_recent_popular ON "shared_content" ("createdAt" DESC) WHERE "rating" >= 4.0;

-- Indexes for JSON fields (input parameters in generated_prompts)
CREATE INDEX IF NOT EXISTS idx_generated_prompts_subject ON "generated_prompts" USING GIN ((("inputParameters"->>'subject')));
CREATE INDEX IF NOT EXISTS idx_generated_prompts_grade_level ON "generated_prompts" USING GIN ((("inputParameters"->>'gradeLevel')));

-- Statistics update for better query planning
ANALYZE "shared_content";
ANALYZE "generated_prompts";
ANALYZE "content_ratings";
ANALYZE "user_libraries";
ANALYZE "users";