const CrabModel = require("../models/Crab");
const UserModel = require("../models/User");

const { isValidGamemode } = require('../utils/validators');

async function getUserCrabs(req, res) {
  const { ensureMethod, requireQueryParam } = require('../utils/requestChecks');
  if (!ensureMethod(req, res, 'GET')) return;
  const userName = requireQueryParam(req, res, 'name');
  if (!userName) return;
  const gamemode = requireQueryParam(req, res, 'gamemode');
  if (!gamemode) return;

  if (!userName) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user name in query params" }));
    return;
  }

  if (!gamemode) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing gamemode parameter" }));
    return;
  }

  if (!isValidGamemode(gamemode)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid gamemode" }));
    return;
  }

  try {
    const user = await UserModel.findByName(userName);
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    const crabs = await CrabModel.findByUserAndGamemode(userName, gamemode);

    if (crabs.length === 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user: user.name, message: "No crabs found for this gamemode" }));
      return;
    }

    const crabNames = crabs.map(c => c.name);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user: user.name, crabs: crabNames }));
  } catch {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  }
}

module.exports = { getUserCrabs };
