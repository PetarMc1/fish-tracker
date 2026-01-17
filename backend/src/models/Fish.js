const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const VALID_GAMEMODES = ['oneblock', 'earth', 'survival', 'factions', 'boxsmp'];

class FishModel {
  static mapRarity(rarity) {
    switch (rarity) {
      case 1: return 'Bronze';
      case 2: return 'Silver';
      case 3: return 'Gold';
      case 4: return 'Diamond';
      case 6: return 'Platinum';
      case 7: return 'Mythical';
      default: return 'Unknown/Other';
    }
  }

  static async findByUserAndGamemode(userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const collName = `fish_${userName}_${gamemode}`;
    const fish = await db.collection(collName).find({}, { projection: { fish: 1, rarity: 1, _id: 1, timestamp: 1 } }).toArray();
    await client.close();

    return fish.map(doc => ({
      id: doc._id.toString(),
      name: doc.fish,
      rarity: this.mapRarity(doc.rarity),
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
      const coll = `fish_${user.name}_${gamemode}`;
      const count = await db.collection(coll).countDocuments();
      total += count;
    }

    await client.close();
    return total;
  }

  static async deleteById(fishId, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const collName = `fish_${userName}_${gamemode}`;
    let _id;
    try {
      _id = new ObjectId(fishId);
    } catch {
      await client.close();
      return { deletedCount: 0 };
    }
    const result = await db.collection(collName).deleteOne({ _id });
    await client.close();
    return result;
  }

  static async insertMany(fishData, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('fishtracker');
    const collName = `fish_${userName}_${gamemode}`;
    const result = await db.collection(collName).insertMany(fishData);
    await client.close();
    return result;
  }
}

module.exports = FishModel;