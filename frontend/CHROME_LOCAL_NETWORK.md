# Chrome Local Network Request Compatibility

## Overview

Chrome is implementing restrictions on local network requests to improve security. This document explains how the app handles these restrictions.

## What Changed in Chrome

Chrome will:
1. **Require explicit user permission** before sites can make requests to:
   - Private IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
   - `.local` domains
   - Loopback addresses (localhost, 127.0.0.1)

2. **Block local network requests** from non-secure contexts (HTTP sites)

3. Allow HTTP requests to localhost if the user grants permission

## How This App Handles It

### Development

- **Localhost (HTTP)**: ✅ Supported
  - The app uses `http://localhost:3001` in development
  - Chrome will prompt users to grant permission for localhost access
  - This is safe for development

### Production

- **HTTPS Public Domain**: ✅ Fully supported
  - Production uses `https://api.thereinapp.com` (or your configured domain)
  - No restrictions apply to public HTTPS endpoints

### Recommendations

1. **Always use HTTPS in production** - Never use HTTP or private IPs in production
2. **Use environment variables** - Set `EXPO_PUBLIC_API_URL` for different environments
3. **Development workflow**:
   - Grant localhost permission when Chrome prompts
   - Use HTTPS if you need to test production-like behavior
   - Consider using ngrok or similar for testing on real devices

### Configuration

Set the API URL via environment variable:

```bash
# Development
EXPO_PUBLIC_API_URL=http://localhost:3001

# Production
EXPO_PUBLIC_API_URL=https://api.thereinapp.com
```

### Testing

To test local network restrictions:

1. Build the web version: `npx expo export --platform web`
2. Serve it over HTTPS (required for testing local network requests)
3. Chrome will prompt for permission when accessing localhost

### Future Considerations

If you need to access private IPs or `.local` domains in production:

1. **Use HTTPS** with a public domain
2. **Set up a proxy** that forwards requests from your public domain to local services
3. **Consider using a service** like ngrok, Cloudflare Tunnel, or similar

## Resources

- [Chrome Security Blog: Private Network Access](https://developer.chrome.com/blog/private-network-access/)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [W3C: Private Network Access](https://wicg.github.io/private-network-access/)

