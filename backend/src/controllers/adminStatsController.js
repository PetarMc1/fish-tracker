const UserModel = require('../models/User');
const FishModel = require('../models/Fish');
const CrabModel = require('../models/Crab');

const VALID_GAMEMODES = ['oneblock', 'earth', 'survival', 'factions', 'boxsmp'];

function validateGamemode(gamemode) {
  if (!VALID_GAMEMODES.includes(gamemode)) {
    throw new Error('Invalid gamemode');
  }
  return gamemode;
}

async function getStats(req, res) {
  try {
    const totalUsers = await UserModel.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await UserModel.count({ createdAt: { $gte: thirtyDaysAgo } });

    const fishStats = {};
    const crabStats = {};
    let totalFish = 0;
    let totalCrabs = 0;

    for (const gamemode of VALID_GAMEMODES) {
      try {
        validateGamemode(gamemode);
        
        const fishCount = await FishModel.countByGamemode(gamemode);
        const crabCount = await CrabModel.countByGamemode(gamemode);
        fishStats[gamemode] = fishCount;
        crabStats[gamemode] = crabCount;
        totalFish += fishCount;
        totalCrabs += crabCount;
      } catch {
        fishStats[gamemode] = 0;
        crabStats[gamemode] = 0;
      }
    }

    const avgFishPerUser = totalUsers > 0 ? Math.round(totalFish / totalUsers) : 0;
    const avgCrabsPerUser = totalUsers > 0 ? Math.round(totalCrabs / totalUsers) : 0;

    res.json({
      totalUsers,
      recentUsers,
      totalFish,
      totalCrabs,
      avgFishPerUser,
      avgCrabsPerUser,
      fishByGamemode: fishStats,
      crabsByGamemode: crabStats
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getStats };