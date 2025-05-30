const EError = require('../utils/EError');
const logger = require('../utils/logger');
const { addItemToUser } = require('./inventory.service');
const { getRandomItemByRarity, getItemById } = require('./item.service');
const User = require('../models/user.model');

/**
 * Applies a single reward data to a user's property.
 *
 * @param {Object} user - The user object (must have an _id and properties like gold, token, food).
 * @param {Object} reward - The reward object to be applied (must include at least a 'type' and 'value'; for ITEM, reward.item should have a rarity).
 * @param {Number} [betX=1] - Optional multiplier to adjust the reward's value.
 * @returns {Promise<Object>} - Returns the updated reward data after applying it to the user.
 * @throws {Error} - Throws an error if reward data is invalid.
 */
const applySingleRewardToUser = async (user, reward, betX = 1) => {
  logger.info(`add reward ${reward.type} x ${betX} x ${reward.value} to ${user.username || user.telegram.id}`);

  if (!reward || !reward.type) {
    throw new EError(400, 'Invalid reward data provided.');
  }
  switch (reward.type) {
    case 'GOLD':
      reward.value *= betX;
      user.gold = (user.gold || 0) + reward.value;
      break;

    case 'TOKEN':
      reward.value *= betX;
      user.token = (user.token || 0) + reward.value;
      break;

    case 'FOOD':
      reward.value *= betX;
      user.food = (user.food || 0) + reward.value;
      break;

    case 'ENERGY':
      reward.value *= betX;
      user.energy = (user.energy || 0) + reward.value;
      break;

    case 'ITEM':
      let item, claimedItem;
      if (reward.item && reward.item.rarity) {
        item = await getRandomItemByRarity(reward.item.rarity);
        if (item) {
          claimedItem = await addItemToUser(
            user._id,
            item._id,
            betX,
            reward.item.rarity
          );
          reward.item = claimedItem;
        } else {
          // If no item is found, update the reward data and optionally store it for later processing.
          reward.item.level = betX;
          throw reward;
        }
      }
      break;

    case 'POOL_PERCENTAGE':
      reward.value *= betX;
      throw reward;
      break;

    case 'SPIN':
    case 'JACKPOT':
      break;

    default:
      // Optionally handle unsupported reward types.
      throw reward;
      break;
  }

  return reward;
};

/**
 * Applies rewards from play scripts to a user. For each reward in the play scripts,
 * it attempts to apply the reward to the user. If the reward cannot be claimed yet,
 * it adds the reward to the user's pending rewards.
 *
 * @async
 * @function applyPlayScriptsRewardsToUser
 * @param {Object} user - The user object to whom the rewards will be applied.
 * @param {Array} playScripts - An array of play script objects. Each play script contains
 *                              a list of rewards and a bet multiplier (betX).
 * @returns {Promise<Object>} A promise that resolves to an object containing the play scripts.
 * @throws {EError} Throws an error if applying rewards to the user fails.
 */
const applyPlayScriptsRewardsToUser = async (user, playScripts) => {
  const { addReward } = require('./userRewards.service');
  try {
    const rewards = [];

    for (let turn of playScripts) {
      for (let reward of turn.rewards) {
        try {
          reward = await applySingleRewardToUser(user, reward, turn.betX);
        } catch (e) {
          if (e.type) // if rewards not claimable yet.
            await addReward(user._id, reward, "SLOT_MACHINE");
        }
        rewards.push(reward);
      };
    }

    return { playScripts };
  } catch (e) {
    throw new EError(500, "apply reward to user failed", e);
  }
};

module.exports = {
  applySingleRewardToUser,
  applyPlayScriptsRewardsToUser,
};