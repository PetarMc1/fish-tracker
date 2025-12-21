const express = require('express');
const { adminLogin } = require('../controllers/adminAuthController');

const router = express.Router();

router.post('/admin/auth/login', adminLogin);

module.exports = router;