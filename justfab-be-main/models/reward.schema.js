const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['GOLD', 'TOKEN', 'FOOD', 'ITEM', 'JACKPOT', 'SPIN', 'POOL_PERCENTAGE', 'ENERGY', 'NFT'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      description: 'Amount of the reward',
      default: 1
    },
    item: {
      type: Object,
      default: {
        rarity: '',
        level: 1
      },
    },
    sumable: {
      type: Boolean,
      default: false
    },
    keepAfterClaimed: {
      type: Boolean,
      default: false
    }
  }, {
  timestamps: true,
});

module.exports = rewardSchema;