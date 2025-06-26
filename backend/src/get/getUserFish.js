require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set in environment");

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
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=70, stale-while-revalidate=5");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const userId = url.searchParams.get("id");
  if (!userId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user ID in query params" }));
    return;
  }

  try {
    await clientPromise;
    const coreDb = client.db("core_users_data");
    const fishDb = client.db("user_data_fish");

    const user = await coreDb.collection("users").findOne({ id: userId });
    if (!user || !user.name) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    const fishCollection = fishDb.collection(user.name);

    const cursor = fishCollection.find({}, { projection: { fish: 1, rarity: 1, _id: 0 } });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(`{"user":"${user.name}","fish":[`);

    let first = true;
    for await (const doc of cursor) {
      const fishItem = {
        name: doc.fish,
        rarity: mapRarity(doc.rarity),
      };
      if (!first) res.write(",");
      res.write(JSON.stringify(fishItem));
      first = false;
    }

    res.end("]}");
  } catch (err) {
    console.error("[ERROR] Failed to retrieve fish:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  }
}

module.exports = { getUserFish };
