const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = new User({
        googleId,
        email,
        name,
        avatar,
        lastActivity: new Date()
      });
      await user.save();
    } else {
      user.lastActivity = new Date();
      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        totalScore: user.totalScore,
        challengesWon: user.challengesWon,
        totalSubmissions: user.totalSubmissions
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email signup/login
router.post('/email', async (req, res) => {
  try {
    const { email, password, name, isSignup } = req.body;

    console.log('Email auth request:', { email, isSignup }); // Debug log

    if (isSignup) {
      // Signup
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = new User({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        lastActivity: new Date()
      });
      
      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          totalScore: user.totalScore,
          challengesWon: user.challengesWon,
          totalSubmissions: user.totalSubmissions
        }
      });
    } else {
      // Login
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'No account found with this email' });
      }

      if (!user.password) {
        return res.status(400).json({ message: 'This email is registered with Google. Please use Google Sign-In.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      user.lastActivity = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          totalScore: user.totalScore,
          challengesWon: user.challengesWon,
          totalSubmissions: user.totalSubmissions
        }
      });
    }
  } catch (error) {
    console.error('Email auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -googleId');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;