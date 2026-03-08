const express = require('express');
const router = express.Router();
const { getAllIssues, updateStatus, deleteIssue, getDashboardStats, getUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/issues', getAllIssues);
router.put('/status/:id', updateStatus);
router.delete('/issues/:id', deleteIssue);
router.get('/users', getUsers);

module.exports = router;
