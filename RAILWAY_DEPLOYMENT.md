# Railway Deployment Guide

## ✅ Completed Setup

The backend has been prepared for Railway deployment with:

- ✅ Procfile created
- ✅ package.json scripts updated for production
- ✅ server.ts updated with production CORS and health check
- ✅ railway.json configuration created
- ✅ Prisma schema updated for production (DIRECT_URL support)
- ✅ Resend email service installed and created
- ✅ env.example updated with all required variables
- ✅ Frontend API_URL configuration updated

## 📋 Railway Deployment Steps

### 1. Create Railway Account & Project

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `SaddleUp` repository
4. Railway will detect it's a monorepo. Set the **Root Directory** to `backend`

### 2. Add PostgreSQL Database

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create a `DATABASE_URL` environment variable
3. Copy the `DATABASE_URL` value (you'll need it for DIRECT_URL)

### 3. Add Environment Variables

In your backend service settings, add these environment variables:

**Required:**
```
DATABASE_URL=<auto-created by Railway PostgreSQL>
DIRECT_URL=<same as DATABASE_URL, or use for connection pooling>
JWT_SECRET=<generate a random 64-character string>
PERPLEXITY_API_KEY=<your-perplexity-api-key>
RESEND_API_KEY=<your-resend-api-key>
FRONTEND_URL=https://the-rein-training-app.expo.app
EMAIL_FROM=SaddleUp <onboarding@resend.dev>
NODE_ENV=production
```

**Optional (for Cloudinary media uploads):**
```
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### 4. Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Set Up Resend

1. Go to https://resend.com and create an account
2. Get your API key from the dashboard
3. For testing, use their default domain: `onboarding@resend.dev`
4. For production, add and verify your own domain

### 6. Deploy

Railway will automatically deploy when you:
- Connect the GitHub repository
- Set the root directory to `backend`
- Add all environment variables

The deployment process will:
1. Install dependencies
2. Run `postinstall` (which runs `prisma generate`)
3. Run `db:push` to set up the database schema
4. Start the server with `npm run start`

### 7. Get Your Railway URL

Once deployed, Railway will provide a URL like:
- `https://saddleup-backend-production.up.railway.app`

Copy this URL!

### 8. Update Frontend API URL

Update the frontend to use your Railway backend URL:

**Option 1: Environment Variable (Recommended)**
1. Create `frontend/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-railway-url.up.railway.app
   ```
2. Rebuild and redeploy:
   ```bash
   cd frontend
   npx expo export --platform web
   eas deploy --prod
   ```

**Option 2: Update constants.ts directly**
Update `frontend/app/constants.ts` with your Railway URL:
```typescript
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  __DEV__ 
    ? 'http://localhost:3001'
    : 'https://your-railway-url.up.railway.app'
);
```

### 9. Seed Database

After first deployment, seed the horsemanship methods:

1. In Railway dashboard, go to your backend service
2. Go to "Settings" → "Service" tab
3. Use the "Run Command" feature
4. Run: `npm run seed:methods`

Or connect via Railway CLI:
```bash
railway run npm run seed:methods
```

### 10. Test Deployment

1. **Health Check:**
   Visit: `https://your-railway-url.up.railway.app/health`
   Should return: `{"status":"ok","timestamp":"...","message":"SaddleUp API is running"}`

2. **Test Login Flow:**
   - Go to https://the-rein-training-app.expo.app
   - Enter your email
   - Check email for verification code
   - Enter code and verify login works

3. **Check Logs:**
   In Railway dashboard, view logs to ensure:
   - Database connection successful
   - Prisma migrations ran
   - Server started successfully
   - No errors in email service

## 🔧 Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running in Railway
- Ensure `DATABASE_URL` includes proper SSL parameters for Railway

**Solution:** Railway PostgreSQL requires SSL. Your `DATABASE_URL` should work automatically, but if you get SSL errors, ensure it includes `?sslmode=require`

### Email Not Sending

**Check Railway Logs:**
- Look for "Email send error" or "RESEND_API_KEY not set"
- Verify `RESEND_API_KEY` is set correctly
- Check `EMAIL_FROM` matches Resend's allowed domains

**Resend Dashboard:**
- Check Resend dashboard for failed sends
- Verify API key is active
- For testing, use: `onboarding@resend.dev`

### CORS Errors

**Frontend can't reach backend:**
- Verify `FRONTEND_URL` environment variable is set
- Check Railway logs for CORS errors
- Ensure frontend URL is in the allowed origins list

### Build Failures

**TypeScript errors:**
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify `tsconfig.json` is correct

**Prisma errors:**
- Ensure `postinstall` script runs `prisma generate`
- Check that `DATABASE_URL` is available during build
- Verify Prisma schema is valid

## 📝 Post-Deployment Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Database migrations ran successfully
- [ ] Methods database seeded
- [ ] Email service working (test login)
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] Environment variables all set
- [ ] Logs show no errors
- [ ] Frontend redeployed with correct API URL

## 🔗 Useful Links

- **Railway Dashboard:** https://railway.app
- **Resend Dashboard:** https://resend.com
- **Expo Hosting:** https://expo.dev
- **Backend Health Check:** `https://your-railway-url.up.railway.app/health`
- **Frontend:** https://the-rein-training-app.expo.app

## 🎉 You're Done!

Once all steps are complete, your SaddleUp app will be fully deployed:
- **Frontend:** https://the-rein-training-app.expo.app
- **Backend:** Your Railway URL
- **Database:** Railway PostgreSQL
- **Email:** Resend
