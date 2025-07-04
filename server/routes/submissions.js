// routes/submissions.js

const express = require('express');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Submit proof
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { challengeId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    if (challenge.status !== 'active') return res.status(400).json({ message: 'Challenge is not active' });

    const existingSubmission = await Submission.findOne({ userId: req.user._id, challengeId });
    if (existingSubmission) return res.status(400).json({ message: 'Already submitted to this challenge' });

    const uploadResult = await uploadToCloudinary(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      'submissions'
    );
    
    const user = await User.findById(req.user._id);
    const streakWindowStart = new Date(challenge.startTime);
    streakWindowStart.setHours(streakWindowStart.getHours() - 36);

    if (user.lastChallengeCompletedDate && user.lastChallengeCompletedDate >= streakWindowStart) {
      user.currentStreak += 1;
    } else {
      user.currentStreak = 1;
    }
    
    user.lastChallengeCompletedDate = new Date();
    user.totalSubmissions += 1;
    user.lastActivity = new Date();
    await user.save();
    
    const submission = new Submission({
      userId: req.user._id,
      challengeId,
      mediaUrl: uploadResult.secure_url,
      mediaType: file.mimetype.startsWith('image/') ? 'image' : 'video',
      cloudinaryPublicId: uploadResult.public_id,
      score: user.currentStreak
    });

    await submission.save();

    challenge.totalSubmissions += 1;
    await challenge.save();

    // --- FIX: Emit a global event to all clients telling them to update the leaderboard ---
    req.io.emit('leaderboard_updated');
    // --- END FIX ---

    // The old 'new_submission' event is fine to keep, but the one above is key for the fix.
    req.io.emit('new_submission', {
      challengeId,
      totalSubmissions: challenge.totalSubmissions,
      userId: req.user._id,
      streak: user.currentStreak
    });

    res.status(201).json({
      message: 'Submission successful',
      submission,
      score: user.currentStreak
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user submissions
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.params.userId })
      .populate('challengeId', 'title')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user submitted to challenge
router.get('/check/:challengeId', auth, async (req, res) => {
  try {
    const submission = await Submission.findOne({
      userId: req.user._id,
      challengeId: req.params.challengeId
    });

    res.json({ submitted: !!submission, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;