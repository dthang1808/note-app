export function getAllowedOrigins() {
  const configuredOrigins = (process.env.CLIENT_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localOrigins = process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'];

  return new Set([...configuredOrigins, ...localOrigins]);
}

export default function verifyOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.get('Origin');
  if (!origin || !getAllowedOrigins().has(origin)) {
    return res.status(403).json({ error: 'Nguồn gửi yêu cầu không được phép.' });
  }

  next();
}
