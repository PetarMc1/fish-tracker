const axios = require('axios');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const RANDOM_ORG_API_KEY = process.env.RANDOM_ORG_API_KEY;
const MONGO_URI = process.env.MONGO_URI;
const CREATE_USER_API_KEY = process.env.CREATE_USER_API_KEY;

async function handleCreateUser(req, res) {
  try {
    const { name } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!name) {
      return res.status(400).json({ error: 'Missing "name"' });
    }

    if (apiKey !== CREATE_USER_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const randomRes = await axios.post('https://api.random.org/json-rpc/4/invoke', {
      jsonrpc: '2.0',
      method: 'generateStrings',
      params: {
        apiKey: RANDOM_ORG_API_KEY,
        n: 1,
        length: 18,
        characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      },
      id: 1,
    });


    const id = randomRes.data?.result?.random?.data?.[0];
    if (!id) {
      return res.status(500).json({ error: 'Failed to generate ID' });
    }

    const fernetKey = crypto.randomBytes(32).toString('base64');

    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db('core_users_data');
    const users = db.collection('users');

    await users.insertOne({
      name,
      id,
      fernetKey,
      createdAt: new Date(),
    });

    await client.close();

    return res.status(201).json({ name, id, fernetKey });
  } catch (error) {
    console.error('Error in handleCreateUser:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { handleCreateUser };
