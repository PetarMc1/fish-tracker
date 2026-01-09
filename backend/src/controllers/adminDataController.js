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

function validateUserId(id) {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Invalid user ID');
  }
  return id;
}

async function getUserFish(req, res) {
  try {
    const { id } = req.params;
    const { gamemode } = req.query;

    if (!gamemode) {
      return res.status(400).json({ error: 'Gamemode required' });
    }

    validateUserId(id);
    validateGamemode(gamemode);

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fish = await FishModel.findByUserAndGamemode(user.name, gamemode);
    res.json({ userId: id, userName: user.name, gamemode, fish });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid request' });
  }
}

async function getUserCrabs(req, res) {
  try {
    const { id } = req.params;
    const { gamemode } = req.query;

    if (!gamemode) {
      return res.status(400).json({ error: 'Gamemode required' });
    }

    validateUserId(id);
    validateGamemode(gamemode);

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const crabs = await CrabModel.findByUserAndGamemode(user.name, gamemode);
    res.json({ userId: id, userName: user.name, gamemode, crabs });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid request' });
  }
}

async function deleteFish(req, res) {
  try {
    const { fishId } = req.params;
    const { userId, gamemode } = req.body;

    if (!userId || !gamemode) {
      return res.status(400).json({ error: 'userId and gamemode required' });
    }

    validateUserId(userId);
    validateGamemode(gamemode);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await FishModel.deleteById(fishId, user.name, gamemode);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Fish not found' });
    }

    res.json({ message: 'Fish deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid request' });
  }
}

async function deleteCrab(req, res) {
  try {
    const { crabId } = req.params;
    const { userId, gamemode } = req.body;

    if (!userId || !gamemode) {
      return res.status(400).json({ error: 'userId and gamemode required' });
    }

    validateUserId(userId);
    validateGamemode(gamemode);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await CrabModel.deleteById(crabId, user.name, gamemode);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Crab not found' });
    }

    res.json({ message: 'Crab deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid request' });
  }
}

async function createFish(req, res) {
  try {
    const { userId, gamemode, fish } = req.body;

    if (!userId || !gamemode || !Array.isArray(fish)) {
      return res.status(400).json({ error: 'userId, gamemode, and fish array required' });
    }

    validateUserId(userId);
    validateGamemode(gamemode);

    if (!Array.isArray(fish) || fish.length === 0) {
      return res.status(400).json({ error: 'Fish array cannot be empty' });
    }
    for (const f of fish) {
      if (!f.name || typeof f.name !== 'string' || f.name.length === 0) {
        return res.status(400).json({ error: 'Each fish must have a valid name' });
      }
      if (typeof f.rarity !== 'number' || f.rarity < 1 || f.rarity > 7) {
        return res.status(400).json({ error: 'Fish rarity must be a number between 1 and 7' });
      }
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fishData = fish.map(f => ({
      fish: f.name,
      rarity: typeof f.rarity === 'string' ? parseInt(f.rarity) : f.rarity
    }));

    await FishModel.insertMany(fishData, user.name, gamemode);
    res.status(201).json({ message: 'Fish created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid request' });
  }
}

async function createCrab(req, res) {
  try {
    const { userId, gamemode, count } = req.body;

    if (!userId || !gamemode || typeof count !== 'number' || count < 1) {
      return res.status(400).json({ error: 'userId, gamemode, and count (number > 0) required' });
    }

    validateUserId(userId);
    validateGamemode(gamemode);

    if (count > 1000) {
      return res.status(400).json({ error: 'Cannot create more than 1000 crabs at once' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const crabData = Array(count).fill().map(() => ({ fish: 'crab' }));

    await CrabModel.insertMany(crabData, user.name, gamemode);
    res.status(201).json({ message: `${count} crab(s) created successfully` });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid request' });
  }
}

module.exports = { getUserFish, getUserCrabs, deleteFish, deleteCrab, createFish, createCrab };