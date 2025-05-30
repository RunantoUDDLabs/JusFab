const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: false,
  },
  displayName: {
    type: String,
    required: false,
  },
  gold: {
    type: Number,
    default: 0
  },
  token: {
    type: Number,
    default: 0
  },
  food: {
    type: Number,
    default: 0
  },
  energy: {
    type: Number,
    default: 50
  },
  claimEnergyAt: {
    type: Date,
    default: new Date()
  },
  bonusEnergy: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['USER', 'MOD', 'ADMIN', 'ROOT'],
    default: 'USER'
  },
  telegram: {
    type: Object,
  },
  slotMachinePlays: {
    type: Number,
    default: 0,
    description: 'Counts how many times the user played the slot machine.'
  }
}, {
  timestamps: true
});

userSchema.pre('save', function (next) {
  if (this.isModified('energy')) {
    this.energy = Math.round(this.energy);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);