import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  prompt: {
    type: String,
    required: [true, 'Original prompt is required'],
  },
  genre: {
    type: String,
    enum: ['epic', 'dark', 'whimsical', 'mythological', 'steampunk', 'cosmic', 'romance', 'adventure', 'necromance'],
    default: 'epic',
  },
  tone: {
    type: String,
    enum: ['heroic', 'mysterious', 'lighthearted', 'dark', 'romantic', 'philosophical'],
    default: 'heroic',
  },
  length: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium',
  },
  characters: [{
    type: String,
    trim: true,
  }],
  setting: {
    type: String,
    trim: true,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  wordCount: {
    type: Number,
    default: 0,
  },
  aiModel: {
    type: String,
    default: 'unknown',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update wordCount and updatedAt before saving
storySchema.pre('save', function (next) {
  this.wordCount = this.content.split(/\s+/).filter(Boolean).length;
  this.updatedAt = Date.now();
  next();
});

// Index for fast public story queries
storySchema.index({ visibility: 1, createdAt: -1 });
storySchema.index({ author: 1, createdAt: -1 });

const Story = mongoose.model('Story', storySchema);
export default Story;
