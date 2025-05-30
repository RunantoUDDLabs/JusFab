const mongoose = require('mongoose');
const rewardSchema = require('./reward.schema');

// Define a schema for a reward entry (an instance of a reward in the user's collection)
const rewardEntrySchema = new mongoose.Schema({
  reward: rewardSchema,
  claimed: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    required: false,
    description: "Optional reason for the reward (e.g., 'daily streak', 'mission completion', 'referral bonus')."
  },
  level: {
    type: Number,
    required: false,
    description: "Optional numerical value representing the level, streak, or count for the given reward reason."
  }
}, {
  timestamps: true
});

// Define a schema for the user's rewards collection
const userRewardsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  rewards: [rewardEntrySchema],
});

module.exports = UserRewards = mongoose.model('UserRewards', userRewardsSchema);
