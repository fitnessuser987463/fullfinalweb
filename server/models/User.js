// models/user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    default: null
  },
  notificationSettings: {
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  // --- MODIFIED: Replaced score/wins with streak ---
  currentStreak: {
    type: Number,
    default: 0
  },
  lastChallengeCompletedDate: {
    type: Date,
    default: null
  },
  // --- END MODIFICATION ---
  totalSubmissions: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);