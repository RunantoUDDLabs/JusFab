const Fusion = require('../models/fusion.model'); // Path to the Fusion model
const Item = require('../models/item.model'); // Path to the Item model

// Create a new fusion
const createFusion = async (fusionData) => {
  try {
    const fusion = new Fusion(fusionData);
    return await fusion.save();
  } catch (err) {
    throw new Error(`Error creating fusion: ${err.message}`);
  }
};

// Get all fusions
const getAllFusions = async () => {
  try {
    return await Fusion.find().populate('requiredItems resultItem');
  } catch (err) {
    throw new Error(`Error fetching fusions: ${err.message}`);
  }
};

// Get fusion by ID
const getFusionById = async (id) => {
  try {
    const fusion = await Fusion.findById(id).populate('requiredItems resultItem');
    if (!fusion) {
      throw new Error('Fusion not found');
    }
    return fusion;
  } catch (err) {
    throw new Error(`Error fetching fusion: ${err.message}`);
  }
};

// Update fusion by ID
const updateFusion = async (id, fusionData) => {
  try {
    const updatedFusion = await Fusion.findByIdAndUpdate(id, fusionData, {
      runValidators: true,
    }).populate('requiredItems resultItem');
    if (!updatedFusion) {
      throw new Error('Fusion not found');
    }
    return updatedFusion;
  } catch (err) {
    throw new Error(`Error updating fusion: ${err.message}`);
  }
};

// Delete fusion by ID
const deleteFusion = async (id) => {
  try {
    const deletedFusion = await Fusion.findByIdAndDelete(id);
    if (!deletedFusion) {
      throw new Error('Fusion not found');
    }
    return deletedFusion;
  } catch (err) {
    throw new Error(`Error deleting fusion: ${err.message}`);
  }
};

// Get items that can be fused into a specific item
const getItemsFusedInto = async (itemId) => {
  try {
    return await Fusion.find({ resultItem: itemId }).populate('requiredItems');
  } catch (err) {
    throw new Error(`Error fetching fusions for item: ${err.message}`);
  }
};

// Get items that a specific item is fused from
const getItemsFusedFrom = async (itemId) => {
  try {
    return await Fusion.find({ requiredItems: itemId }).populate('resultItem');
  } catch (err) {
    throw new Error(`Error fetching fusions containing item: ${err.message}`);
  }
};

module.exports = {
  createFusion,
  getAllFusions,
  getFusionById,
  updateFusion,
  deleteFusion,
  getItemsFusedInto,
  getItemsFusedFrom,
};
