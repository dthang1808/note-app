import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const COOKIE_NAME = 'session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-password', 12);

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: SESSION_DURATION_MS,
    path: '/',
  };
}

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { username: user.username },
    process.env.JWT_SECRET,
    { subject: user._id.toString(), expiresIn: '7d' },
  );
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function serializeUser(user) {
  return { id: user._id.toString(), username: user.username };
}

function validateCredentials(body) {
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
    return { error: 'Tên đăng nhập phải có 3–32 ký tự: chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.' };
  }

  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    return { error: 'Mật khẩu phải có ít nhất 12 ký tự và tối đa 72 byte.' };
  }

  return { username, password };
}

export async function register(req, res, next) {
  try {
    const credentials = validateCredentials(req.body ?? {});
    if (credentials.error) return res.status(400).json({ error: credentials.error });

    const passwordHash = await bcrypt.hash(credentials.password, 12);
    const user = await User.create({
      username: credentials.username,
      passwordHash,
    });

    setSessionCookie(res, user);
    res.status(201).json({ user: serializeUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Tên đăng nhập này đã được sử dụng.' });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const credentials = validateCredentials(req.body ?? {});
    if (credentials.error) return res.status(400).json({ error: credentials.error });

    const user = await User.findOne({ username: credentials.username }).select('+passwordHash');
    const passwordMatches = await bcrypt.compare(
      credentials.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    setSessionCookie(res, user);
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
}

export function getCurrentUser(req, res) {
  res.json({ user: req.user });
}

export function logout(req, res) {
  const { httpOnly, secure, sameSite, path } = cookieOptions();
  res.clearCookie(COOKIE_NAME, { httpOnly, secure, sameSite, path });
  res.status(204).end();
}
