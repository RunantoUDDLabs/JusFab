const User = require("../models/user.model");
const EError = require("../utils/EError");

module.exports.createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
}

module.exports.getUserByUsername = async (username) => {
  const users = await User.find({ username: username });
  return users[0];
}

module.exports.getUserByTelegramId = async (id) => {
  try {
    id = Number(id);
    const user = await User.findOne({
      $or: [
        { 'telegram.id': id },
        { 'telegram.userId': id }
      ]
    });
    return user;
  } catch (e) {
    throw new EError(500, "error get user by telegram id", e);
  }
}

/**
 * Retrieves a user by their unique ID.
 *
 * @param {String} id - The ID of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the user object, or null if not found.
 */
module.exports.getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (e) {
    throw new EError(500, "error get user by id", e);
  }
};

/**
 * Claim energy for a user, regenerating based on time elapsed.
 * @param {String} userId - The ID of the user
 * @returns {Object} The updated user object
 */
module.exports.claimEnergy = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new EError(400, `User not found. ${userId}`);
  }

  try {
    const now = new Date();
    const lastClaim = user.claimEnergyAt || now;
    const minutesPassed = Math.floor((now - lastClaim) / 60000); // Convert ms to minutes
    const newEnergy = Math.min(minutesPassed, 50) + user.bonusEnergy;

    if (newEnergy > 0) {
      user.energy += newEnergy;
      user.claimEnergyAt = now; // Update last claim timestamp
      user.bonusEnergy = 0;
      await user.save();
    }

    return {
      energy: user.energy,
      lastClaimed: user.claimEnergyAt
    };
  } catch (e) {
    throw new EError(500, "error claim energy");
  }
};


/**
 * Retrieves a paginated and sorted list of users from the database by searching for a phrase in telegram ID or telegram username.
 *
 * @param {string} phrase - The search phrase to match against telegram ID or telegram username.
 * @param {number} page - The current page number.
 * @param {number} itemsPerPage - The number of items to display per page.
 * @param {Object} sort - The sorting criteria (e.g., { username: 1 } for ascending, { username: -1 } for descending).
 * @returns {Promise<Array>} A promise that resolves to an array of user objects.
 */
module.exports.getUsersWithSearch = async ({ phrase, page, itemsPerPage, sort = {} }) => {
  try {
    const searchQuery = phrase?.length ? {
      $or: [
        { 'telegram.id': { $regex: phrase, $options: 'i' } },
        { 'telegram.userId': { $regex: phrase, $options: 'i' } },
        { 'telegram.username': { $regex: phrase, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(searchQuery)
      .sort(sort)
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);
    return users;
  }
  catch (e) {
    throw new EError(500, "error get users with search", e);
  }
}

/**
 * Counts the total number of users matching a search phrase in telegram ID or telegram username.
 *
 * @param {string} phrase - The search phrase to match against telegram ID or telegram username.
 * @returns {Promise<number>} A promise that resolves to the count of matching users.
 */
module.exports.countUsersWithSearch = async ({ phrase }) => {
  try {
    const searchQuery = phrase?.length ? {
      $or: [
        { 'telegram.id': { $regex: phrase, $options: 'i' } },
        { 'telegram.userId': { $regex: phrase, $options: 'i' } },
        { 'telegram.username': { $regex: phrase, $options: 'i' } }
      ]
    } : {};

    const count = await User.countDocuments(searchQuery);
    return count;
  }
  catch (e) {
    throw new EError(500, "error count users with search");
  }
}