const Issue = require('../models/Issue');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    let parsedLocation;
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    } catch {
      return res.status(400).json({ error: 'Invalid location format' });
    }

    const issueData = {
      title,
      description,
      category,
      location: parsedLocation,
      createdBy: req.user._id,
    };

    if (req.file) {
      issueData.imageUrl = req.file.path;
      issueData.imagePublicId = req.file.filename;
    }

    const issue = await Issue.create(issueData);
    await issue.populate('createdBy', 'name phone');

    res.status(201).json({ success: true, issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// @desc    Get all issues (with filters & pagination)
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 12, sort = 'newest' } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { upvotes: -1 },
    };

    const sortQuery = sortOptions[sort] || sortOptions.newest;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('createdBy', 'name phone')
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Issue.countDocuments(query),
    ]);

    // Add upvote count to each issue
    const issuesWithCount = issues.map(issue => ({
      ...issue,
      upvoteCount: issue.upvotes?.length || 0,
    }));

    res.json({
      success: true,
      issues: issuesWithCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name phone');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update own issue
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this issue' });
    }

    const { title, description, category } = req.body;
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (category) issue.category = category;

    if (req.file) {
      // Delete old image from Cloudinary
      if (issue.imagePublicId) {
        await cloudinary.uploader.destroy(issue.imagePublicId);
      }
      issue.imageUrl = req.file.path;
      issue.imagePublicId = req.file.filename;
    }

    await issue.save();
    await issue.populate('createdBy', 'name phone');

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this issue' });
    }

    // Delete image from Cloudinary
    if (issue.imagePublicId) {
      await cloudinary.uploader.destroy(issue.imagePublicId);
    }

    await issue.deleteOne();

    res.json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Upvote / remove upvote
// @route   POST /api/issues/:id/upvote
// @access  Private
const toggleUpvote = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const userId = req.user._id;
    const alreadyUpvoted = issue.upvotes.includes(userId);

    if (alreadyUpvoted) {
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
      issue.upvotes.push(userId);
    }

    await issue.save();

    res.json({
      success: true,
      upvoted: !alreadyUpvoted,
      upvoteCount: issue.upvotes.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get user's own issues
// @route   GET /api/issues/my
// @access  Private
const getMyIssues = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
      Issue.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Issue.countDocuments({ createdBy: req.user._id }),
    ]);

    res.json({
      success: true,
      issues,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createIssue, getIssues, getIssue, updateIssue, deleteIssue, toggleUpvote, getMyIssues };
