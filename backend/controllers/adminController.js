const Issue = require('../models/Issue');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all issues with filters
// @route   GET /api/admin/issues
// @access  Admin
const getAllIssues = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20, sort = 'newest', search } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { upvotes: -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('createdBy', 'name phone')
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(parseInt(limit)),
      Issue.countDocuments(query),
    ]);

    // Stats for dashboard
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      issues,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: {
        byStatus: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        byCategory: categoryStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        total,
      },
    });
  } catch (error) {
    console.error('Admin getIssues error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update issue status
// @route   PUT /api/admin/status/:id
// @access  Admin
const updateStatus = async (req, res) => {
  try {
    const { status, department, adminNotes } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (status) issue.status = status;
    if (department !== undefined) issue.department = department;
    if (adminNotes !== undefined) issue.adminNotes = adminNotes;

    await issue.save();
    await issue.populate('createdBy', 'name phone');

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete issue (admin)
// @route   DELETE /api/admin/issues/:id
// @access  Admin
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.imagePublicId) {
      await cloudinary.uploader.destroy(issue.imagePublicId);
    }

    await issue.deleteOne();
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const [totalIssues, totalUsers, statusBreakdown, categoryBreakdown, recentIssues] = await Promise.all([
      Issue.countDocuments(),
      User.countDocuments({ role: 'citizen' }),
      Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Issue.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name phone'),
    ]);

    res.json({
      success: true,
      stats: {
        totalIssues,
        totalUsers,
        statusBreakdown: statusBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        categoryBreakdown: categoryBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        recentIssues,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find({ role: 'citizen' }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments({ role: 'citizen' }),
    ]);

    res.json({ success: true, users: users.map(u => u.toPublicJSON()), total });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllIssues, updateStatus, deleteIssue, getDashboardStats, getUsers };
