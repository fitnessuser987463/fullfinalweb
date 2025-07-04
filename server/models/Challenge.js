// models/challenge.js

const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  rules: [{
    type: String,
    required: true
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  maxScore: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  totalParticipants: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'active'
  },
  // --- ADDED: Flag for streak processing ---
  streaksProcessed: {
    type: Boolean,
    default: false
  }
  // --- END ADDITION ---
}, {
  timestamps: true
});

// ... (rest of the file remains the same)
challengeSchema.pre('save', function(next) {
  const now = new Date();
  
  if (now >= this.endTime) {
    this.status = 'completed';
    this.isActive = false;
  } 
  else if (now >= this.startTime && now < this.endTime) {
    this.status = 'active';
    this.isActive = true;
  }
  else if (now < this.startTime) {
    this.status = 'upcoming';
    this.isActive = false;
  }
  
  next();
});

challengeSchema.statics.updateAllStatuses = async function() {
  const now = new Date();
  
  await this.updateMany(
    { endTime: { $lte: now }, status: { $ne: 'completed' } },
    { status: 'completed', isActive: false }
  );
  
  await this.updateMany(
    { startTime: { $lte: now }, endTime: { $gt: now }, status: { $ne: 'active' } },
    { status: 'active', isActive: true }
  );
  
  await this.updateMany(
    { startTime: { $gt: now }, status: { $ne: 'upcoming' } },
    { status: 'upcoming', isActive: false }
  );
};


module.exports = mongoose.model('Challenge', challengeSchema);