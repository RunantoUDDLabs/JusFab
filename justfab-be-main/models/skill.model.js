const mongoose = require('mongoose');
const slugify = require('slugify');

const skillSchema = new mongoose.Schema({
  slug: {
    type: String,
    description: 'Slugified version of the skill name for easier reference'
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  requiredStats: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Middleware for handling slug generation and validations
skillSchema.pre('save', function (next) {
  // Ensure slug is generated from name only during creation
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
})

// Export the Skill model for use in other parts of the application
module.exports = mongoose.model('Skill', skillSchema);
