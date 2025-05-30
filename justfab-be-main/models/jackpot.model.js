const mongoose = require('mongoose');
const rewardSchema = require('./reward.schema');

const jackPotRewardSchema = new mongoose.Schema({
  description: {
    type: String,
    default: '',
  },
  reward: {
    type: rewardSchema,
    required: true, // Embeds the Reward schema
  },
  chance: {
    type: Number,
    required: true,
    description: 'Probability weight of this reward',
  },
  priority: {
    type: Number,
    default: 0, // Optional: Higher priority rewards can be selected first
  },
});

const jackpotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  pool: {
    type: Number,
    default: 0, // The current jackpot pool amount
  },
  rewards: {
    type: [jackPotRewardSchema], // Embeds JackPotReward
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  });

module.exports = mongoose.model('Jackpot', jackpotSchema);