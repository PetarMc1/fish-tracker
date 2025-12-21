require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { verifyCsrfToken, generateCSRFToken } = require("./middleware/csrfProtection");

const { getStatus } = require("./get/getStatus");
const { handleFish } = require("./post/handleUserFish");
const { handleUserCrabs } = require("./post/handleUserCrabs");
const { getUserFish } = require("./get/getUserFish");
const { getUserCrabs } = require("./get/getUserCrabs");
const { getUserFernetKey } = require("./get/getUserFernetKey");
const { getDemoCrabs } = require("./get/getDemoCrabs");
const { getDemoFish } = require("./get/getDemoFish");
const adminAuthRoutes = require("./admin/authRoutes");
const adminRoutes = require("./admin/adminRoutes");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "https://tracker.petarmc.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

const publicLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 25,
  message: { error: "Try again later. Contact the site owner for more info." }
});


function rateLimitWrapper(req, res, next) {
  const key = req.headers["x-api-key"];
  
  if (key && key === process.env.FRONTEND_API_KEY) {
    return next();
  }

  return publicLimiter(req, res, next);
}

app.get("/demo/fish", getDemoFish);
app.get("/demo/crab", getDemoCrabs);

app.get("/admin/auth/csrf-token", (req, res) => {
  const token = generateCSRFToken();
  res.json({ csrfToken: token });
});

app.use(adminAuthRoutes);

app.use('/admin', verifyCsrfToken);
app.use('/admin', adminRoutes);


app.use(rateLimitWrapper);

app.post("/post/fish", handleFish);
app.post("/post/crab", handleUserCrabs);
app.get("/get/user/key", getUserFernetKey);
app.get("/get/fish", getUserFish);
app.get("/get/crab", getUserCrabs);
app.get("/status", getStatus);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, "0.0.0.0");

