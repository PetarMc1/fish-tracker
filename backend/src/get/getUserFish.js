require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set in environment");

function mapRarity(rarity) {
  switch (rarity) {
    case 1:
      return "Bronze";
    case 2:
      return "Silver";
    case 3:
      return "Gold";
    case 4:
      return "Diamond";
    case 6:
      return "Platinum";
    case 7:
      return "Mythical";
    default:
      return "Unknown/Other";
  }
}

async function getUserFish(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=10, stale-while-revalidate=5");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const userId = new URL(
    req.url,
    `https://${req.headers.host}`
  ).searchParams.get("id");

  if (!userId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user ID in query params" }));
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const coreDb = client.db("core_users_data");
    const usersCol = coreDb.collection("users");
    const user = await usersCol.findOne({ id: userId });

    if (!user || !user.name) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }
    const fishDb = client.db("user_data_fish");
    const fishCollection = fishDb.collection(user.name);

    const fishDocs = await fishCollection
      .find({}, { projection: { fish: 1, rarity: 1, _id: 0 } })
      .toArray();

    const formattedFish = fishDocs.map((doc) => ({
      name: doc.fish,
      rarity: mapRarity(doc.rarity),
    }));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user: user.name, fish: formattedFish }));
  } catch (err) {
    console.error("[ERROR] Failed to retrieve fish:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  } finally {
    await client.close();
  }
}

module.exports = { getUserFish };
