const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const VALID_GAMEMODES = ['oneblock', 'earth', 'survival', 'factions', 'boxsmp'];

class CrabModel {
  static async findByUserAndGamemode(userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const collName = `crab_${userName}_${gamemode}`;
    const crabs = await db.collection(collName).find({}, { projection: { fish: 1, _id: 1, timestamp: 1 } }).toArray();
    await client.close();

    return crabs.map(doc => ({
      id: doc._id.toString(),
      fish: doc.fish, 
      timestamp: doc.timestamp
    }));
  }

  static async countByGamemode(gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const users = await db.collection('users').find({}).toArray();

    let total = 0;
    for (const user of users) {
      const coll = `crab_${user.name}_${gamemode}`;
      const count = await db.collection(coll).countDocuments({ fish: 'crab' });
      total += count;
    }

    await client.close();
    return total;
  }

  static async deleteById(crabId, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const collName = `crab_${userName}_${gamemode}`;
    let _id;
    try {
      _id = new ObjectId(crabId);
    } catch {
      await client.close();
      return { deletedCount: 0 };
    }
    const result = await db.collection(collName).deleteOne({ _id, fish: 'crab' });
    await client.close();
    return result;
  }

  static async deleteCount(userName, gamemode, count) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const numericCount = parseInt(count, 10);
    if (Number.isNaN(numericCount) || numericCount < 1) {
      throw new Error('Invalid count');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const collName = `crab_${userName}_${gamemode}`;

    const docs = await db.collection(collName).find({}, { projection: { _id: 1 } }).limit(numericCount).toArray();
    if (docs.length === 0) {
      await client.close();
      return { deletedCount: 0 };
    }

    const ids = docs.map(d => d._id);
    const result = await db.collection(collName).deleteMany({ _id: { $in: ids } });
    await client.close();
    return result;
  }

  static async insertMany(crabData, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const collName = `crab_${userName}_${gamemode}`;

    const formattedCrabData = crabData.map(() => ({ fish: 'crab' }));

    const result = await db.collection(collName).insertMany(formattedCrabData);
    await client.close();
    return result;
  }
}

module.exports = CrabModel;