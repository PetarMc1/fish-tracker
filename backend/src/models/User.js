const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

class UserModel {
  static async findById(id) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const user = await db.collection('users').findOne({ id });
    await client.close();
    return user;
  }

  static async findByName(name) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const user = await db.collection('users').findOne({ name });
    await client.close();
    return user;
  }

  static async findAll(query = {}, options = {}) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const users = await db.collection('users').find(query, options).toArray();
    await client.close();
    return users;
  }

  static async count(query = {}) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const count = await db.collection('users').countDocuments(query);
    await client.close();
    return count;
  }

  static async updateById(id, updateData) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const result = await db.collection('users').updateOne({ id }, { $set: updateData });
    await client.close();
    return result;
  }

  static async deleteById(id) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('core_users_data');
    const result = await db.collection('users').deleteOne({ id });
    await client.close();
    return result;
  }
}

module.exports = UserModel;