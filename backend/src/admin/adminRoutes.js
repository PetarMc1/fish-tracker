const express = require('express');
const { authenticateAdmin, requireRole } = require('../middleware/authenticateAdmin');

const { getMe, createAdmin } = require('../controllers/adminAuthController');
const { getStats } = require('../controllers/adminStatsController');
const { getUsers, getUserById, createUser, resetUser, deleteUser } = require('../controllers/adminUserController');
const { getUserFish, getUserCrabs, deleteFish, deleteCrab, createFish, createCrab } = require('../controllers/adminDataController');
const { getActivity, getLeaderboard } = require('../controllers/adminActivityController');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/auth/me', getMe);
router.post('/auth/create-admin', requireRole('superadmin'), createAdmin);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.post('/users/:id/reset', resetUser);
router.delete('/users/:id', requireRole('superadmin'), deleteUser);

router.get('/users/:id/fish', getUserFish);
router.get('/users/:id/crabs', getUserCrabs);
router.delete('/fish/:fishId', deleteFish);
router.delete('/crab/:crabId', deleteCrab);
router.post('/fish', createFish);
router.post('/crab', createCrab);

router.get('/activity', getActivity);
router.get('/leaderboard', getLeaderboard);

module.exports = router;