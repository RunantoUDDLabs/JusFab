const EError = require('../utils/EError');
const UserRewards = require('../models/userRewards.model'); // adjust the path as needed
const User = require('../models/user.model');
const { applySingleRewardToUser } = require('./reward.service');

/**
 * Create a new UserRewards document for a user.
 * Optionally initializes with an array of reward IDs.
 * @param {String} userId - The user ID.
 * @param {Array} rewardIds - An optional array of reward IDs.
 * @returns {Promise<Object>} The created UserRewards document.
 */
const createUserRewards = async (userId, rewardIds = []) => {
  // Map each rewardId to an entry in the rewards array.
  const rewards = rewardIds.map(rewardId => ({ reward: rewardId }));
  const userRewardsDoc = await UserRewards.create({ user: userId, rewards });
  return userRewardsDoc;
}

/**
 * Retrieve the UserRewards document for a specific user.
 * Populates the reward field with details from the Reward model.
 * @param {String} userId - The user ID.
 * @returns {Promise<Object>} The found UserRewards document.
 */
const getUserRewards = async (userId) => {
  const userRewardsDoc = await UserRewards.findOne({ user: userId });
  if (userRewardsDoc == null) return await createUserRewards(userId);
  return userRewardsDoc;
}

/**
 * Get unclaimed rewards for a specific user.
 * @param {String} userId - The ObjectId of the user as a string.
 * @returns {Promise<Array>} - A promise that resolves to an array of unclaimed rewards.
 */
const getUnclaimedRewards = async (userId) => {
  try {
    // Retrieve the user's rewards document
    const userRewards = await getUserRewards(userId)
    if (!userRewards) {
      // If the user has no rewards document, return an empty array
      return [];
    }
    // Filter the rewards array to include only rewards that have not been claimed
    const unclaimedRewards = userRewards.rewards.filter(reward => !reward.claimed);
    return unclaimedRewards;
  } catch (error) {
    // Handle or log error as needed
    throw new EError(500, 'Error retrieving unclaimed rewards: ', error);
  }
}

/**
 * Get unclaimed rewards for a specific user, filtered by reason.
 * @param {String} userId - The ObjectId of the user as a string.
 * @param {String} reason - The reason to filter rewards by (e.g., "daily streak", "referral bonus").
 * @returns {Promise<Array>} - A promise that resolves to an array of unclaimed rewards matching the reason.
 */
const getUnclaimedRewardsByReason = async (userId, reason) => {
  try {
    // Retrieve the user's rewards document
    const userRewards = await getUserRewards(userId);
    if (!userRewards) {
      // If the user has no rewards document, return an empty array
      return [];
    }
    // Filter the rewards array to include only rewards that have not been claimed and match the given reason
    const unclaimedRewards = userRewards.rewards.filter(reward => !reward.claimed && reward.reason === reason);
    return unclaimedRewards;
  } catch (error) {
    // Handle or log error as needed
    throw new EError(500, 'Error retrieving unclaimed rewards by reason: ', error);
  }
};

// /**
//  * Update the claimed status of a specific reward entry for a user.
//  * @param {String} userId - The user ID.
//  * @param {String} rewardId - The reward ID.
//  * @param {Boolean} claimedStatus - The new claimed status.
//  * @returns {Promise<Object>} The updated Reward document.
//  */
// const updateRewardClaimStatus = async (userId, rewardId, claimedStatus) => {
//   const user = await User.findById(userId);
//   const userRewardsDoc = await UserRewards.findOne({ user: userId });
//   if (!userRewardsDoc) {
//     throw new EError(404, 'User rewards document not found');
//   }
//   // Find the reward entry with the matching reward ID.
//   const rewardEntry = userRewardsDoc.rewards.find(entry => entry._id.toString() === rewardId);
//   if (!rewardEntry) {
//     throw new EError(404, 'Reward entry not found');
//   }

//   let reward = rewardEntry;

//   if (!rewardEntry.claimed && claimedStatus) {
//     try {
//       reward = await applySingleRewardToUser(user, rewardEntry.reward);
//     } catch (e) { }
//   }

//   rewardEntry.claimed = claimedStatus;
//   await user.save()
//   await userRewardsDoc.save();
//   return reward;
// }

/**
 * Add a new reward to the user's rewards collection.
 * Creates a new UserRewards document if one does not exist.
 * @param {String} userId - The user ID.
 * @param {String} rewardId - The reward ID to add.
 * @returns {Promise<Object>} The updated UserRewards document.
 */
const addReward = async (userId, reward, reason = undefined, level = undefined) => {
  let userRewardsDoc = await getUserRewards(userId);
  
  if(reward.sumable) {
    const existingRewardEntry = userRewardsDoc.rewards.find(
      entry => entry.reason === reason && entry.reward.sumable && entry.reward.type === reward.type && !entry.claimed
    );
    if (existingRewardEntry) {
      existingRewardEntry.reward.value = (existingRewardEntry.reward.value || 0) + (reward.value || 0);
      existingRewardEntry.level = level || existingRewardEntry.level;
      await userRewardsDoc.save();
      return existingRewardEntry;
    }
  }

  let rewardEntry = { reward: reward, reason, level };
  userRewardsDoc.rewards.push(rewardEntry);
  await userRewardsDoc.save();
  return rewardEntry;
}

// /**
//  * Remove a reward from the user's rewards collection.
//  * @param {String} userId - The user ID.
//  * @param {String} rewardId - The reward ID to remove.
//  * @returns {Promise<Object>} The updated UserRewards document.
//  */
// removeReward = async (userId, rewardId) => {
//   const userRewardsDoc = await UserRewards.findOne({ user: userId });
//   if (!userRewardsDoc) {
//     throw new EError(400, 'User rewards document not found');
//   }
//   // Filter out the reward entry that matches the reward ID.
//   userRewardsDoc.rewards = userRewardsDoc.rewards.filter(
//     entry => entry.reward.toString() !== rewardId
//   );
//   await userRewardsDoc.save();
//   return userRewardsDoc;
// }

// /**
//  * Delete the entire UserRewards document for a user.
//  * @param {String} userId - The user ID.
//  * @returns {Promise<Object>} The deleted UserRewards document.
//  */
// deleteUserRewards = async (userId) => {
//   const deletedDoc = await UserRewards.findOneAndDelete({ user: userId });
//   return deletedDoc;
// }

/**
 * Claim a specific reward for a user.
 * It finds the reward entry for the given rewardId, checks if it's not already claimed,
 * then marks it as claimed.
 *
 * @param {String} userId - The ID of the user.
 * @param {String} rewardId - The ID of the reward._id to claim.
 * @returns {Promise<Object>} The claimed reward entry.
 * @throws Will throw an error if the user rewards document or reward entry is not found,
 *         or if the reward is already claimed.
 */
const claimReward = async (userId, rewardId) => {
  // Find the user's rewards document and populate the reward details.
  const userRewardsDoc = await UserRewards.findOne({ user: userId }).populate('rewards.reward');
  if (!userRewardsDoc) {
    throw new EError(404, 'User rewards document not found');
  }

  // Locate the reward entry that matches the provided rewardId.
  const rewardEntry = userRewardsDoc.rewards.find(entry =>
    (entry.reward && entry.reward._id.toString() === rewardId) && (!entry.claimed)
  );

  if (!rewardEntry) {
    throw new EError(404, 'Reward entry not found');
  }

  if (rewardEntry.claimed) {
    throw new EError(404, 'Reward already claimed');
  }

  try {
    let user = await User.findById(userId);
    let reward = await applySingleRewardToUser(user, rewardEntry.reward)
    await user.save();
    rewardEntry.claimed = true;
    userRewardsDoc.rewards = userRewardsDoc.rewards.filter(r => !r.claimed)
    await userRewardsDoc.save();
    return rewardEntry;
  } catch (e) {
    throw e;
  }
}

/**
 * Claims rewards for a user by marking them as claimed and applying them to the user's account.
 *
 * @async
 * @function claimRewards
 * @param {string} userId - The ID of the user claiming the rewards.
 * @param {string[]} rewardIds - An array of reward IDs to be claimed.
 * @returns {Promise<Object[]>} A promise that resolves to an array of applied reward entries.
 * @throws {Error} Throws an error if the user rewards document is not found or if any other issue occurs during the process.
 */
const claimRewards = async (userId, rewardIds) => {
  
  try {
    const userRewardsDoc = await UserRewards.findOne({ user: userId }).populate('rewards.reward');
    if (!userRewardsDoc) {
      throw new EError(404, 'User rewards document not found');
    }
    let user = await User.findById(userId);
    let rewardEntries = [];
    
    for(let i=0;i<rewardIds.length;i++){ 
      const rewardEntry = userRewardsDoc.rewards.find(entry =>
        (entry.reward && entry.reward._id.toString() === rewardIds[i]) && (!entry.claimed)
      );
      if (!rewardEntry) {
        continue;
      }
      if (rewardEntry.claimed) {
        continue;
      }
      rewardEntry.claimed = true;
      let reward = await applySingleRewardToUser(user, rewardEntry.reward)
      rewardEntries.push(rewardEntry);
    }
    await user.save();
    userRewardsDoc.rewards = userRewardsDoc.rewards.filter(r => !r.claimed)
    await userRewardsDoc.save();
    return rewardEntries;
  } catch (e) {
    throw e;
  }
}

// /**
//  * Claim all unclaimed rewards for a user.
//  * This method finds all reward entries that have not yet been claimed and marks them as claimed.
//  *
//  * @param {String} userId - The ID of the user.
//  * @returns {Promise<Array>} An array of reward entries that were claimed.
//  * @throws Will throw an error if the user rewards document is not found or there are no rewards to claim.
//  */
// claimAllRewards = async (userId) => {
//   // Retrieve the user's rewards document with populated reward details.
//   const userRewardsDoc = await UserRewards.findOne({ user: userId }).populate('rewards.reward');
//   if (!userRewardsDoc) {
//     throw new Error('User rewards document not found');
//   }

//   // Filter for all unclaimed rewards.
//   const unclaimedRewards = userRewardsDoc.rewards.filter(entry => !entry.claimed);
//   if (unclaimedRewards.length === 0) {
//     throw new Error('No rewards to claim');
//   }

//   // Mark each unclaimed reward as claimed.
//   unclaimedRewards.forEach(entry => {
//     entry.claimed = true;
//   });

//   await userRewardsDoc.save();
//   return unclaimedRewards;
// }


module.exports = {
  addReward,
  getUserRewards,
  claimReward,
  getUnclaimedRewards,
  getUnclaimedRewardsByReason,
  claimRewards
  // updateRewardClaimStatus
};
