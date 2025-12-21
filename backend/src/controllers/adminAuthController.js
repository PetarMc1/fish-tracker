const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/Admin');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await AdminModel.findByUsername(username);
    
    const delay = Math.random() * 200 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, admin: { username: admin.username, role: admin.role } });
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { adminLogin, getMe, createAdmin };