const mongoose = require('mongoose');

const fusionSchema = new mongoose.Schema({
  requiredItems: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  ],
  resultItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  additionalRequirements: { type: String, default: '' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Fusion', fusionSchema);