const mongoose = require('mongoose');
const Fernet = require("fernet");

const { isValidGamemode } = require('../utils/validators');

async function handleUserCrabs(req, res) {
  const { ensureMethod, requireHeaderOrQuery } = require('../utils/requestChecks');
  if (!ensureMethod(req, res, 'POST')) return;

  if (req.headers["content-type"] !== "application/octet-stream") {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Content-Type must be application/octet-stream" })
    );
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const userName = url.searchParams.get("name");
  const gamemode = requireHeaderOrQuery(req, res, 'x-gamemode', 'gamemode', 'Missing gamemode parameter');
  if (!gamemode) return;

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

  if (!isValidGamemode(gamemode)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid gamemode" }));
    return;
  }

  let bodyChunks = [];
  req.on("data", (chunk) => bodyChunks.push(chunk));

  req.on("end", async () => {
    if (bodyChunks.length === 0) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Empty request body" }));
      return;
    }

    const rawBody = Buffer.concat(bodyChunks);
    const encryptedString = rawBody.toString("utf-8");

    try {
      const db = mongoose.connection.db;
      const usersCol = db.collection('users');
      const user = await usersCol.findOne({ name: userName });

      if (!user || !user.name || !user.fernetKey) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found or missing data" }));
        return;
      }

      const secret = new Fernet.Secret(user.fernetKey);
      const token = new Fernet.Token({ secret, token: encryptedString });

      let decryptedStr;
      try {
        decryptedStr = token.decode();
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Decryption failed" }));
        return;
      }

      let data;
      try {
        data = JSON.parse(decryptedStr);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Decrypted data is not valid JSON" }));
        return;
      }

      const isValidCrab =
        typeof data === "object" &&
        data !== null &&
        Object.keys(data).length === 1 &&
        data.fish === "crab";

      if (!isValidCrab) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: 'Invalid data. Only {"fish":"crab"} is accepted.',
          })
        );
        return;
      }

      const collName = `crab_${user.name}_${gamemode}`;
      const crabCollection = mongoose.connection.db.collection(collName);

      const result = await crabCollection.insertOne(data);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: `Crab saved for user ${user.name}`,
          id: result.insertedId.toString(),
        })
      );
    } catch {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });

  req.on("error", () => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error during request" }));
  });
}

module.exports = { handleUserCrabs };