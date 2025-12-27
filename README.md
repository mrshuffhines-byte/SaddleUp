# SaddleUp

An AI-powered horse training app for beginner horse owners.

## Tech Stack

- **Frontend**: React Native with Expo (PWA-enabled)
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Email-based auth
- **AI**: Anthropic Claude API for generating training plans
- **Storage**: Cloudinary for media uploads

## Project Structure

```
SaddleUp/
├── backend/          # Express.js API server
│   ├── prisma/       # Database schema
│   ├── src/          # Source code
│   └── package.json
├── frontend/         # React Native/Expo app
│   ├── app/          # Expo Router pages
│   └── package.json
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your database URL and API keys
   ```

4. Set up database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Seed methods database:
   ```bash
   npm run seed:methods
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Expo development server (runs on port 3000 for web):
   ```bash
   npm start
   ```
   
   To use a different port:
   ```bash
   expo start --port 3000
   ```

## Environment Variables

### Backend (.env)

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `ANTHROPIC_API_KEY`: Anthropic Claude API key
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Features

- ✅ Email-based authentication
- ✅ User onboarding with skill assessment
- ✅ AI-generated personalized training plans
- ✅ Progressive training curriculum (phases > modules > lessons)
- ✅ Session logging with ratings and notes
- ✅ Progress tracking and lesson completion
- ✅ Ask the Trainer chat interface with context-aware AI
- ✅ Horsemanship method selection and method-specific responses
- ✅ Saved answers library
- ✅ Video analysis with timestamp-based feedback
- ✅ Media upload (photos and videos) with Cloudinary integration
- ✅ Enhanced video player with timeline markers and controls
- ✅ Method selection in onboarding flow
- ✅ Method comparison toggle for multi-perspective answers
- ✅ Suggested questions based on current lesson
- ✅ Comprehensive horsemanship methods database (30+ methods)
- ✅ Skills tracking with automatic unlocks
- ✅ Milestone achievements and celebrations
- ✅ Enhanced safety features in lessons
- ✅ Adaptive method blending system (database and API complete, UI pending)
- ✅ Comprehensive horse and facility profiles
- ✅ Clean, approachable UI design
- ✅ PWA-ready for mobile and web

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

1. **Backend:**
   ```bash
   cd backend
   npm install
   # Configure .env file
   npm run db:generate && npm run db:push
   npm run seed:methods
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) - Technical implementation details
- [ASK_TRAINER_IMPLEMENTATION.md](./ASK_TRAINER_IMPLEMENTATION.md) - Ask the Trainer feature details
- [VIDEO_ANALYSIS_IMPLEMENTATION.md](./VIDEO_ANALYSIS_IMPLEMENTATION.md) - Video analysis with timestamps
- [MEDIA_UPLOAD_IMPLEMENTATION.md](./MEDIA_UPLOAD_IMPLEMENTATION.md) - Media upload and video player
- [METHOD_FEATURES_IMPLEMENTATION.md](./METHOD_FEATURES_IMPLEMENTATION.md) - Method selection and comparisons
- [METHOD_DATABASE_EXPANSION.md](./METHOD_DATABASE_EXPANSION.md) - Horsemanship methods database
- [SKILLS_MILESTONES_IMPLEMENTATION.md](./SKILLS_MILESTONES_IMPLEMENTATION.md) - Skills tracking and milestones
- [ADAPTIVE_METHOD_BLENDING.md](./ADAPTIVE_METHOD_BLENDING.md) - Enhanced personalized training with method blending
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Current implementation status

## License

ISC