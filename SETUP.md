# SaddleUp Setup Guide

This guide will help you set up and run the SaddleUp application locally.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager
- Anthropic Claude API key

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/saddleup?schema=public"
   JWT_SECRET="your-secret-key-change-in-production"
   ANTHROPIC_API_KEY="your-anthropic-api-key"
   PORT=3001
   NODE_ENV=development
   ```

5. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

6. Push database schema to your database:
   ```bash
   npm run db:push
   ```
   
   Or create a migration:
   ```bash
   npm run db:migrate
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be running on `http://localhost:3001`.

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory (optional):
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3001
   ```

4. Start the Expo development server (defaults to port 3000 for web):
   ```bash
   npm start
   ```
   
   To use a different port:
   ```bash
   expo start --port 3000
   ```

5. Choose how to run the app:
   - Press `w` to open in web browser
   - Press `i` to open iOS simulator (requires Xcode on macOS)
   - Press `a` to open Android emulator (requires Android Studio)
   - Scan QR code with Expo Go app on your device

## Database Setup

### Using PostgreSQL locally:

1. Install PostgreSQL if you haven't already

2. Create a database:
   ```sql
   CREATE DATABASE saddleup;
   ```

3. Update your `.env` file with the correct database connection string

4. Run Prisma migrations:
   ```bash
   cd backend
   npm run db:push
   ```

### Using a cloud database:

For Replit deployment, you can use:
- Supabase (free tier available)
- Neon (free tier available)
- Railway (free tier available)
- Any PostgreSQL-compatible database

## Project Structure

```
SaddleUp/
├── backend/              # Express.js API server
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── lib/         # Utilities (Prisma client, auth, Claude)
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   └── server.ts    # Main server file
│   └── package.json
├── frontend/            # React Native/Expo app
│   ├── app/            # Expo Router pages
│   │   ├── (auth)/     # Authentication screens
│   │   ├── (tabs)/     # Main app tabs
│   │   └── ...
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/me` - Get current user and profile
- `POST /api/user/profile` - Create/update user profile (onboarding)

### Training
- `POST /api/training/generate-plan` - Generate AI training plan
- `GET /api/training/plan` - Get user's training plan
- `GET /api/training/lesson/:lessonId` - Get lesson details
- `PATCH /api/training/lesson/:lessonId/complete` - Mark lesson complete

### Sessions
- `POST /api/sessions` - Log a training session
- `GET /api/sessions` - Get all user sessions
- `GET /api/sessions/:id` - Get session by ID

## Development Notes

- The backend uses TypeScript and runs with `tsx` for development
- The frontend uses Expo Router for file-based routing
- All API calls require authentication via Bearer token (JWT)
- The app uses AsyncStorage for local token storage
- Training plans are generated using Anthropic's Claude API

## Next Steps

1. Add placeholder images to `frontend/assets/`:
   - `icon.png` (1024x1024)
   - `splash.png` (1284x2778)
   - `adaptive-icon.png` (1024x1024)
   - `favicon.png` (48x48)

2. Customize colors and styling in `frontend/app/constants.ts`

3. Add offline support and service worker for PWA functionality

4. Implement skills tracking and milestone features

5. Add safety tips and emergency reference sections

6. Deploy to Replit (backend) and host frontend as static site or deploy both together
