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

  if ([...url.searchParams.keys()].length > 0) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "This endpoint requires HTTP Basic Auth; query params are not allowed." }));
    return;
  }

  const auth = req.headers["authorization"];
  if (!auth || typeof auth !== "string" || !auth.toLowerCase().startsWith("basic ")) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Authorization header with Basic credentials required" }));
    return;
  }

  let userName = null;
  let password = null;
  try {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx === -1) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid authorization format" }));
      return;
    }
    userName = decoded.slice(0, idx);
    password = decoded.slice(idx + 1);
  } catch (e) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid authorization" }));
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("core_users_data");
    const users = db.collection("users");

    const user = await users.findOne({ name: userName, userPassword: password });

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
