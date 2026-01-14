const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/Admin');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


const failedAttempts = new Map();
const cooldowns = new Map();
const MAX_ATTEMPTS = 10;
const COOLDOWN_MINUTES = 2;

async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const now = Date.now();
    const attempts = failedAttempts.get(clientIP) || 0;
    const cooldownUntil = cooldowns.get(clientIP);

    if (cooldownUntil && now < cooldownUntil) {
      const remainingMinutes = Math.ceil((cooldownUntil - now) / (1000 * 60));
      return res.status(429).json({ 
        error: `Too many failed attempts. Try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.` 
      });
    }

    if (attempts >= MAX_ATTEMPTS) {
      const cooldownTime = now + (COOLDOWN_MINUTES * 60 * 1000);
      cooldowns.set(clientIP, cooldownTime);
      failedAttempts.delete(clientIP);
      return res.status(429).json({ 
        error: `Too many failed attempts. Try again in ${COOLDOWN_MINUTES} minutes.` 
      });
    }

    const admin = await AdminModel.findByUsername(username);
    
    const delay = Math.random() * 200 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (!admin) {
      failedAttempts.set(clientIP, attempts + 1);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      failedAttempts.set(clientIP, attempts + 1);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    failedAttempts.delete(clientIP);
    cooldowns.delete(clientIP);

    const token = jwt.sign({ username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, admin: { username: admin.username, role: admin.role } });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMe(req, res) {
  res.json({ admin: { username: req.admin.username, role: req.admin.role } });
}

async function createAdmin(req, res) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await AdminModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminData = { username, password: hashedPassword, role };

    await AdminModel.create(adminData);
    res.status(201).json({ message: 'Admin created successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createAdminV2(req, res) {
  try {
    const { username, password } = req.body;
    const role = req.query.role;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await AdminModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminData = { username, password: hashedPassword, role };

    await AdminModel.create(adminData);
    res.status(201).json({ message: 'Admin created successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function listAdminsV2(req, res) {
  try {
    const admins = await AdminModel.findAll();
    res.json({ admins: admins.map(a => ({ id: a._id ? a._id.toString() : null, name: a.username, role: a.role })) });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteAdminV2(req, res) {
  try {
    const { id } = req.params;
    const result = await AdminModel.deleteById(id);
    if (!result || result.deletedCount === 0) return res.status(404).json({ error: 'Admin not found' });
    res.json({ message: 'Admin deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { adminLogin, getMe, createAdmin, createAdminV2, listAdminsV2, deleteAdminV2 };