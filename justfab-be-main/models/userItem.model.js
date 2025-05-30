const mongoose = require('mongoose');
const { recalcSkills, recalcStats } = require('../utils/item.helpers');

const userItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  // Moved rarity here as an upgradable property
  rarity: {
    type: String,
    default: 'COMMON',
    enum: ['COMMON', 'RARE', 'ULTRA_RARE', 'EPIC', 'LEGENDARY', 'MYTHIC']
  },
  currentStats: {
    type: Object,
    default: function () {
      return { hp: 100, attack: 50, defense: 30, luck: 10 };
    },
    validate: {
      validator: function (value) {
        const keys = ['hp', 'attack', 'defense', 'luck'];
        return keys.every(key => typeof value[key] === 'number' && value[key] >= 0);
      },
      message: 'Current stats must be non-negative numbers.'
    },
    set: function (value) {
      for (const key in value) {
        value[key] = Number(value[key]);
      }
      return value;
    }
  },
  currentSkills: {
    type: Array,
    default: []
  }
}, { timestamps: true });

// --- Pre-save hook to calculate currentSkills and currentStats ---
// This hook fetches the base item and computes the skills based on the UserItem's rarity.
userItemSchema.pre('save', async function (next) {
  const Item = mongoose.model('Item');
  let itemDoc = this.populated('item') ? this.item : await Item.findById(this.item);
  if (itemDoc) {
    this.currentStats = recalcStats(itemDoc.baseStats, this.level);
    this.currentSkills = recalcSkills(itemDoc, this);
  }
  console.log(this);
  next();
});

// --- Post-save hook to add this UserItem to the user's Inventory ---
userItemSchema.post('save', async function (doc) {
  try {
    const Inventory = mongoose.model('Inventory');
    await Inventory.updateOne(
      { user: doc.user },
      { $addToSet: { items: doc._id } },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating user inventory:', error);
  }
});

userItemSchema.index({"user": 1});
userItemSchema.index({"item": 1});

module.exports = mongoose.model('UserItem', userItemSchema);