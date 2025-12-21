const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const VALID_GAMEMODES = ['oneblock', 'earth', 'survival', 'factions'];

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
    const fishDb = client.db(`user_data_fish_${gamemode}`);
    const fish = await fishDb.collection(userName).find({}, { projection: { fish: 1, rarity: 1, _id: 1 } }).toArray();
    await client.close();

    return fish.map(doc => ({
      id: doc._id.toString(),
      name: doc.fish,
      rarity: this.mapRarity(doc.rarity)
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
    const fishDb = client.db(`user_data_fish_${gamemode}`);
    
    for (const user of users) {
      const count = await fishDb.collection(user.name).countDocuments();
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
    const fishDb = client.db(`user_data_fish_${gamemode}`);
    let _id;
    try {
      _id = new ObjectId(fishId);
    } catch (e) {
      await client.close();
      return { deletedCount: 0 };
    }
    const result = await fishDb.collection(userName).deleteOne({ _id });
    await client.close();
    return result;
  }

  static async insertMany(fishData, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const fishDb = client.db(`user_data_fish_${gamemode}`);
    const result = await fishDb.collection(userName).insertMany(fishData);
    await client.close();
    return result;
  }
}

module.exports = FishModel;