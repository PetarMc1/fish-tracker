require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

if (!uri) throw new Error("MONGO_URI is not set in environment");

async function getUserFernetKey(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const userId = url.searchParams.get("id");
  const password = url.searchParams.get("password");

  if (!userId || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user ID or password in query params" }));
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("core_users_data");
    const usersCol = db.collection("users");

    const user = await usersCol.findOne({ id: userId, userPassword: password });

    if (!user || !user.fernetKey) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found or invalid password" }));
      return;
    }
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ fernetKey: user.fernetKey }));
  } catch (err) {
    console.error("[ERROR] Failed to retrieve fernetKey:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  } finally {
    await client.close();
  }
}

module.exports = { getUserFernetKey };
