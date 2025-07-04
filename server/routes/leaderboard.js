// routes/leaderboard.js

const express = require('express');
const User = require('../models/User');

const router = express.Router();

// MODIFIED: Get global leaderboard based on streaks
router.get('/global', async (req, res) => {
  try {
    const users = await User.find({ currentStreak: { $gt: 0 } }) // Only show users with an active streak
      .select('name email avatar currentStreak lastActivity')
      .sort({ currentStreak: -1, lastActivity: -1 }) // Sort by highest streak
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      player: user.name,
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      streak: user.currentStreak, // Use streak instead of score
      lastActivity: user.lastActivity
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// REMOVED: The '/current' and '/rank/:userId' routes are no longer needed
// as the new system focuses on a single global streak leaderboard.

module.exports = router;