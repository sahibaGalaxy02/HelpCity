const express = require('express');
const router = express.Router();
const {
  createIssue, getIssues, getIssue, updateIssue, deleteIssue, toggleUpvote, getMyIssues
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getIssues);
router.get('/my', protect, getMyIssues);
router.get('/:id', getIssue);

// Private routes
router.post('/', protect, upload.single('image'), createIssue);
router.put('/:id', protect, upload.single('image'), updateIssue);
router.delete('/:id', protect, deleteIssue);
router.post('/:id/upvote', protect, toggleUpvote);

module.exports = router;
