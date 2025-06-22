require("dotenv").config();
const { MongoClient } = require("mongodb");
const Fernet = require("fernet");

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("MONGO_URI is not set in your environment variables.");
}

async function handleFish(req, res) {
  console.log("Received request:", req.method, req.headers["content-type"]);

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

  const userId = new URL(
    req.url,
    `http://${req.headers.host}`
  ).searchParams.get("id");

  if (!userId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing user ID in query params" }));
    return;
  }

  let bodyChunks = [];
  req.on("data", (chunk) => bodyChunks.push(chunk));

  req.on("end", async () => {
    const rawBody = Buffer.concat(bodyChunks);
    const encryptedString = rawBody.toString("utf-8");

    const client = new MongoClient(uri);

    try {
      await client.connect();

      const coreDb = client.db("core_users_data");
      const usersCollection = coreDb.collection("users");

      const user = await usersCollection.findOne({ id: userId });

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }

      if (!user.fernetKey || !user.name) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "User record incomplete (missing name or fernetKey)",
          })
        );
        return;
      }

      const secret = new Fernet.Secret(user.fernetKey);
      const token = new Fernet.Token({
        secret,
        token: encryptedString,
        ttl: 0,
      });

      let decryptedStr;
      try {
        decryptedStr = token.decode();
      } catch (err) {
        console.error("Decryption failed:", err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Decryption failed or invalid token" })
        );
        return;
      }

      let data;
      try {
        data = JSON.parse(decryptedStr);
      } catch (err) {
        console.error("JSON parse error:", err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid decrypted JSON" }));
        return;
      }

      if (typeof data.fish !== "string" || typeof data.rarity !== "number") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error:
              "Invalid data: must contain 'fish' (string) and 'rarity' (number)",
          })
        );
        return;
      }
      
      const userDataDb = client.db("user_data_fish");
      const fishCollection = userDataDb.collection(user.name);

      const result = await fishCollection.insertOne(data);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: `Fish saved for user ${user.name}`,
          id: result.insertedId.toString(),
        })
      );
    } catch (err) {
      console.error("Server error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    } finally {
      await client.close();
    }
  });

  req.on("error", (err) => {
    console.error("Request error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error during request" }));
  });
}

module.exports = { handleFish };
