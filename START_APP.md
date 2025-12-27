# Starting the SaddleUp App

## Quick Start

To run the live app, you need both backend and frontend servers running.

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on **http://localhost:3001**

### 2. Start Frontend Server

In a new terminal:

```bash
cd frontend
npx expo start --port 3000
```

Or use npm script:
```bash
npm start
```

The frontend will run on **http://localhost:3000**

### 3. Access the App

Once both servers are running:

- **Web Browser**: Open http://localhost:3000
- **Mobile Device**: Scan the QR code shown in the terminal
- **iOS Simulator**: Press `i` in the Expo terminal
- **Android Emulator**: Press `a` in the Expo terminal

## Prerequisites

Before starting, make sure you have:

1. **Database Setup**:
   - PostgreSQL running
   - `.env` file configured with `DATABASE_URL`
   - Database created: `npm run db:push` in backend directory
   - Methods seeded: `npm run seed:methods` in backend directory

2. **Environment Variables** (backend/.env):
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for authentication
   - `ANTHROPIC_API_KEY` - Claude API key (for AI features)
   - `CLOUDINARY_*` - Cloudinary credentials (for media uploads)

3. **Dependencies Installed**:
   - Backend: `npm install` in backend directory
   - Frontend: `npm install` in frontend directory

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

- **Backend (3001)**: Change `PORT` in `backend/.env`
- **Frontend (3000)**: Use `expo start --port 4000` (or another port)

### Database Connection Error

Make sure:
- PostgreSQL is running
- `DATABASE_URL` in `.env` is correct
- Database exists (create it if needed)
- Run `npm run db:push` to set up schema

### Expo Command Not Found

Use `npx expo` instead of `expo`:
```bash
npx expo start --port 3000
```

### CORS Errors

Make sure the backend `FRONTEND_URL` in `.env` matches the frontend port:
```env
FRONTEND_URL=http://localhost:3000
```

## Checking Server Status

- **Backend**: Visit http://localhost:3001/api/health
- **Frontend**: Visit http://localhost:3000 (should show the app)

Both should return success responses if running correctly.
