const crypto = require('crypto');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const UserModel = require('../models/User');

async function getUsers(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const users = await UserModel.findAll(query, { skip, limit, sort: { createdAt: -1 } });
    const total = await UserModel.count(query);

    res.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        createdAt: user.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUsersV2(req, res) {
  try {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const users = await UserModel.findAll(query, { sort: { createdAt: -1 } });

    res.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        createdAt: user.createdAt
      }))
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      createdAt: user.createdAt
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createUser(req, res) {
  try {
    const { name, password } = req.body;
    let userPassword = password;

    if (!name) {
      return res.status(400).json({ error: "Missing name" });
    }

    if (!userPassword) {
      userPassword = crypto.randomBytes(12).toString('hex');
    }

    const randomId = crypto.randomBytes(9).toString('base64url');
    const fernetKey = crypto.randomBytes(32).toString('base64');

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db("fishtracker");
    const users = db.collection("users");

    await users.insertOne({
      name,
      id: randomId,
      userPassword,
      fernetKey,
      createdAt: new Date(),
    });

    await client.close();

    return res.status(201).json({ name, id: randomId, userPassword, fernetKey });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

async function resetUser(req, res) {
  try {
    const { id } = req.params;
    
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be JSON' });
    }
    
    const { type } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'type field is required' });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updateData = {};
    let responseData = { message: `${type} reset successfully`, userId: id };

    if (type === 'password') {
      const newPassword = crypto.randomBytes(6).toString('hex');
      updateData.userPassword = newPassword;
      responseData.newPassword = newPassword;
    } else if (type === 'fernet') {
      const newFernetKey = crypto.randomBytes(32).toString('base64');
      updateData.fernetKey = newFernetKey;
      responseData.newFernetKey = newFernetKey;
    } else {
      return res.status(400).json({ error: 'Invalid reset type' });
    }

    await UserModel.updateById(id, updateData);
    res.json(responseData);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createUserV2(req, res) {
  try {
    const { name, password } = req.body;
    let userPassword = password;

    if (!name) {
      return res.status(400).json({ error: "Missing name" });
    }

    if (!userPassword) {
      userPassword = crypto.randomBytes(12).toString('hex');
    }

    const randomId = crypto.randomBytes(9).toString('base64url');
    const fernetKey = crypto.randomBytes(32).toString('base64');

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db("fishtracker");
    const users = db.collection("users");

    await users.insertOne({
      name,
      id: randomId,
      userPassword,
      fernetKey,
      createdAt: new Date(),
    });
    const apiKey = crypto.randomBytes(24).toString('hex');
    const apiKeys = db.collection('api_keys');
    await apiKeys.insertOne({
      key: apiKey,
      userId: randomId,
      createdAt: new Date(),
    });

    await client.close();

    return res.status(201).json({ name, id: randomId, userPassword, fernetKey, apiKey });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await UserModel.deleteById(id);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function resetUserV2(req, res) {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!type) return res.status(400).json({ error: 'type query param required' });

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let updateData = {};
    let handleApiKey = false;
    let responseData = { message: 'reset successful', userId: id };
    if (type === 'password') {
      const newPassword = crypto.randomBytes(6).toString('hex');
      updateData.userPassword = newPassword;
      responseData.newPassword = newPassword;
    } else if (type === 'fernet') {
      const newFernetKey = crypto.randomBytes(32).toString('base64');
      updateData.fernetKey = newFernetKey;
      responseData.newFernetKey = newFernetKey;
    } else if (type === 'api-key') {
      handleApiKey = true;
    } else {
      return res.status(400).json({ error: 'Invalid reset type' });
    }

    if (Object.keys(updateData).length > 0) {
      await UserModel.updateById(id, updateData);
    }

    if (handleApiKey) {
      const client = new MongoClient(process.env.MONGO_URI);
      try {
        await client.connect();
        const db = client.db("fishtracker");
        const apiKeys = db.collection('api_keys');
        await apiKeys.deleteMany({ userId: id });
        const newApiKey = crypto.randomBytes(24).toString('hex');
        await apiKeys.insertOne({ key: newApiKey, userId: id, createdAt: new Date() });
        responseData.newApiKey = newApiKey;
      } finally {
        await client.close();
      }
    }

    res.json(responseData);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUserV2(req, res) {
  try {
    const { id } = req.params;
    const result = await UserModel.deleteById(id);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db("fishtracker");
      await db.collection('api_keys').deleteMany({ userId: id });
    } finally {
      await client.close();
    }
    res.json({ message: 'User and associated API keys deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}


module.exports = { getUsers, getUsersV2, getUserById, createUser, createUserV2, resetUser, resetUserV2, deleteUser, deleteUserV2 };