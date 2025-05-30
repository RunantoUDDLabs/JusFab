// services/skillService.js
const Skill = require('../models/skill.model'); // Ensure the correct path to the Skill model
const EError = require('../utils/EError'); // Import the custom error class

/**
 * Create a new skill
 */
async function createSkill(data) {
  try {
    const skill = new Skill(data);
    await skill.save();
    return skill;
  } catch (error) {
    throw new EError(400, 'Failed to create skill', error.message);
  }
}

/**
 * Get all skills
 */
async function getAllSkills() {
  try {
    return await Skill.find();
  } catch (error) {
    throw new EError(500, 'Failed to retrieve skills', error.message);
  }
}

/**
 * Get a single skill by ID
 */
async function getSkillById(id) {
  try {
    const skill = await Skill.findById(id);
    if (!skill) {
      throw new EError(404, 'Skill not found');
    }
    return skill;
  } catch (error) {
    throw new EError(500, 'Failed to retrieve skill', error.message);
  }
}

/**
 * Update a skill by ID
 */
async function updateSkill(id, data) {
  try {
    const skill = await Skill.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!skill) {
      throw new EError(404, 'Skill not found');
    }
    return skill;
  } catch (error) {
    throw new EError(400, 'Failed to update skill', error.message);
  }
}

/**
 * Delete a skill by ID
 */
async function deleteSkill(id) {
  try {
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      throw new EError(404, 'Skill not found');
    }
    return skill;
  } catch (error) {
    throw new EError(500, 'Failed to delete skill', error.message);
  }
}

module.exports = {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill
};
