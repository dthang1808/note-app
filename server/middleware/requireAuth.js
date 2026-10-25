import jwt from 'jsonwebtoken';

export default function requireAuth(req, res, next) {
  const token = req.cookies?.session;
  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== 'object' || typeof payload.sub !== 'string') {
      return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ.' });
    }

    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
  }
}
