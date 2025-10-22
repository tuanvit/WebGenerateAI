# Technology Stack & Build System

## Core Technologies
- **Framework**: Next.js with TypeScript for full-stack development
- **Database**: PostgreSQL for robust data storage and complex queries
- **Authentication**: NextAuth.js for secure user management
- **Styling**: Modern CSS/Tailwind CSS for responsive design
- **Deployment**: Vercel or Docker containers

## Development Standards
- **Language**: TypeScript for type safety and better developer experience
- **Code Quality**: ESLint + Prettier for consistent code formatting
- **Testing**: Jest for unit tests, integration tests for API endpoints
- **Database**: Use repository pattern for data access operations
- **Error Handling**: Comprehensive Vietnamese language error messages

## Project Structure
```
├── pages/api/          # Next.js API routes
├── components/         # Reusable UI components
├── services/          # Business logic layer
├── lib/               # Utility functions and configurations
├── types/             # TypeScript type definitions
├── prisma/            # Database schema and migrations
└── tests/             # Test files
```

## Common Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma migrate dev  # Run database migrations
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open database GUI

# Testing
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:e2e       # Run end-to-end tests

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## Key Integrations
- **AI Tools**: Direct integration with ChatGPT, Gemini, Copilot, Canva AI, Gamma App
- **Vietnamese Language**: Full UTF-8 support for Vietnamese characters
- **Educational Standards**: Built-in compliance with GDPT 2018 and CV 5512