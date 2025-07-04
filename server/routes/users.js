const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    user.lastActivity = new Date();

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification settings
router.put('/notifications', auth, async (req, res) => {
  try {
    const { sms, email, push, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (sms !== undefined) user.notificationSettings.sms = sms;
    if (email !== undefined) user.notificationSettings.email = email;
    if (push !== undefined) user.notificationSettings.push = push;
    if (phone !== undefined) user.phone = phone;
    user.lastActivity = new Date();

    await user.save();

    res.json({
      message: 'Notification settings updated successfully',
      notificationSettings: user.notificationSettings,
      phone: user.phone
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      totalScore: user.totalScore,
      challengesWon: user.challengesWon,
      totalSubmissions: user.totalSubmissions,
      lastActivity: user.lastActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;