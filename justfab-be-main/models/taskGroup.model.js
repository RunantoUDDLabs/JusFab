// models/TaskGroup.js
const mongoose = require('mongoose');

const taskGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '' }, // URL, emoji, or any string representing the icon
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskGroup',
    default: null // omitted by default
  }
}, { timestamps: true });

module.exports = TaskGroup = mongoose.model('TaskGroup', taskGroupSchema);