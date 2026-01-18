const mongoose = require('mongoose');

const VALID_GAMEMODES = ['oneblock', 'earth', 'survival', 'factions', 'boxsmp'];
const db = mongoose.connection.db;
class CrabModel {
  static async findByUserAndGamemode(userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const collName = `crab_${userName}_${gamemode}`;
    const crabs = await db.collection(collName).find({}, { projection: { fish: 1, _id: 1, timestamp: 1 } }).toArray();

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

    const users = await db.collection('users').find({}).toArray();

    let total = 0;
    for (const user of users) {
      const coll = `crab_${user.name}_${gamemode}`;
      const count = await db.collection(coll).countDocuments({ fish: 'crab' });
      total += count;
    }

    return total;
  }

  static async deleteById(crabId, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const collName = `crab_${userName}_${gamemode}`;
    let _id;
    try {
      _id = mongoose.Types.ObjectId(crabId);
    } catch {
      return { deletedCount: 0 };
    }
    const result = await db.collection(collName).deleteOne({ _id, fish: 'crab' });
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

    const collName = `crab_${userName}_${gamemode}`;

    const docs = await db.collection(collName).find({}, { projection: { _id: 1 } }).limit(numericCount).toArray();
    if (docs.length === 0) {
      return { deletedCount: 0 };
    }

    const ids = docs.map(d => d._id);
    const result = await db.collection(collName).deleteMany({ _id: { $in: ids } });
    return result;
  }

  static async insertMany(crabData, userName, gamemode) {
    if (!VALID_GAMEMODES.includes(gamemode)) {
      throw new Error('Invalid gamemode');
    }

    const collName = `crab_${userName}_${gamemode}`;

    const formattedCrabData = crabData.map(() => ({ fish: 'crab' }));

    const result = await db.collection(collName).insertMany(formattedCrabData);
    return result;
  }
}

module.exports = CrabModel;