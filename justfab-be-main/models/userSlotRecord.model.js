const mongoose = require('mongoose');

const userSlotRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  energy: {
    type: Number,
    default: 50, // Start with max energy
    min: 0
  },
  lastClaimedAt: {
    type: Date,
    default: Date.now // Track the last time energy was claimed
  },
  records: [
    {
      result: String, // Example: 'win', 'lose', or any other result type
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

// Method to calculate energy based on time passed
userSlotRecordSchema.methods.calculateEnergy = function () {
  const now = Date.now();
  const lastClaimed = new Date(this.lastClaimedAt).getTime();
  const minutesElapsed = Math.floor((now - lastClaimed) / 60000); // Minutes since last claimed
  const unlimitedEnergy = this.energy + minutesElapsed; // No cap on energy accumulation

  if (unlimitedEnergy > this.energy) {
    this.energy = unlimitedEnergy;
    this.lastClaimedAt = now; // Update the last claimed timestamp
  }
  return this.energy;
};

module.exports = mongoose.model('UserSlotRecord', userSlotRecordSchema);
