const Inventory = require("../models/inventory.model");
const User = require("../models/user.model");
const Item = require("../models/item.model");
const UserItem = require("../models/userItem.model");
const EError = require("../utils/EError");

// const addItemToInventory = async (userId, itemId, quantity) => {
//   // Retrieve the user's inventory document
//   const inventory = await getInventoryForUser(userId);

//   // Check if the item already exists in the inventory
//   const existingItem = inventory.items.find((invItem) =>
//     invItem.item._id.toString() === itemId
//   );

//   if (existingItem) {
//     // Increase the quantity if the item already exists
//     existingItem.quantity += quantity;
//   } else {
//     // Fetch the full item document from the database
//     const itemDoc = await Item.findById(itemId);
//     if (!itemDoc) {
//       throw new Error('Item not found');
//     }
//     // Convert the Mongoose document to a plain object to serve as a snapshot.
//     const itemSnapshot = itemDoc.toObject();
//     // Optionally, remove the _id from the snapshot if you want a new _id generated for the embedded document.
//     // delete itemSnapshot._id;

//     // Push the snapshot along with the quantity into the inventory
//     inventory.items.push({ item: itemSnapshot, quantity });
//   }

//   // Save the updated inventory
//   await inventory.save();
//   return inventory;
// };

/**
 * Add a modified item as a separate entry to a user's inventory.
 *
 * @param {String} userId - The user's ID.
 * @param {String} itemId - The ID of the base item.
 * @param {Number} level - 
 * @param {String} rarity - 
 * @returns {Promise<Object>} The updated inventory document.
 * @throws Will throw an error if the base item is not found.
 */
async function addItemToUser(userId, itemId, level = 1, rarity = 'COMMON') {
  // Create a new UserItem instance with the provided values.
  const newUserItem = new UserItem({
    user: userId,
    item: itemId,
    level: level,
    rarity: rarity
  });

  await newUserItem.save();
  await newUserItem.populate('item');
  return newUserItem;
}

const removeItemFromInventory = async (userId, itemId, quantity) => {
  const inventory = await getInventoryForUser(userId);

  const itemIndex = inventory.items.findIndex((invItem) => invItem.item._id.toString() === itemId);

  if (itemIndex === -1) throw new EError(404, 'Item not found in inventory.');

  if (inventory.items[itemIndex].quantity > quantity) {
    inventory.items[itemIndex].quantity -= quantity;
  } else {
    inventory.items.splice(itemIndex, 1); // Remove item if quantity is zero
  }

  await inventory.save();
  return inventory;
};

const initInventoryForUser = async (userId) => {
  const inventory = new Inventory({
    user: userId,
    items: [],
  });
  await inventory.save();

  return inventory;
}

const getInventoryForUser = async (userId) => {
  let inventory = await Inventory.findOne({ user: userId }).populate({
    path: 'items',
    populate: {
      path: 'item',
      model: 'Item'
    }
  });

  if (!inventory) {
    inventory = await initInventoryForUser(userId);
  }
  return inventory;
};

module.exports = {
  getInventoryForUser,
  removeItemFromInventory,
  addItemToUser
}