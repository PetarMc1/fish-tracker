require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const { handleFish } = require("./post/handleUserFish");
const { handleUserCrabs } = require("./post/handleUserCrabs");
const { getUserFish } = require("./get/getUserFish");
const { getUserCrabs } = require("./get/getUserCrabs");
const { handleCreateUser } = require("./post/handleCreateUser");
const { getUserFernetKey } = require("./get/getUserFernetKey");
const { getDemoCrabs } = require("./get/getDemoCrabs");
const { getDemoFish } = require("./get/getDemoFish");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  methods: ["GET","POST"],
}));

app.use(express.json());

const publicLimiter = rateLimit({
  windowMs: 4 * 60 * 1000, 
  max: 35,  
  message: { error: "Try again later." }
});


function rateLimitWrapper(req, res, next) {
  const key = req.headers["x-api-key"];
  
  if (key && key === process.env.FRONTEND_API_KEY) {
    return next();
  }

  return publicLimiter(req, res, next);
}

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(rateLimitWrapper);

app.post("/post/fish", handleFish);
app.post("/post/crab", handleUserCrabs);
app.get("/get/user/key", getUserFernetKey);
app.get("/get/fish", getUserFish);
app.get("/get/crab", getUserCrabs);
app.post("/create/new/user", handleCreateUser);
app.get("/demo/fish", getDemoFish);
app.get("/demo/crab", getDemoCrabs);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
