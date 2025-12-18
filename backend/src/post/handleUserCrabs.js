require("dotenv").config();
const { MongoClient } = require("mongodb");
const Fernet = require("fernet");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set in your environment variables");

const VALID_GAMEMODES = ["oneblock", "earth", "survival", "factions"];

async function handleUserCrabs(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  if (req.headers["content-type"] !== "application/octet-stream") {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Content-Type must be application/octet-stream" })
    );
    return;
  }

  const userName = new URL(req.url, `http://${req.headers.host}`).searchParams.get("name"); // changed from id → name
  const gamemodeHeader = req.headers["x-gamemode"];
  const gamemode = (typeof gamemodeHeader === "string" && gamemodeHeader.length > 0)
    ? gamemodeHeader
    : parsedUrl.searchParams.get("gamemode");

  if (gamemode && !VALID_GAMEMODES.includes(gamemode)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid gamemode" }));
    return;
  }

  if (!userName) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user name in query params" }));
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

    const client = new MongoClient(uri);
    try {
      await client.connect();

      const coreDb = client.db("core_users_data");
      const usersCol = coreDb.collection("users");
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
      } catch (err) {
        console.error("[ERROR] Decryption failed:", err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Decryption failed" }));
        return;
      }

      let data;
      try {
        data = JSON.parse(decryptedStr);
      } catch (err) {
        console.error("[ERROR] Invalid JSON after decryption:", err);
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

      const crabDbName = `user_data_crab${gamemode ? `_${gamemode}` : ""}`;
      const crabDb = client.db(crabDbName);
      const crabCollection = crabDb.collection(user.name);

      const result = await crabCollection.insertOne(data);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: `Crab saved for user ${user.name}`,
          id: result.insertedId.toString(),
        })
      );
    } catch (err) {
      console.error("[ERROR] MongoDB operation failed:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    } finally {
      await client.close();
    }
  });

  req.on("error", (err) => {
    console.error("[ERROR] Request error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error during request" }));
  });
}

module.exports = { handleUserCrabs };