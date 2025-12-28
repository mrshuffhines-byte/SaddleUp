# Accessing the Live SaddleUp App

## 🚀 Your App is Running!

Both servers have been started. Here's how to access them:

### **Frontend (Web App)**
Open in your browser: **http://localhost:3000**

### **Backend API**
API is running at: **http://localhost:3001**

## Quick Access Links

- **Main App**: http://localhost:3000
- **API Health Check**: http://localhost:3001/api/health
- **API Base URL**: http://localhost:3001/api

## What You'll See

When you visit http://localhost:3000, you should see:

1. **Login/Signup Screen** - Create an account or login
2. **Onboarding Flow** - Complete your profile and select horsemanship method
3. **Dashboard** - View your training plan and progress
4. **Training Plan** - Browse phases, modules, and lessons
5. **Sessions** - Log and review training sessions
6. **Ask Trainer** - Chat with AI trainer
7. **Skills** - View unlocked skills and milestones

## If You Need to Restart

### Backend:
```bash
cd backend
npm run dev
```

### Frontend:
```bash
cd frontend
npx expo start --port 3000
```

## Troubleshooting

**Port 3000 or 3001 already in use?**
- Kill existing processes: `lsof -ti:3000 | xargs kill` (repeat for 3001)
- Or use different ports

**Can't see the app?**
- Make sure both servers are running
- Check terminal output for errors
- Try refreshing the browser

**Database errors?**
- Ensure PostgreSQL is running
- Check `.env` file has correct `DATABASE_URL`
- Run `npm run db:push` in backend directory

Enjoy your SaddleUp app! 🐴

