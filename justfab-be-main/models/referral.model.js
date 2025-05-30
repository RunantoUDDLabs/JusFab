const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensures a user is only referred once
  },
  onboarded: {
    type: Boolean,
    default: false
  },
  onboardedAt: {
    type: Date
  }
}, {
  timestamps: true
});

referralSchema.index({ referrer: 1 });
referralSchema.index({ referrer: 1, onboarded: 1 });

module.exports = Referral = mongoose.model('Referral', referralSchema);
