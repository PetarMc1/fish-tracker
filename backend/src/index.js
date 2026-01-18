require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const { verifyCsrfToken, generateCSRFToken } = require("./middleware/csrfProtection");
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const { getStatus } = require("./get/getStatus");
const { handleFish } = require("./post/handleUserFish");
const { handleUserCrabs } = require("./post/handleUserCrabs");
const { getUserFish } = require("./get/getUserFish");
const { getUserCrabs } = require("./get/getUserCrabs");
const { getUserFernetKey } = require("./get/getUserFernetKey");
const { getDemoCrabs } = require("./get/getDemoCrabs");
const { getDemoFish } = require("./get/getDemoFish");
const adminAuthRoutes = require("./admin/authRoutes");
const { authenticateAdmin, requireRole } = require("./middleware/authenticateAdmin");
const { createUserV2, getUsers, getUsersV2, getUserById, createUser, resetUser, resetUserV2, deleteUser, deleteUserV2 } = require("./controllers/adminUserController");
const { getMe, createAdmin, createAdminV2, listAdminsV2, deleteAdminV2 } = require("./controllers/adminAuthController");
const { getStats } = require("./controllers/adminStatsController");
const { getUserFish: getAdminUserFish, getUserFishV2: getAdminUserFishV2, getUserCrabs: getAdminUserCrabs, getUserCrabsV2: getAdminUserCrabsV2, deleteFish, deleteCrab, deleteFishV2, deleteCrabV2, createFish, createCrab, createFishV2, createCrabV2 } = require("./controllers/adminDataController");
const { getLeaderboard } = require("./controllers/adminActivityController");

const app = express();
const PORT = process.env.PORT || 10000;
const swaggerSpec = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'openapi.json'), 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://tracker.petarmc.com'];
if (process.env.ALLOWED_ORIGIN) allowedOrigins.push(process.env.ALLOWED_ORIGIN);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, origin);
    else callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-csrf-token'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());


const publicLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 5) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 25,
  message: { error: "Try again later. Contact the site owner for more info." }
});

async function rateLimitWrapper(req, res, next) {
  const key = req.headers["x-api-key"];
  const origin = req.headers.origin;

  if (key && key === process.env.MASTER_API_KEY) return next();
  if (origin && allowedOrigins.includes(origin)) return next();
  if (key) {
    try {
      const db = mongoose.connection.db;
      if (db) {
        const apiKey = await db.collection('api_keys').findOne({ key });
        if (apiKey) return next();
      }
    } catch (err) {
      console.error('Error checking API key bypass:', err.message || err);
    }
  }

  return publicLimiter(req, res, next);
}

connectDB()

app.get("/demo/fish", getDemoFish);
app.get("/demo/crab", getDemoCrabs);
app.get("/status", getStatus);
app.get("/v1/admin/auth/csrf-token", (req, res) => res.json({ csrfToken: generateCSRFToken() }));

app.use(adminAuthRoutes);
app.use('/v1/admin', verifyCsrfToken, authenticateAdmin);
app.get('/v1/admin/auth/me', getMe);
app.post('/v1/admin/auth/create-admin', requireRole('superadmin'), createAdmin);
app.get('/v1/admin/stats', getStats);
app.get('/v1/admin/users', getUsers);
app.get('/v1/admin/users/:id', getUserById);
app.post('/v1/admin/users', createUser);
app.post('/v1/admin/users/:id/reset', resetUser);
app.delete('/v1/admin/users/:id', requireRole('superadmin'), deleteUser);
app.get('/v1/admin/users/:id/fish', getAdminUserFish);
app.get('/v1/admin/users/:id/crabs', getAdminUserCrabs);
app.delete('/v1/admin/fish/:fishId', deleteFish);
app.delete('/v1/admin/crab/:crabId', deleteCrab);
app.post('/v1/admin/fish', createFish);
app.post('/v1/admin/crab', createCrab);
app.get('/v1/admin/leaderboard', getLeaderboard);

app.use('/v2/admin', verifyCsrfToken, authenticateAdmin);
app.post('/v2/admin/user/create', createUserV2);
app.get('/v2/admin/users', getUsersV2);
app.get('/v2/admin/user/get/:id', getUserById);
app.post('/v2/admin/user/:id/reset', resetUserV2);
app.delete('/v2/admin/user/:id/delete', requireRole('superadmin'), deleteUserV2);
app.get('/v2/admin/user/:id/fish', getAdminUserFishV2);
app.get('/v2/admin/user/:id/crab', getAdminUserCrabsV2);
app.delete('/v2/admin/user/:id/fish/delete/:fishId', deleteFishV2);
app.delete('/v2/admin/user/:id/crab/delete', deleteCrabV2);
app.post('/v2/admin/user/:id/fish/create', createFishV2);
app.post('/v2/admin/user/:id/crab/create', createCrabV2);
app.post('/v2/admin/admins/create', requireRole('superadmin'), createAdminV2);
app.get('/v2/admin/admins', requireRole('superadmin'), listAdminsV2);
app.delete('/v2/admin/admins/delete/:id', requireRole('superadmin'), deleteAdminV2);

app.use(rateLimitWrapper);

app.post("/v1/post/fish", handleFish);
app.post("/v1/post/crab", handleUserCrabs);
app.post("/post/fish", handleFish);
app.post("/post/crab", handleUserCrabs);

app.get("/get/user/key", getUserFernetKey);
app.get("/get/fish", getUserFish);
app.get("/get/crab", getUserCrabs);
app.get("/v1/get/user/key", getUserFernetKey);
app.get("/v1/get/fish", getUserFish);
app.get("/v1/get/crab", getUserCrabs);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`))