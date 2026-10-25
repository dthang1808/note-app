import bcrypt from 'bcryptjs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { readFile } from 'node:fs/promises';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';
import { getAllowedOrigins } from './middleware/verifyOrigin.js';
import verifyOrigin from './middleware/verifyOrigin.js';
import Note from './models/Note.js';
import User from './models/User.js';
import notesRouter from './routes/notes.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const allowedOrigins = getAllowedOrigins();

if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
  throw new Error('JWT_SECRET must contain at least 32 bytes. Add a secure secret to server/.env.');
}

if (process.env.NODE_ENV === 'production' && allowedOrigins.size === 0) {
  throw new Error('CLIENT_URL is required in production to protect authenticated requests.');
}

app.use(logger);
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '32kb' }));
app.use('/api', verifyOrigin);
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều lần thử. Vui lòng đợi 15 phút rồi thử lại.' },
});
app.use('/api/auth/login', authRateLimit);
app.use('/api/auth/register', authRateLimit);
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use(errorHandler);

async function bootstrapInitialUser() {
  const username = process.env.INITIAL_USER_USERNAME?.trim().toLowerCase();
  const password = process.env.INITIAL_USER_PASSWORD;

  if (!username && !password) return null;
  if (!username || !password || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Set both INITIAL_USER_USERNAME and an INITIAL_USER_PASSWORD of 12–72 bytes.');
  }
  if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
    throw new Error('INITIAL_USER_USERNAME must be 3–32 letters, numbers, dots, underscores, or hyphens.');
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) return existingUser;

  return User.create({
    username,
    passwordHash: await bcrypt.hash(password, 12),
  });
}



async function startServer() {
  await connectDB();
  const initialUser = await bootstrapInitialUser();
  app.listen(port, () => {
    console.log(`Notes API đang chạy tại http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error(
    'MongoDB startup failed. Check MONGODB_URI, Atlas network access, and legacy note data.',
    error,
  );
  process.exit(1);
});
