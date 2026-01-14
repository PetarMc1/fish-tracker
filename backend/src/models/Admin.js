const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

class AdminModel {
  static async findByUsername(username) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const admin = await db.collection('admins').findOne({ username });
    await client.close();
    return admin;
  }

  static async create(adminData) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const result = await db.collection('admins').insertOne({
      ...adminData,
      createdAt: new Date()
    });
    await client.close();
    return result;
  }

  static async findAll() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const admins = await db.collection('admins').find({}).toArray();
    await client.close();
    return admins;
  }

  static async deleteById(id) {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db('core_users_data');
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      const result = await db.collection('admins').deleteOne({ _id });
      return result;
    } finally {
      await client.close();
    }
  }
}

module.exports = AdminModel;