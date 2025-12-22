const UserModel = require('../models/User');
const FishModel = require('../models/Fish');
const CrabModel = require('../models/Crab');

async function getLeaderboard(req, res) {
  try {
    const { type, gamemode } = req.query;

    if (!type || !gamemode) {
      return res.status(400).json({ error: 'type and gamemode required' });
    }

    if (!['fish', 'crab'].includes(type)) {
      return res.status(400).json({ error: 'type must be fish or crab' });
    }

    const users = await UserModel.findAll();

    const leaderboard = [];

    for (const user of users) {
      let count = 0;
      if (type === 'fish') {
        const fish = await FishModel.findByUserAndGamemode(user.name, gamemode);
        count = fish.length;
      } else {
        const crabs = await CrabModel.findByUserAndGamemode(user.name, gamemode);
        count = crabs.length;
      }

      leaderboard.push({
        userId: user.id,
        userName: user.name,
        count
      });
    }

    leaderboard.sort((a, b) => b.count - a.count);

    res.json({ type, gamemode, leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getLeaderboard };