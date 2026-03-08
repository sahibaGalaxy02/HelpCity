const express = require('express');
const router = express.Router();
const { login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateProfile } = require('../middleware/validate');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfile, updateProfile);

module.exports = router;
