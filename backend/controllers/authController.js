const User = require('../models/User');
const { verifyFirebaseToken } = require('../config/firebase');
const { generateToken } = require('../middleware/auth');

// @desc    Login/Register with Firebase Phone OTP
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { idToken, name } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(idToken);
    } catch (firebaseError) {
      console.error('Firebase verification failed:', firebaseError.message);
      return res.status(401).json({ error: 'Invalid or expired Firebase token' });
    }

    const { uid, phone_number } = decodedToken;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number not found in token' });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ phone: phone_number }, { firebaseUid: uid }] });

    if (!user) {
      // Create new user
      const isAdmin = phone_number === process.env.ADMIN_PHONE;
      user = await User.create({
        phone: phone_number,
        firebaseUid: uid,
        name: name || '',
        role: isAdmin ? 'admin' : 'citizen',
      });
    } else {
      // Update firebaseUid if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toPublicJSON(),
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user.toPublicJSON(),
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    await user.save();

    res.json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, getMe, updateProfile };
