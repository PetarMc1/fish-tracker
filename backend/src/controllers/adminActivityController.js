const UserModel = require('../models/User');
const FishModel = require('../models/Fish');
const CrabModel = require('../models/Crab');

async function getActivity(req, res) {
  try {
    const { limit = 50 } = req.query;

    const users = await UserModel.findAll({}, { limit: parseInt(limit), sort: { createdAt: -1 } });

    const activity = users.map(user => ({
      type: 'user_created',
      userId: user.id,
      userName: user.name,
      timestamp: user.createdAt,
      details: `User ${user.name} registered`
    }));

    const mockActivities = [
      {
        type: 'fish_caught',
        userId: 'demo',
        userName: 'DemoUser',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        details: 'Caught a Diamond fish in survival mode'
      },
      {
        type: 'crab_caught',
        userId: 'demo',
        userName: 'DemoUser',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        details: 'Caught a Platinum crab in factions mode'
      }
    ];

    const allActivity = [...mockActivities, ...activity].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, parseInt(limit));

    res.json({ activity: allActivity });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

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

module.exports = { getActivity, getLeaderboard };