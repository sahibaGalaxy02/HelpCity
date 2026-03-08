const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Direct image upload (returns Cloudinary URL)
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }
  res.json({
    success: true,
    imageUrl: req.file.path,
    publicId: req.file.filename,
  });
});

module.exports = router;
