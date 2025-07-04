// const express = require('express');
// const Challenge = require('../models/Challenge');
// const Submission = require('../models/Submission');
// const auth = require('../middleware/auth');
// const admin = require('../middleware/admin');

// const router = express.Router();

// // Get active challenge - always get the latest one
// router.get('/current', async (req, res) => {
//   try {
//     // First, update all challenge statuses
//     await Challenge.updateAllStatuses();
    
//     // Get the most recent active challenge
//     const currentChallenge = await Challenge.findOne({
//       status: 'active',
//       isActive: true,
//       endTime: { $gt: new Date() }
//     })
//     .sort({ createdAt: -1 }) // Get the latest challenge
//     .populate('createdBy', 'name');

//     if (!currentChallenge) {
//       return res.status(404).json({ message: 'No active challenge found' });
//     }

//     // Calculate time remaining
//     const timeRemaining = Math.max(0, currentChallenge.endTime - new Date());
    
//     res.json({
//       ...currentChallenge.toObject(),
//       timeRemaining
//     });
//   } catch (error) {
//     console.error('Error fetching current challenge:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get upcoming challenges
// router.get('/upcoming', async (req, res) => {
//   try {
//     // Update statuses first
//     await Challenge.updateAllStatuses();
    
//     const upcomingChallenges = await Challenge.find({
//       $or: [
//         { status: 'upcoming' },
//         { startTime: { $gt: new Date() } }
//       ]
//     })
//     .sort({ startTime: 1 })
//     .limit(10);

//     res.json(upcomingChallenges);
//   } catch (error) {
//     console.error('Error fetching upcoming challenges:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Join challenge
// router.post('/:id/join', auth, async (req, res) => {
//   try {
//     const challenge = await Challenge.findById(req.params.id);
    
//     if (!challenge) {
//       return res.status(404).json({ message: 'Challenge not found' });
//     }

//     if (challenge.status !== 'active') {
//       return res.status(400).json({ message: 'Challenge is not active' });
//     }

//     // Check if user already joined
//     const alreadyJoined = challenge.participants.some(
//       p => p.user.toString() === req.user._id.toString()
//     );

//     if (alreadyJoined) {
//       return res.status(400).json({ message: 'Already joined this challenge' });
//     }

//     challenge.participants.push({
//       user: req.user._id,
//       joinedAt: new Date()
//     });
//     challenge.totalParticipants = challenge.participants.length;

//     await challenge.save();

//     // Emit real-time update
//     if (req.socketHelpers) {
//       req.socketHelpers.emitChallengeUpdate(challenge._id);
//     }

//     res.json({ message: 'Successfully joined challenge' });
//   } catch (error) {
//     console.error('Error joining challenge:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create challenge (admin only)
// router.post('/', auth, admin, async (req, res) => {
//   try {
//     const { title, description, rules, endTime, maxScore } = req.body;

//     // Set proper start and end times
//     const startTime = new Date(); // Start immediately
//     const challengeEndTime = new Date(endTime);
    
//     // Validate end time
//     if (challengeEndTime <= startTime) {
//       return res.status(400).json({ message: 'End time must be in the future' });
//     }

//     const challenge = new Challenge({
//       title,
//       description,
//       rules: Array.isArray(rules) ? rules : rules.split('\n').filter(rule => rule.trim()),
//       startTime,
//       endTime: challengeEndTime,
//       maxScore: maxScore || 100,
//       createdBy: req.user._id,
//       status: 'active', // Set as active immediately
//       isActive: true
//     });

//     await challenge.save();

//     // Emit new challenge notification
//     if (req.socketHelpers) {
//       req.socketHelpers.emitNewChallenge(challenge);
//     }

//     console.log(`New challenge created: ${challenge.title} by ${req.user.name}`);

//     res.status(201).json(challenge);
//   } catch (error) {
//     console.error('Error creating challenge:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get all challenges (admin only)
// router.get('/all', auth, admin, async (req, res) => {
//   try {
//     // Update statuses first
//     await Challenge.updateAllStatuses();
    
//     const challenges = await Challenge.find()
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     res.json(challenges);
//   } catch (error) {
//     console.error('Error fetching all challenges:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get challenge by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const challenge = await Challenge.findById(req.params.id)
//       .populate('createdBy', 'name');
    
//     if (!challenge) {
//       return res.status(404).json({ message: 'Challenge not found' });
//     }

//     res.json(challenge);
//   } catch (error) {
//     console.error('Error fetching challenge:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get single active challenge (for Home page)
router.get('/active', async (req, res) => {
  try {
    // First, update all challenge statuses
    await Challenge.updateAllStatuses();
    
    // Get the most recent active challenge
    const currentChallenge = await Challenge.findOne({
      status: 'active',
      isActive: true,
      endTime: { $gt: new Date() }
    })
    .sort({ createdAt: -1 }) // Get the latest challenge
    .populate('createdBy', 'name');

    if (!currentChallenge) {
      return res.status(404).json({ message: 'No active challenge found' });
    }

    // Calculate time remaining
    const timeRemaining = Math.max(0, currentChallenge.endTime - new Date());
    
    res.json({
      ...currentChallenge.toObject(),
      timeRemaining
    });
  } catch (error) {
    console.error('Error fetching active challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current/recent challenges (for Admin panel) - returns multiple challenges
router.get('/current', async (req, res) => {
  try {
    // First, update all challenge statuses
    await Challenge.updateAllStatuses();
    
    // Get all recent challenges (active + recently ended)
    const recentChallenges = await Challenge.find({
      $or: [
        { status: 'active', isActive: true },
        { 
          status: 'completed', 
          endTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      ]
    })
    .sort({ createdAt: -1 }) // Newest first
    .populate('createdBy', 'name')
    .limit(10); // Limit to prevent too many results

    if (recentChallenges.length === 0) {
      return res.status(404).json({ message: 'No recent challenges found' });
    }

    // Add time remaining for each challenge
    const challengesWithTime = recentChallenges.map(challenge => {
      const timeRemaining = Math.max(0, challenge.endTime - new Date());
      return {
        ...challenge.toObject(),
        timeRemaining
      };
    });

    res.json(challengesWithTime);
  } catch (error) {
    console.error('Error fetching current challenges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming challenges
router.get('/upcoming', async (req, res) => {
  try {
    // Update statuses first
    await Challenge.updateAllStatuses();
    
    const upcomingChallenges = await Challenge.find({
      $or: [
        { status: 'upcoming' },
        { startTime: { $gt: new Date() } }
      ]
    })
    .sort({ startTime: 1 })
    .limit(10);

    res.json(upcomingChallenges);
  } catch (error) {
    console.error('Error fetching upcoming challenges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join challenge
router.post('/:id/join', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({ message: 'Challenge is not active' });
    }

    // Check if user already joined
    const alreadyJoined = challenge.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    challenge.participants.push({
      user: req.user._id,
      joinedAt: new Date()
    });
    challenge.totalParticipants = challenge.participants.length;

    await challenge.save();

    // Emit real-time update
    if (req.socketHelpers) {
      req.socketHelpers.emitChallengeUpdate(challenge._id);
    }

    res.json({ message: 'Successfully joined challenge' });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create challenge (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { title, description, rules, endTime, maxScore } = req.body;

    // Set proper start and end times
    const startTime = new Date(); // Start immediately
    const challengeEndTime = new Date(endTime);
    
    // Validate end time
    if (challengeEndTime <= startTime) {
      return res.status(400).json({ message: 'End time must be in the future' });
    }

    const challenge = new Challenge({
      title,
      description,
      rules: Array.isArray(rules) ? rules : rules.split('\n').filter(rule => rule.trim()),
      startTime,
      endTime: challengeEndTime,
      maxScore: maxScore || 100,
      createdBy: req.user._id,
      status: 'active', // Set as active immediately
      isActive: true
    });

    await challenge.save();

    // Emit new challenge notification
    if (req.socketHelpers) {
      req.socketHelpers.emitNewChallenge(challenge);
    }

    console.log(`New challenge created: ${challenge.title} by ${req.user.name}`);

    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all challenges (admin only)
router.get('/all', auth, admin, async (req, res) => {
  try {
    // Update statuses first
    await Challenge.updateAllStatuses();
    
    const challenges = await Challenge.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching all challenges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;