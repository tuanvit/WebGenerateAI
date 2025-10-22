-- Database initialization script for production
-- This script sets up the database with proper encoding and collation for Vietnamese language support

-- Ensure UTF-8 encoding for Vietnamese characters
ALTER DATABASE ai_prompt_generator SET timezone TO 'UTC';

-- Create indexes for better performance
-- These will be created after Prisma migrations run

-- Note: Prisma will handle the actual table creation through migrations
-- This script is for additional database configuration