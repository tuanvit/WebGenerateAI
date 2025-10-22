# Database Migrations

This directory contains Prisma migrations for the AI Prompt Generator for Teachers application.

## Running Migrations

To set up the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (requires running PostgreSQL database)
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

## Database Schema Overview

The schema includes the following main tables:

- **users**: Teacher profiles with subjects and grade levels (6-9 only)
- **generated_prompts**: AI prompts created by teachers
- **shared_content**: Community-shared lesson plans and prompts
- **content_ratings**: User ratings for shared content
- **user_libraries**: Personal saved content references
- **prompt_versions**: Version history for prompt iterations
- **accounts/sessions**: NextAuth.js authentication tables

## Seed Data

The seed script creates sample Vietnamese teachers and educational content including:
- 3 sample teacher accounts with Vietnamese names and schools
- Generated prompts for Math and Literature subjects
- Shared content with community ratings
- User library entries demonstrating content saving

All seed data follows Vietnamese educational standards (GDPT 2018, CV 5512) and includes appropriate Vietnamese terminology.