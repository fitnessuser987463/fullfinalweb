// server.js

// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');

// Import socket handlers
const socketHandlers = require('./socket/socketHandlers');

// Import models for streak logic
const Challenge = require('./models/Challenge');
const Submission = require('./models/Submission');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drop-challenge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  // Update challenge statuses on startup
  Challenge.updateAllStatuses().then(() => {
    console.log('Challenge statuses updated on startup');
  });
})
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io handling
const socketHelpers = socketHandlers(io);

// Make io and socket helpers accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.socketHelpers = socketHelpers;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    env_check: {
      cloudinary_configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    }
  });
});

// --- STREAK LOGIC ---
// Function to reset streaks for users who missed a challenge
const resetBrokenStreaks = async () => {
  try {
    // Find the most recently completed challenge that hasn't been processed yet
    const lastChallenge = await Challenge.findOne({
      status: 'completed',
      streaksProcessed: false,
    }).sort({ endTime: -1 });

    if (!lastChallenge) {
      // No new challenges to process, exit silently
      return;
    }

    console.log(`Processing streaks for completed challenge: ${lastChallenge.title}`);

    // Find all users who successfully submitted to this challenge
    const submissions = await Submission.find({ challengeId: lastChallenge._id }).select('userId');
    const participantIds = submissions.map(s => s.userId);

    // Reset the streak for any user who is NOT in the participants list and has an active streak
    const result = await User.updateMany(
      { _id: { $nin: participantIds }, currentStreak: { $gt: 0 } },
      { $set: { currentStreak: 0 } }
    );
    
    if (result.modifiedCount > 0) {
        console.log(`${result.modifiedCount} users had their streaks reset for missing the challenge.`);
    }

    // Mark the challenge as processed to avoid running this again
    lastChallenge.streaksProcessed = true;
    await lastChallenge.save();

  } catch (error) {
    console.error('Error in resetBrokenStreaks job:', error);
  }
};
// --- END STREAK LOGIC ---

// Periodic challenge status updates and streak resets
setInterval(async () => {
  try {
    await Challenge.updateAllStatuses();
    console.log('Periodic challenge statuses updated.');
    
    // Run the streak reset logic right after updating statuses
    await resetBrokenStreaks();

  } catch (error) {
    console.error('Error in periodic update job:', error);
  }
}, 60000); // Run every minute

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables loaded:');
  console.log('- MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
  console.log('- JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Missing');
  console.log('- Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing');
  console.log('- Cloudinary API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
});