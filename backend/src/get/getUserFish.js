require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set in environment");

// Create one MongoClient and connect once
const client = new MongoClient(uri);
const clientPromise = client.connect();

async function getUserFish(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=70, stale-while-revalidate=5");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const userId = new URL(req.url, `https://${req.headers.host}`).searchParams.get("id");

  if (!userId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user ID in query params" }));
    return;
  }

  try {
    await clientPromise; // wait for connection once

    const coreDb = client.db("core_users_data");
    const fishDb = client.db("user_data_fish");

    const user = await coreDb.collection("users").findOne({ id: userId });

    if (!user || !user.name) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    const fishCollection = fishDb.collection(user.name);

    // Aggregate with rarity mapping in MongoDB
    const fishDocs = await fishCollection.aggregate([
      {
        $project: {
          _id: 0,
          name: "$fish",
          rarity: {
            $switch: {
              branches: [
                { case: { $eq: ["$rarity", 1] }, then: "Bronze" },
                { case: { $eq: ["$rarity", 2] }, then: "Silver" },
                { case: { $eq: ["$rarity", 3] }, then: "Gold" },
                { case: { $eq: ["$rarity", 4] }, then: "Diamond" },
                { case: { $eq: ["$rarity", 6] }, then: "Platinum" },
                { case: { $eq: ["$rarity", 7] }, then: "Mythical" },
              ],
              default: "Unknown/Other",
            },
          },
        },
      },
    ]).toArray();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user: user.name, fish: fishDocs }));
  } catch (err) {
    console.error("[ERROR] Failed to retrieve fish:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  }
}

module.exports = { getUserFish };
