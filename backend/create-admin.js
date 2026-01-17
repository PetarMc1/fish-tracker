require('dotenv').config();
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const [,, username = 'admin', password = 'admin'] = process.argv;

if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI not set in .env');
  process.exit(1);
}

(async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    const db = client.db('fishtracker');
    const admins = db.collection('admins');

    const existing = await admins.findOne({ username });
    if (existing) {
      console.error(`Admin already exists: ${username}`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);
    const adminDoc = {
      username,
      password: hashed,
      role: 'superadmin',
      createdAt: new Date(),
    };

    await admins.insertOne(adminDoc);
    console.log('Superadmin created:', username);
  } catch (err) {
    console.error('Failed to create admin:', err.message || err);
    process.exit(1);
  } finally {
    await client.close();
  }
})();
