# Railway Deployment - Quick Start

## ✅ Backend is Ready!

All code has been prepared for Railway deployment. Here's what's done:

- ✅ Procfile created
- ✅ package.json scripts updated
- ✅ server.ts configured for production (CORS, health check)
- ✅ railway.json configuration file
- ✅ Prisma schema updated for production
- ✅ Resend email service installed
- ✅ Environment variables documented
- ✅ TypeScript compiles successfully

## 🚀 Next Steps

### 1. Push Code to GitHub

```bash
cd /Users/staciehuffhines/SaddleUp
git add .
git commit -m "Prepare backend for Railway deployment"
git push
```

### 2. Deploy to Railway

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `SaddleUp` repository
5. **Important:** Set Root Directory to `backend`

### 3. Add PostgreSQL Database

1. In Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway auto-creates `DATABASE_URL`

### 4. Add Environment Variables

In your backend service → Variables, add:

```
PERPLEXITY_API_KEY=<your-key>
RESEND_API_KEY=<your-key>
JWT_SECRET=<generate-random-64-char-string>
FRONTEND_URL=https://the-rein-training-app.expo.app
EMAIL_FROM=SaddleUp <onboarding@resend.dev>
NODE_ENV=production
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Set DIRECT_URL

Copy the `DATABASE_URL` value and set:
```
DIRECT_URL=<same-as-DATABASE_URL>
```

### 6. Deploy!

Railway will automatically:
- Install dependencies
- Run `prisma generate` (via postinstall)
- Run `db:push` to set up schema
- Start the server

### 7. Get Your Backend URL

Once deployed, copy your Railway URL (e.g., `https://saddleup-production.up.railway.app`)

### 8. Seed Database

In Railway dashboard → Backend service → Run Command:
```
npm run seed:methods
```

### 9. Update Frontend

Update `frontend/app/constants.ts` with your Railway URL:

```typescript
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  __DEV__ 
    ? 'http://localhost:3001'
    : 'https://your-railway-url.up.railway.app'
);
```

Then redeploy frontend:
```bash
cd frontend
npx expo export --platform web
eas deploy --prod
```

### 10. Test!

- Backend health: `https://your-railway-url.up.railway.app/health`
- Frontend: https://the-rein-training-app.expo.app

## 📚 Full Documentation

See `RAILWAY_DEPLOYMENT.md` for detailed instructions and troubleshooting.

## 🔗 Services Needed

1. **Railway** - Backend hosting: https://railway.app
2. **Resend** - Email service: https://resend.com
3. **Perplexity** - AI API key: https://www.perplexity.ai/settings/api
4. **Expo Hosting** - Frontend (already deployed): https://expo.dev
