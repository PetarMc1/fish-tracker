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
    const crabDb = client.db(`user_data_crab_${gamemode}`);
    const crabs = await crabDb.collection(userName).find({}, { projection: { fish: 1, _id: 1, timestamp: 1 } }).toArray();
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
    const coreDb = client.db('core_users_data');
    const users = await coreDb.collection('users').find({}).toArray();
    
    let total = 0;
    const crabDb = client.db(`user_data_crab_${gamemode}`);
    
    for (const user of users) {
      const count = await crabDb.collection(user.name).countDocuments({ fish: 'crab' });
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
    const crabDb = client.db(`user_data_crab_${gamemode}`);
    let _id;
    try {
      _id = new ObjectId(crabId);
    } catch {
      await client.close();
      return { deletedCount: 0 };
    }
    const result = await crabDb.collection(userName).deleteOne({ _id, fish: 'crab' });
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
    const crabDb = client.db(`user_data_crab_${gamemode}`);

    const docs = await crabDb.collection(userName).find({}, { projection: { _id: 1 } }).limit(numericCount).toArray();
    if (docs.length === 0) {
      await client.close();
      return { deletedCount: 0 };
    }

    const ids = docs.map(d => d._id);
    const result = await crabDb.collection(userName).deleteMany({ _id: { $in: ids } });
    await client.close();
    return result;
  }

  static async insertMany(crabData, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const crabDb = client.db(`user_data_crab_${gamemode}`);
    
    const formattedCrabData = crabData.map(() => ({ fish: 'crab' }));
    
    const result = await crabDb.collection(userName).insertMany(formattedCrabData);
    await client.close();
    return result;
  }
}

module.exports = CrabModel;