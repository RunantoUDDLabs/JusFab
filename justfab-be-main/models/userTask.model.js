// models/UserTask.js
const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('UserTask', userTaskSchema);