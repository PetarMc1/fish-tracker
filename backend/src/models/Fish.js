const mongoose = require('mongoose');

const VALID_GAMEMODES = ['oneblock', 'earth', 'survival', 'factions', 'boxsmp'];
const db = mongoose.connection.db;
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

    const collName = `fish_${userName}_${gamemode}`;
    const fish = await db.collection(collName).find({}, { projection: { fish: 1, rarity: 1, _id: 1, timestamp: 1 } }).toArray();

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

    const users = await db.collection('users').find({}).toArray();

    let total = 0;
    for (const user of users) {
      const coll = `fish_${user.name}_${gamemode}`;
      const count = await db.collection(coll).countDocuments();
      total += count;
    }

    return total;
  }

  static async deleteById(fishId, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const collName = `fish_${userName}_${gamemode}`;
    let _id;
    try {
      _id = mongoose.Types.ObjectId(fishId);
    } catch {
      return { deletedCount: 0 };
    }
    const result = await db.collection(collName).deleteOne({ _id });
    return result;
  }

  static async insertMany(fishData, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const collName = `fish_${userName}_${gamemode}`;
    const result = await db.collection(collName).insertMany(fishData);
    return result;
  }
}

module.exports = FishModel;