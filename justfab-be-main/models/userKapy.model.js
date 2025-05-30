const mongoose = require('mongoose');
const Skill = require('./skill.model');
const Item = require('./item.schema');
const userItemModel = require('./userItem.model');

const UserKapySchema = new mongoose.Schema({
    baseStats: {
        hp: { type: Number, required: true, default: 100 },
        attack: { type: Number, required: true, default: 0 },
        defense: { type: Number, required: true, default: 0 },
        luck: { type: Number, required: true, default: 0 },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    equipments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserItem',
    }],
    level: { type: Number, required: true, default: 1 },
    stats: {
        hp: { type: Number, required: true, default: 100 },
        attack: { type: Number, required: true, default: 0 },
        defense: { type: Number, required: true, default: 0 },
        luck: { type: Number, required: true, default: 0 },
    },
    skills: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
        stats: {
            type: Object,
            required: true,
            validate: {
                validator: function (value) {
                    const keys = ['hp', 'attack', 'defense', 'luck'];
                    return keys.every(key => typeof value[key] === 'number' && value[key] >= 0);
                },
                message: 'Skill stats must be non-negative numbers.',
            },
        },
    }],
}, { timestamps: true });

// Pre-save hook to calculate stats and skills
UserKapySchema.pre('save', async function (next) {
    const baseStats = this.baseStats;
    const equipments = await userItemModel.find({ _id: { $in: this.equipments } });//.populate('currentSkills');

    // Initialize stats with baseStats
    const calculatedStats = { ...baseStats };

    // Add currentStats from each equipment
    for (const equipment of equipments) {
        if (equipment.currentStats) {
            calculatedStats.hp += equipment.currentStats.hp || 0;
            calculatedStats.attack += equipment.currentStats.attack || 0;
            calculatedStats.defense += equipment.currentStats.defense || 0;
            calculatedStats.luck += equipment.currentStats.luck || 0;
        }
    }

    this.stats = calculatedStats;

    // Collect all skills from each equipment
    const skills = [];
    for (const equipment of equipments) {
        if (equipment.skills && Array.isArray(equipment.skills)) {
            skills.push(...equipment.skills.map(skill => ({
                skill: skill.skill,
                stats: skill.stats,
            })));
        }
    }

    this.skills = skills;

    next();
});

module.exports = mongoose.model('UserKapy', UserKapySchema);
