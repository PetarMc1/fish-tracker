const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const db = mongoose.connection.db;
    const admin = await db.collection('admins').findOne({ username: decoded.username });

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.admin || req.admin.role !== role) {
      return res.status(403).json({ error: `Requires ${role} role` });
    }
    next();
  };
}

module.exports = { authenticateAdmin, requireRole };