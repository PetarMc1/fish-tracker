const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function generateCSRFToken() {
  const payload = {
    type: 'csrf',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  };

  return jwt.sign(payload, JWT_SECRET);
}

function verifyCSRFToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.type === 'csrf';
  } catch {
    return false;
  }
}

function verifyCsrfToken(req, res, next) {
  const original = req.originalUrl || '';
  const isAuthLogin = original.startsWith('/v1/admin/auth/login');
  const isCsrfFetch = original.startsWith('/v1/admin/auth/csrf-token');
  if (isAuthLogin || isCsrfFetch) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  if (!token || !verifyCSRFToken(token)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  next();
}

module.exports = { generateCSRFToken, verifyCSRFToken, verifyCsrfToken };
