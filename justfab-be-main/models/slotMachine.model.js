const mongoose = require('mongoose');
const rewardSchema = require('./reward.schema');

const symbolSchema = new mongoose.Schema({
  symbol: {
    type: String,
    enum: ['X', 'O', 'F', 'I', 'J'], // Gold (X), Token (O), Food (F), Item (I), Jackpot (J)
    required: true,
  },
  ratio: {
    type: Number,
    required: true,
    min: 0,
    description: 'Likelihood of this symbol appearing on the reel',
  },
});

const reelSchema = new mongoose.Schema({
  symbols: {
    type: [symbolSchema], // Array of symbols with their ratios
    required: true,
    validate: {
      validator: function (symbols) {
        return symbols.length === 5; // Each reel must have exactly 5 symbols
      },
      message: 'Each reel must have exactly 5 symbols.',
    },
  },
});

const combinationRewardSchema = new mongoose.Schema({
  combination: {
    type: [String], // Array of symbols required for the reward
    required: true,
  },
  reward: {
    type: rewardSchema, // Array of rewards for the combination
    required: true,
  },
});

// Slot Machine schema
const slotMachineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  reels: {
    type: [reelSchema], // Array of 4 reels
    required: true,
    validate: {
      validator: function (reels) {
        return reels.length === 4; // Slot machine must have exactly 4 reels
      },
      message: 'A slot machine must have exactly 4 reels.',
    },
  },
  combinations: {
    type: [combinationRewardSchema], // Array of winning combinations and rewards
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
});

module.exports = mongoose.model('SlotMachine', slotMachineSchema);