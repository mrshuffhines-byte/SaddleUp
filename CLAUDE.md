# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Backend (Express.js + TypeScript + Prisma)
```bash
cd backend
npm install
npm run dev              # Start dev server with hot reload (tsx watch)
npm run build            # Compile TypeScript
npm run start            # Run compiled production build
```

### Database (Prisma + PostgreSQL)
```bash
cd backend
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database (no migration)
npm run db:migrate       # Deploy migrations
npm run db:migrate:dev   # Create new migration
npm run db:studio        # Open Prisma Studio GUI
npm run db:test          # Test database connection
npm run seed:methods     # Seed horsemanship methods data
```

### Frontend (React Native + Expo)
```bash
cd frontend
npm install
npm start                # Start Expo dev server on port 3000
npm run web              # Web only
npm run ios              # iOS simulator
npm run android          # Android emulator
```

## Architecture Overview

### Backend Structure (`backend/src/`)
- **server.ts**: Express app entry point with CORS and route mounting
- **routes/**: REST API endpoints (auth, training, session, conversation, horse, facility, media, method)
- **lib/**: Core utilities
  - `prisma.ts`: Database client singleton
  - `auth.ts`: JWT authentication helpers
  - `perplexity.ts`: AI API integration for training plan generation and chat
  - `cloudinary.ts`: Media upload handling
  - `context-builder.ts`: Builds context for AI responses from user profile/horse/facility data
  - `skills.ts`: Skills unlocking logic
- **middleware/**: Express middleware (auth)

### Frontend Structure (`frontend/`)
- **app/**: Expo Router file-based routing
  - `(auth)/`: Login and signup screens
  - `(tabs)/`: Main app tabs (dashboard, plan, chat, sessions, skills)
  - `onboarding.tsx`: Multi-step user onboarding flow
  - `constants.ts` / `theme.ts`: App styling and theming
- **components/**: Reusable UI components
- **lib/**: Frontend utilities (API client)

### Key Data Models (Prisma)
- **User** → UserProfile, TrainingPlan[], Horse[], Facility[], Conversation[]
- **TrainingPlan** → Lesson[] (phases > modules > lessons hierarchy stored in `generatedContent` JSON)
- **Horse**: Comprehensive horse profile with temperament, training history, health conditions
- **Facility**: Training location details (arena, footing, obstacles)
- **Conversation** → Message[]: Chat history with AI trainer
- **HorsemanshipMethod**: 30+ training methodologies for context-aware AI responses

### API Authentication
All API routes except auth endpoints require Bearer token (JWT) in Authorization header. Tokens stored in AsyncStorage on frontend.

## Environment Variables

### Backend (.env)
Required: `DATABASE_URL`, `JWT_SECRET`, `PERPLEXITY_API_KEY`
Optional: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `PORT` (default 3001)

### Frontend
Optional: `EXPO_PUBLIC_API_URL` (defaults to localhost:3001)

## Ports
- Backend API: 3001
- Frontend Expo: 3000
