const gamemodes = require('../config/gamemodes');

function isValidGamemode(gamemode) {
  return typeof gamemode === 'string' && gamemodes.includes(gamemode);
}

function validateGamemode(gamemode) {
  if (!isValidGamemode(gamemode)) throw new Error('Invalid gamemode');
  return gamemode;
}

function validateUserId(id) {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Invalid user ID');
  }
  return id;
}

module.exports = { isValidGamemode, validateGamemode, validateUserId };
