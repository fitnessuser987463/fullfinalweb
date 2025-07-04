const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join challenge room
    socket.on('join_challenge', async (challengeId) => {
      try {
        socket.join(`challenge_${challengeId}`);
        console.log(`User ${socket.id} joined challenge ${challengeId}`);
        
        // Send current challenge stats
        const challenge = await Challenge.findById(challengeId);
        if (challenge) {
          socket.emit('challenge_stats', {
            totalParticipants: challenge.totalParticipants,
            totalSubmissions: challenge.totalSubmissions
          });
        }
      } catch (error) {
        console.error('Join challenge error:', error);
      }
    });

    // Join leaderboard room
    socket.on('join_leaderboard', (challengeId) => {
      socket.join(`leaderboard_${challengeId}`);
      console.log(`User ${socket.id} joined leaderboard for challenge ${challengeId}`);
    });

    // Request leaderboard update
    socket.on('request_leaderboard', async (challengeId) => {
      try {
        const submissions = await Submission.find({ challengeId })
          .populate('userId', 'name avatar')
          .sort({ score: -1, submittedAt: 1 });

        const leaderboard = submissions.map((submission, index) => ({
          rank: index + 1,
          player: submission.userId.name,
          avatar: submission.userId.avatar,
          score: submission.score,
          submittedAt: submission.submittedAt
        }));

        socket.emit('leaderboard_update', leaderboard);
      } catch (error) {
        console.error('Leaderboard request error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Helper function to emit challenge updates
  const emitChallengeUpdate = async (challengeId) => {
    try {
      const challenge = await Challenge.findById(challengeId);
      if (challenge) {
        io.to(`challenge_${challengeId}`).emit('challenge_update', {
          challengeId,
          totalParticipants: challenge.totalParticipants,
          totalSubmissions: challenge.totalSubmissions
        });
      }
    } catch (error) {
      console.error('Emit challenge update error:', error);
    }
  };

  // Helper function to emit leaderboard updates
  const emitLeaderboardUpdate = async (challengeId) => {
    try {
      const submissions = await Submission.find({ challengeId })
        .populate('userId', 'name avatar')
        .sort({ score: -1, submittedAt: 1 });

      const leaderboard = submissions.map((submission, index) => ({
        rank: index + 1,
        player: submission.userId.name,
        avatar: submission.userId.avatar,
        score: submission.score,
        submittedAt: submission.submittedAt
      }));

      io.to(`leaderboard_${challengeId}`).emit('leaderboard_update', leaderboard);
    } catch (error) {
      console.error('Emit leaderboard update error:', error);
    }
  };

  // ADDED: Emit new challenge to all users
  const emitNewChallenge = (challenge) => {
    io.emit('new_challenge', {
      challenge,
      message: 'New challenge available!'
    });
  };

  // ADDED: Emit challenge status updates
  const emitChallengeStatusUpdate = (challengeId, status) => {
    io.emit('challenge_status_update', {
      challengeId,
      status
    });
  };

  return { 
    emitChallengeUpdate, 
    emitLeaderboardUpdate, 
    emitNewChallenge, 
    emitChallengeStatusUpdate 
  };
};