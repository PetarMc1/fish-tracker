require("dotenv").config();
const mongoose = require('mongoose');

const startTime = Date.now();

async function getStatus(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let dbStatus = "disconnected";
  try {
    if (mongoose.connection && mongoose.connection.db) {
      const adminDb = mongoose.connection.db.admin();
      await adminDb.ping();
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "disconnected";
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
