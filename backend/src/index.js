require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
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

// load OpenAPI specifications from json file
const swaggerSpec = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'openapi.json'), 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "https://tracker.petarmc.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

const publicLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 5) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 25,
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
app.get("/status", getStatus);
app.get("/docs", (req, res) => res.redirect("https://docs.petarmc.com/fish-tracker"));

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

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, "0.0.0.0");

