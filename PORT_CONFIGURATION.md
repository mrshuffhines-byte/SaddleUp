# Port Configuration Guide

## Default Ports

- **Backend API**: Port 3001
- **Frontend (Expo)**: Port 3000 (web), 8081 (Metro bundler)

## Changing Ports

### Backend Port

The backend port can be changed in `backend/.env`:

```env
PORT=3001
```

Change `3001` to your desired port, then restart the backend server.

Update `frontend/app/constants.ts` or set environment variable:

```env
EXPO_PUBLIC_API_URL=http://localhost:YOUR_PORT
```

### Frontend Port (Expo)

#### Web Port

To change the web port, use the `--port` flag:

```bash
npm start -- --port 3000
```

Or edit `frontend/package.json` scripts:

```json
"start": "expo start --port 3000"
```

#### Metro Bundler Port

The Metro bundler (for native) runs on port 8081 by default. To change it:

```bash
expo start --port 8081
```

Or set in `.env`:

```env
RCT_METRO_PORT=8081
```

## Port Conflicts

If you encounter port conflicts:

1. **Check what's using the port:**
   ```bash
   lsof -i :3000  # macOS/Linux
   netstat -ano | findstr :3000  # Windows
   ```

2. **Kill the process** or use a different port

3. **Update all references:**
   - Backend `.env` file
   - Frontend `constants.ts` or `.env`
   - Any hardcoded URLs

## Environment Variables

### Backend
```env
PORT=3001
```

### Frontend
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_WEB_PORT=3000
RCT_METRO_PORT=8081
```

## Common Port Configurations

- **Development (default)**:
  - Backend: 3001
  - Frontend Web: 3000
  - Metro: 8081

- **Alternative setup**:
  - Backend: 5000
  - Frontend Web: 4000
  - Metro: 8082

- **Custom ports**:
  - Set in `.env` files
  - Update package.json scripts if needed
