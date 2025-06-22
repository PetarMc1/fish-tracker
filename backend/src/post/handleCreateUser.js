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

    console.log('Received name:', name);
    console.log('Received API key:', apiKey);
    console.log('Mongo URI:', MONGO_URI ? 'Present' : 'Missing');

    if (!name) {
      return res.status(400).json({ error: 'Missing "name"' });
    }

    if (apiKey !== CREATE_USER_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Generate ID from random.org
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

    console.log('Random.org response:', randomRes.data);

    const id = randomRes.data?.result?.random?.data?.[0];
    if (!id) {
      return res.status(500).json({ error: 'Failed to generate ID' });
    }

    // 2. Generate Fernet key (32 random bytes base64 encoded)
    const fernetKey = crypto.randomBytes(32).toString('base64');
    console.log('Generated Fernet key:', fernetKey);

    // 3. Insert into MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('MongoDB connected');

    const db = client.db('core_users_data');
    const users = db.collection('users');

    await users.insertOne({
      name,
      id,
      fernetKey,
      createdAt: new Date(),
    });
    console.log('User inserted into DB');

    await client.close();

    // 4. Return result
    return res.status(201).json({ name, id, fernetKey });
  } catch (error) {
    console.error('Error in handleCreateUser:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { handleCreateUser };
