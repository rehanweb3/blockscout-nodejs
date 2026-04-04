import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const secret = process.env.ADMIN_JWT_SECRET || 'admin_secret_fallback';
  try {
    jwt.verify(token, secret);
    next();
  } catch (_) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
