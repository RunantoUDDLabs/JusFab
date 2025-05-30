
const mongoose = require('mongoose');

const dailyRewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  lastClaimedAt: {
    type: Date,
    default: null,
  },
  streak: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('DailyReward', dailyRewardSchema);