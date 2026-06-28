import express from 'express';
import jwt from 'jsonwebtoken';
import { authLimiter } from '../middleware/ratelimiter.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import sendWelcomeEmail from '../utils/SendingMail.js';

const router = express.Router();

const signToken = (id) =>
 jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });



// validate if username ,email are valid or not 
const validateUserInput = ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new Error('All fields are required');
  }
  if (username.length < 3 || username.length > 100) {
    throw new Error('Username must be between 3 and 100 characters');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Invalid email format');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
};

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    validateUserInput({ username, email, password });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: `${field} already in use` });
    }

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
    // Send welcome email (fire and forget, no need to await)
    sendWelcomeEmail(user.email, user.username);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    validateUserInput({ username: 'abcd', email, password });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { Fullname, Contact, username, email, bio, avatar } = req.body;
    const updates = {};

    // Validate and update fields
    if(Fullname && (Fullname.length < 3 || Fullname.length > 50)) {
      return res.status(400).json({ success: false, message: 'Fullname must be between 3 and 50 characters' });
    }
    if(Contact && !/^\+?[1-9]\d{1,14}$/.test(Contact)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid contact number' });
    }
    
    if(Fullname && Fullname !== req.user.Fullname) updates.Fullname = Fullname;
    if(Contact && Contact !== req.user.Contact) updates.Contact = Contact;


    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already in use' });
      }
      updates.username = username;
    }

    if (email && email.toLowerCase() !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      updates.email = email.toLowerCase();
    }

    if (typeof bio !== 'undefined') updates.bio = bio;
    if (typeof avatar !== 'undefined') updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
