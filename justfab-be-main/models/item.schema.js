const mongoose = require('mongoose');

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
  supportedRarities: {
    type: [String],
    enum: ['COMMON', 'RARE', 'ULTRA_RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'],
    default: ['COMMON', 'RARE', 'ULTRA_RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'],
    required: true
  },
  rarity: {
    type: String,
    required: true,
    // validate: {
    //   validator: function (value) {
    //     console.log(this.supportedRarities, value)
    //     return this.supportedRarities.includes(value);
    //   },
    //   message: 'The rarity must be one of the supported rarities for this item.'
    // },
    index: true
  },
  raritySkills: {
    type: Map,
    of: [
      {
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
      }
    ],
    default: {}
  },
  skills: [
    {
      skill: { type: String, ref: 'Skill', required: true },
      stats: {
        type: Object,
        required: true
      }
    }
  ],
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
      // Convert string values in baseStats to numbers
      for (const key in value) {
        value[key] = Number(value[key]);
      }
      return value;
    }
  },
  currentStats: {
    type: Object,
    default: { hp: 100, attack: 50, defense: 30, luck: 10 },
    validate: {
      validator: function (value) {
        const keys = ['hp', 'attack', 'defense', 'luck'];
        return keys.every(key => typeof value[key] === 'number' && value[key] >= 0);
      },
      message: 'Current stats must be non-negative numbers.'
    },
    set: function (value) {
      // Convert string values in baseStats to numbers
      for (const key in value) {
        value[key] = Number(value[key]);
      }
      return value;
    }
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    set: function (value) {
      // Convert string values in currentStats to numbers
      value = Number(value);
      return value;
    }
  },
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

itemSchema.methods.updateStatsAndSkills = function () {
  // If the rarity field was modified, ensure it's one of the supported rarities.
  if (this.isModified('rarity')) {
    if (!this.supportedRarities.includes(this.rarity)) {
      return next(new Error(`Rarity "${this.rarity}" is not supported. Supported rarities: ${this.supportedRarities.join(', ')}`));
    }
  }

  // Define multipliers for each rarity.
  const rarityMultipliers = {
    'COMMON': 1,
    'RARE': 1.1,
    'ULTRA_RARE': 1.2,
    'EPIC': 1.3,
    'LEGENDARY': 1.5,
    'MYTHIC': 2
  };
  const multiplier = rarityMultipliers[this.rarity] || 1;

  // Recalculate currentStats based on the baseStats, level, and rarity multiplier.
  const newCurrentStats = {};
  for (const key in this.baseStats) {
    newCurrentStats[key] = Math.floor(this.baseStats[key] * this.level * multiplier);
  }
  this.currentStats = newCurrentStats;

  // Aggregate skills from all lower rarities (including the current rarity).
  const rarityOrder = Object.keys(rarityMultipliers);
  const currentRarityIndex = rarityOrder.indexOf(this.rarity);
  let aggregatedSkills = [];

  // Loop through all rarities from the lowest up to the current rarity.
  for (let i = 0; i <= currentRarityIndex; i++) {
    const rarityKey = rarityOrder[i];
    // Assume raritySkills is a Map (or plain object) with rarity keys and an array of skills as the value.
    const skillsForRarity = this.raritySkills.get
      ? this.raritySkills.get(rarityKey)
      : this.raritySkills[rarityKey];
    if (Array.isArray(skillsForRarity)) {
      aggregatedSkills = aggregatedSkills.concat(skillsForRarity);
    }
  }
}

itemSchema.pre('save', function (next) {
  if (this.isModified('level') || this.isModified('rarity')) {
    if (!this.isModified('level')) this.level = 1;
    this.updateStatsAndSkills();
  }
  next();
});

module.exports = itemSchema;