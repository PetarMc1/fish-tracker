require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

if (!uri) throw new Error("MONGO_URI is not set in environment");

const startTime = Date.now();

async function getStatus(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let dbStatus = "disconnected";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const adminDb = client.db("admin");
    await adminDb.command({ ping: 1 });

    dbStatus = "connected";
  } catch (err) {
    console.error("[STATUS ERROR] Database check failed:", err);
    dbStatus = "disconnected";
  } finally {
    await client.close();
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    ok: dbStatus === "connected",
    service: "fish-tracker-api",
    database: dbStatus,
    version: "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000)
  }));
}

module.exports = { getStatus };
