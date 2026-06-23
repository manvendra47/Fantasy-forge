import express from 'express';
import rateLimit from 'express-rate-limit';
import Story from '../models/Story.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { generateStory } from '../config/aiService.js';

const router = express.Router();

const generateLimiter = rateLimit({
  windowMs: 1000, // 1 second window
  max: 3, // limit each user to 3 generate requests per second
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  handler: (req, res) => res.status(429).json({
    success: false,
    message: 'Too many story generation requests. Please wait a moment and try again.',
  }),
});

// POST /api/stories/generate  — generate a new story with AI
router.post('/generate', protect, generateLimiter, async (req, res) => {
  try {
    const {
      prompt,
      genre = 'epic',
      tone = 'heroic',
      length = 'medium',
      characters = [],
      setting = '',
      tags = [],
      visibility = 'private',
    } = req.body;

    if (!prompt || prompt.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a story prompt (at least 10 characters)' });
    }

    // Check total story limit (20 max)
    const totalStories = await Story.countDocuments({ author: req.user._id });
    if (totalStories >= 20) {
      return res.status(400).json({ success: false, message: 'You have reached the maximum limit of 20 stories' });
    }

    // Check private story limit (13 max)
    if (visibility === 'private') {
      const privateStories = await Story.countDocuments({ author: req.user._id, visibility: 'private' });
      if (privateStories >= 13) {
        return res.status(400).json({ success: false, message: 'You have reached the maximum limit of 13 private stories' });
      }
    }

    const aiResult = await generateStory({ prompt, genre, tone, length, characters, setting });

    const story = await Story.create({
      title: aiResult.title,
      content: aiResult.content,
      prompt: prompt.trim(),
      genre,
      tone,
      length,
      characters,
      setting,
      tags,
      visibility,
      author: req.user._id,
      aiModel: aiResult.aiModel,
    });

    await story.populate('author', 'username avatar');

    res.status(201).json({ success: true, story });
  } catch (error) {
    console.error('Story generation error:', error.message);
    res.status(500).json({ success: false, message: `Story generation failed: ${error.message}` });
  }
});

// GET /api/stories/my  — get current user's stories
router.get('/my', protect, async (req, res) => {
  try {
    const { page = 1, limit = 12, genre, visibility } = req.query;
    const filter = { author: req.user._id };
    if (genre) filter.genre = genre;
    if (visibility) filter.visibility = visibility;

    const total = await Story.countDocuments(filter);
    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username avatar')
      .lean();

    res.json({ success: true, stories, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stories/public  — explore public stories
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, genre, sort = 'newest', search } = req.query;
    const filter = { visibility: 'public' };
    if (genre) filter.genre = genre;
    if (search) filter.$text = { $search: search };

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { 'likes.length': -1, createdAt: -1 },
      oldest: { createdAt: 1 },
    };

    const total = await Story.countDocuments(filter);
    const stories = await Story.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username avatar')
      .lean();

    // Add like status for authenticated users
    const storiesWithLikes = stories.map((s) => ({
      ...s,
      likeCount: s.likes?.length || 0,
      isLiked: req.user ? s.likes?.some((id) => id.toString() === req.user._id.toString()) : false,
    }));

    res.json({ success: true, stories: storiesWithLikes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stories/:id  — get single story
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'username avatar bio');
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    const isOwner = req.user && story.author._id.toString() === req.user._id.toString();
    if (story.visibility === 'private' && !isOwner) {
      return res.status(403).json({ success: false, message: 'This story is private' });
    }

    res.json({
      success: true,
      story: {
        ...story.toObject(),
        likeCount: story.likes.length,
        isLiked: req.user ? story.likes.some((id) => id.toString() === req.user._id.toString()) : false,
        isOwner,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/stories/:id/visibility  — toggle public/private
router.patch('/:id/visibility', protect, async (req, res) => {
  try {
    const { visibility } = req.body;
    if (!['public', 'private'].includes(visibility)) {
      return res.status(400).json({ success: false, message: 'Visibility must be public or private' });
    }

    const story = await Story.findOne({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ success: false, message: 'Story not found or not authorized' });

    story.visibility = visibility;
    await story.save();

    res.json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/stories/:id  — update story metadata (title, tags, visibility)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { title, tags, visibility } = req.body;
    const story = await Story.findOne({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ success: false, message: 'Story not found or not authorized' });

    if (title) story.title = title;
    if (tags) story.tags = tags;
    if (visibility) story.visibility = visibility;
    await story.save();

    res.json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/stories/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ success: false, message: 'Story not found or not authorized' });
    res.json({ success: true, message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/stories/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story || story.visibility !== 'public') {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const userId = req.user._id;
    const alreadyLiked = story.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      story.likes = story.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      story.likes.push(userId);
    }

    await story.save();
    res.json({ success: true, likeCount: story.likes.length, isLiked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
