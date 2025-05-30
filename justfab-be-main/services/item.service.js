const Item = require('../models/item.model'); // Ensure the correct path to the Item model
const EError = require('../utils/EError'); // Import the custom error class

let cacheAllItems = null;
/**
 * Create a new item
 */
async function createItem(data) {
  try {
    const item = new Item(data);
    await item.save();
    cacheAllItems = null;
    return item;

  } catch (error) {
    throw new EError(400, error.message);
  }
}

/**
 * Get all items
 */
async function getAllItems() {
  try {
    if(cacheAllItems) return cacheAllItems;
    cacheAllItems = await Item.find();
    return cacheAllItems;
  } catch (error) {
    throw new EError(500, error.message);
  }
}

/**
 * Get a single item by ID
 */
async function getItemById(id) {
  try {
    const item = await Item.findById(id);
    if (!item) {
      throw new EError(404, 'Item not found');
    }
    return item;
  } catch (error) {
    throw new EError(500, error.message);
  }
}

/**
 * Update an item by ID
 */
async function updateItem(id, data) {
  try {
    const item = await Item.findByIdAndUpdate(id, data, { runValidators: true });
    if (!item) {
      throw new EError(404, 'Item not found');
    }
    cacheAllItems = null;
    return item;
  } catch (error) {
    throw new EError(400, error.message);
  }
}

/**
 * Delete an item by ID
 */
async function deleteItem(id) {
  try {
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      throw new EError(404, 'Item not found');
    }
    cacheAllItems = null;
    return item;
  } catch (error) {
    throw new EError(500, error.message);
  }
}

/**
 * Retrieve a random item that supports a specific rarity.
 *
 * @param {String} rarity - The desired rarity (e.g., 'COMMON', 'RARE', 'ULTRA_RARE', etc.).
 * @returns {Promise<Object|null>} A random item object if found, or null if none exists.
 */
async function getRandomItemByRarity(rarity) {
  // Use an aggregation pipeline to match items with the provided rarity in supportedRarities
  // and sample one random document.
  const allItems = await getAllItems();
  const itemWithRarity = allItems.filter(i => i.supportedRarities.includes(rarity));
  const item = itemWithRarity[Math.floor(Math.random() * itemWithRarity.length)];

  return item;
}

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getRandomItemByRarity
};
