# CORS Fix Notes

## Issue
The frontend at `https://the-rein-training-app.expo.app` was getting CORS errors when trying to access the backend API at `https://api.thereinapp.com`.

## Solution Applied

Updated the CORS configuration in `backend/src/server.ts` to:
1. Explicitly allow `https://the-rein-training-app.expo.app`
2. Use a callback function for dynamic origin checking
3. Allow requests with no origin (for mobile apps)
4. Allow all origins by default (can be restricted later for security)

## Current Configuration

The CORS middleware now:
- Always allows `https://the-rein-training-app.expo.app`
- Allows localhost in development
- Allows origins from `FRONTEND_URL` environment variable
- Allows all other origins (currently permissive for compatibility)

## Next Steps

1. **Redeploy Backend**: The backend needs to be redeployed to Railway for changes to take effect
2. **Check Backend Status**: The 502 Bad Gateway error suggests the backend might not be running. Check Railway dashboard
3. **Verify Environment Variables**: Ensure `FRONTEND_URL` is set on Railway to `https://the-rein-training-app.expo.app`
4. **Test**: After redeploy, test the API endpoint

## Production Security (Future)

For better security in production, you can restrict CORS to only allow specific origins:

```typescript
// More restrictive version (uncomment and use later):
if (!allowedOrigins.includes(origin) && origin !== 'https://the-rein-training-app.expo.app') {
  console.warn('CORS blocked origin:', origin);
  callback(new Error('Not allowed by CORS'));
  return;
}
```

## Troubleshooting

If CORS errors persist:
1. Check backend logs on Railway
2. Verify backend is running (check `/health` endpoint)
3. Test CORS headers using curl:
   ```bash
   curl -H "Origin: https://the-rein-training-app.expo.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -X OPTIONS \
        https://api.thereinapp.com/api/training/generate-plan \
        -v
   ```
4. Check browser console for actual error messages
