require("dotenv").config();
const { MongoClient } = require("mongodb");
const FishModel = require("../models/Fish");
const UserModel = require("../models/User");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set in environment");

const VALID_GAMEMODES = ["oneblock", "earth", "survival", "factions"];

async function getUserFish(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const userName = url.searchParams.get("name");
  const gamemode = url.searchParams.get("gamemode");

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

  if (!VALID_GAMEMODES.includes(gamemode)) {
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

    const fish = await FishModel.findByUserAndGamemode(userName, gamemode);

    if (fish.length === 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user: user.name, message: "No fish found for this gamemode" }));
      return;
    }

    const fishData = fish.map(f => ({
      name: f.name,
      rarity: f.rarity,
    }));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user: user.name, fish: fishData }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  }
}

module.exports = { getUserFish };
