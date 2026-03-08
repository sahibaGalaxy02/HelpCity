const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Road', 'Garbage', 'Water', 'Electricity', 'Other'],
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' },
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  department: {
    type: String,
    default: '',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
issueSchema.index({ category: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ createdBy: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Virtual for upvote count
issueSchema.virtual('upvoteCount').get(function () {
  return this.upvotes.length;
});

issueSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Issue', issueSchema);
