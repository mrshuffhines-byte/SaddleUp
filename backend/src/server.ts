import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import trainingRoutes from './routes/training';
import sessionRoutes from './routes/session';
import conversationRoutes from './routes/conversation';
import messageRoutes from './routes/message';
import savedAnswerRoutes from './routes/savedAnswer';
import methodRoutes from './routes/method';
import mediaRoutes from './routes/media';
import horseRoutes from './routes/horse';
import facilityRoutes from './routes/facility';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'https://the-rein-training-app.expo.app',
  process.env.FRONTEND_URL,
].filter((origin): origin is string => typeof origin === 'string');

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/saved-answers', savedAnswerRoutes);
app.use('/api/methods', methodRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/horses', horseRoutes);
app.use('/api/facilities', facilityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'SaddleUp API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'SaddleUp API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
