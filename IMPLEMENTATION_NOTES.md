# SaddleUp Implementation Notes

## What Has Been Implemented

### ✅ Backend (Express.js + TypeScript)

1. **Database Schema (Prisma)**
   - User model with authentication
   - UserProfile model for onboarding data
   - TrainingPlan model with AI-generated content
   - Lesson model with hierarchical structure (phases > modules > lessons)
   - Session model for logging training sessions
   - Skill and UserSkill models (schema ready, implementation pending)

2. **Authentication System**
   - Email-based signup with password hashing (bcrypt)
   - JWT token-based authentication
   - Protected routes with middleware

3. **API Endpoints**
   - `/api/auth/signup` - User registration
   - `/api/auth/login` - User login
   - `/api/user/me` - Get current user with profile and plan
   - `/api/user/profile` - Create/update user profile (onboarding)
   - `/api/training/generate-plan` - Generate AI training plan
   - `/api/training/plan` - Get user's training plan
   - `/api/training/lesson/:lessonId` - Get lesson details
   - `/api/training/lesson/:lessonId/complete` - Mark lesson complete
   - `/api/sessions` - Create and list training sessions
   - `/api/sessions/:id` - Get session by ID

4. **AI Integration**
   - Perplexity API integration for generating personalized training plans
   - Structured prompt that creates phases > modules > lessons hierarchy
   - Safety-conscious plan generation with professional instruction flags

### ✅ Frontend (React Native/Expo)

1. **Authentication Screens**
   - Login screen
   - Signup screen
   - Automatic token storage and validation

2. **Onboarding Flow**
   - Multi-step form (4 steps)
   - Experience level selection
   - Goal selection
   - Time availability (days per week, session length)
   - Horse ownership and details
   - Automatically generates training plan after completion

3. **Main App Screens**
   - Dashboard: Overview, next lesson, plan summary
   - Training Plan: Full hierarchical view (phases > modules > lessons)
   - Sessions: History of logged sessions
   - Lesson Detail: Complete lesson view with instructions, logging

4. **Features**
   - Session logging with rating, duration, notes, horse notes
   - Lesson completion tracking
   - Progress visualization through plan structure
   - Clean, warm UI with earth tones (#8B7355 brown, #F5F1EA beige, #A8C09A sage green)

### ✅ Project Structure

```
SaddleUp/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Complete database schema
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts        # Prisma client
│   │   │   ├── auth.ts          # Password hashing, JWT
│   │   │   └── claude.ts        # Perplexity API integration (training plans)
│   │   │   └── perplexity.ts    # Perplexity API helper functions
│   │   ├── middleware/
│   │   │   └── auth.ts          # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts          # Auth endpoints
│   │   │   ├── user.ts          # User/profile endpoints
│   │   │   ├── training.ts      # Training plan/lesson endpoints
│   │   │   └── session.ts       # Session endpoints
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   └── server.ts            # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx
│   │   │   ├── plan.tsx
│   │   │   └── sessions.tsx
│   │   ├── lesson/
│   │   │   └── [lessonId].tsx
│   │   ├── onboarding.tsx
│   │   ├── constants.ts         # App constants (colors, API URL)
│   │   ├── _layout.tsx          # Root layout
│   │   └── index.tsx            # Entry point with auth check
│   ├── lib/
│   │   └── api.ts               # API client utility
│   ├── assets/                  # Image assets (add your images)
│   ├── app.json                 # Expo configuration (PWA-ready)
│   ├── package.json
│   └── tsconfig.json
├── README.md
├── SETUP.md
└── .gitignore
```

## What's Pending (Future Enhancements)

1. **Skills & Milestones**
   - Skills model exists in schema but not implemented in API/frontend
   - Milestone tracking UI
   - Skills checklist UI

2. **Safety Features**
   - Safety tips contextual to lessons (can be added to lesson content)
   - "Get Professional Help" flags (already in lesson content schema)
   - Emergency reference section UI

3. **PWA Features**
   - Service worker for offline support
   - Push notifications (optional)
   - Install prompt optimization

4. **Additional Features**
   - Profile editing
   - Plan regeneration/updates
   - Progress statistics/analytics
   - Photo uploads for sessions
   - Social features (optional)

## Environment Variables Needed

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/saddleup?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
PERPLEXITY_API_KEY="your-perplexity-api-key"
PORT=3001
NODE_ENV=development
```

### Frontend (.env) - Optional
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Next Steps to Run

1. **Backend:**
   ```bash
   cd backend
   npm install
   # Create .env file with your credentials
   npm run db:generate
   npm run db:push
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   # Add image assets to frontend/assets/
   npm start
   ```

3. **Testing:**
   - Create an account
   - Complete onboarding
   - View generated training plan
   - Complete a lesson
   - Log a session
   - View progress

## Design Decisions

1. **Training Plan Structure**: Stored as JSON in database for flexibility, with individual Lesson records for queryability and progress tracking

2. **Authentication**: JWT tokens stored in AsyncStorage for mobile, works seamlessly for web PWA

3. **AI Prompt**: Structured to always include safety considerations, foundational skills, and professional instruction flags

4. **UI Colors**: Warm, approachable earth tones to make the app feel welcoming rather than intimidating for beginners

5. **File-based Routing**: Using Expo Router for intuitive navigation and code organization

## Notes for Deployment

- Backend can be deployed to Replit, Railway, Render, or any Node.js hosting
- Frontend can be built as static site (`expo export`) and hosted on Vercel, Netlify, or similar
- For Replit, ensure environment variables are set in the Replit secrets
- Database should be a managed PostgreSQL service (Supabase, Neon, etc.) for production
