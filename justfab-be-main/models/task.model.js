const mongoose = require('mongoose');
const rewardSchema = require('./reward.schema');
const telegramConfig = require('../config/telegram.config');
const { default: axios } = require('axios');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['LINK', 'TELEGRAM'], required: true },
  target: { type: String, required: true }, // e.g., URL or Telegram group link
  reward: { type: rewardSchema, required: true }, // Embed the reward schema here
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskGroup' } // Reference to a task group
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
