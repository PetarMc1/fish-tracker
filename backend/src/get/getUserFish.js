require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set in environment");

const VALID_GAMEMODES = ["oneblock", "earth", "survival", "factions"];

const client = new MongoClient(uri);
const clientPromise = client.connect();

function mapRarity(rarity) {
  switch (rarity) {
    case 1: return "Bronze";
    case 2: return "Silver";
    case 3: return "Gold";
    case 4: return "Diamond";
    case 6: return "Platinum";
    case 7: return "Mythical";
    default: return "Unknown/Other";
  }
}

async function getUserFish(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const userName = parsedUrl.searchParams.get("name");
  const gamemode = parsedUrl.searchParams.get("gamemode");

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
    await clientPromise;
    const coreDb = client.db("core_users_data");
    const fishDbName = `user_data_fish_${gamemode}`;
    const fishDb = client.db(fishDbName);


    const user = await coreDb.collection("users").findOne({ name: userName });
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    const fishCollection = fishDb.collection(user.name);

    const cursor = fishCollection.find({}, { projection: { fish: 1, rarity: 1, _id: 0 } });

    const fishDocs = await cursor.toArray();

    if (fishDocs.length === 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user: user.name, message: "No fish found for this gamemode" }));
      return;
    }

    const fish = fishDocs.map(doc => ({
      name: doc.fish,
      rarity: mapRarity(doc.rarity),
    }));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user: user.name, fish }));
  } catch (err) {
    console.error("[ERROR] Failed to retrieve fish:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  }
}

module.exports = { getUserFish };
