# Quick Start Guide

## To Run the App

### 1. Backend Setup

First, set up the backend:

```bash
cd backend
npm install
```

Create a `.env` file:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A random secret key for authentication
- `PERPLEXITY_API_KEY` - Your Perplexity API key (optional for basic functionality)

Then set up the database:
```bash
npm run db:generate
npm run db:push
npm run seed:methods
```

Start the backend:
```bash
npm run dev
```

The backend will run on **http://localhost:3001**

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend will run on **http://localhost:3000**

### 3. Access the App

Open your browser and go to: **http://localhost:3000**

## Troubleshooting

**Backend won't start?**
- Make sure dependencies are installed: `cd backend && npm install`
- Check that `.env` file exists
- Verify PostgreSQL is running (if using local database)
- Check for port conflicts: `lsof -ti:3001`

**Frontend won't start?**
- Make sure dependencies are installed: `cd frontend && npm install`
- Check for port conflicts: `lsof -ti:3000`
- Use `npx expo start --port 3000` if needed

**Connection refused errors?**
- Make sure backend is running first
- Check that backend is on port 3001
- Verify CORS settings in backend/src/server.ts

**Database errors?**
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Run `npm run db:push` to set up schema
