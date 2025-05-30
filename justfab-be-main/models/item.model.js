const mongoose = require('mongoose');
const { recalcSkills, recalcStats } = require('../utils/item.helpers');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    enum: ['WEAPON', 'ARMOR', 'PET', 'ACCESSORY'],
    required: true,
    description: 'The category to which the item belongs.'
  },
  photoUrl: {
    type: String,
    default: ''
  },
  // Supported rarities for this item (used as guidelines for UserItem upgrades)
  supportedRarities: {
    type: [String],
    enum: ['COMMON', 'RARE', 'ULTRA_RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'],
    default: ['COMMON', 'RARE', 'ULTRA_RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'],
    required: true
  },
  raritySkills: {
    // Map each rarity level to an array of skill objects.
    type: Map,
    of: [{
      skill: { type: String, ref: 'Skill', required: true },
      stats: {
        type: Object,
        required: true,
        validate: {
          validator: async function (value) {
            const skill = await mongoose.model('Skill').findById(this.skill);
            if (!skill) return false;
            return skill.requiredStats.every(stat => value.hasOwnProperty(stat));
          },
          message: 'Custom stats must include all required stats for the skill.'
        }
      }
    }],
    default: {}
  },
  baseStats: {
    type: Object,
    default: { hp: 100, attack: 50, defense: 30, luck: 10 },
    validate: {
      validator: function (value) {
        const keys = ['hp', 'attack', 'defense', 'luck'];
        return keys.every(key => typeof value[key] === 'number' && value[key] >= 0);
      },
      message: 'Base stats must be non-negative numbers.'
    },
    set: function (value) {
      for (const key in value) {
        value[key] = Number(value[key]);
      }
      return value;
    }
  },
  // You can keep rarityUpgrades if it represents static upgrade cost/limits for the item.
  rarityUpgrades: {
    type: Number,
    default: 0,
    min: 0
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// --- Middleware to update related UserItems when an Item changes ---
// For document updates (.save())
itemSchema.post('save', async function (doc) {
  if (doc) {
    await updateUserItemsForItem(doc._id);
  }
});

// For query updates (e.g. findOneAndUpdate)
itemSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await updateUserItemsForItem(doc._id);
  }
});

// Bulk update function to recalculate dynamic fields (currentStats and currentSkills)
async function updateUserItemsForItem(itemId) {
  const Item = mongoose.model('Item');
  const UserItem = mongoose.model('UserItem');

  const item = await Item.findById(itemId);
  if (!item) return;

  const userItems = await UserItem.find({ item: itemId });
  if (!userItems.length) return;

  const bulkOps = userItems.map(userItem => ({
    updateOne: {
      filter: { _id: userItem._id },
      update: {
        $set: {
          currentStats: recalcStats(item.baseStats, userItem.level),
          currentSkills: recalcSkills(item, userItem)
        }
      }
    }
  }));

  await UserItem.bulkWrite(bulkOps);
}

module.exports = mongoose.model('Item', itemSchema);
