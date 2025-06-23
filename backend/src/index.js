const express = require("express");

const { handleFish } = require("./post/handleUserFish");
const { handleUserCrabs } = require("./post/handleUserCrabs");
const { getUserFish } = require("./get/getUserFish");
const { getUserCrabs } = require("./get/getUserCrabs");
const { handleCreateUser } = require("./post/handleCreateUser");
const { getUserFernetKey } = require("./get/getUserFernetKey");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post("/post/fish", (req, res) => handleFish(req, res));
app.post("/post/crab", (req, res) => handleUserCrabs(req, res));
app.get("/get/user/key", (req, res) => getUserFernetKey(req, res));
app.get("/get/fish", (req, res) => getUserFish(req, res));
app.get("/get/crab", (req, res) => getUserCrabs(req, res));
app.post("/create/new/user", (req, res) => handleCreateUser(req, res));
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
