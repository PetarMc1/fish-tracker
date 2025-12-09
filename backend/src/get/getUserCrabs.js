require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set in environment");

async function getUserCrabs(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // Get the 'name' query parameter instead of 'id'
  const userName = new URL(req.url, `http://${req.headers.host}`).searchParams.get("name");

  if (!userName) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user name in query params" }));
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const coreDb = client.db("core_users_data");
    const usersCol = coreDb.collection("users");

 
    const user = await usersCol.findOne({ name: userName });

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    const crabDb = client.db("user_data_crab");
    const crabCollection = crabDb.collection(user.name);

    const crabDocs = await crabCollection
      .find({}, { projection: { fish: 1, _id: 0 } })
      .toArray();
    const crabs = crabDocs.map((doc) => doc.fish);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user: user.name, crabs }));
  } catch (err) {
    console.error("[ERROR] Failed to retrieve crabs:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  } finally {
    await client.close();
  }
}

module.exports = { getUserCrabs };
