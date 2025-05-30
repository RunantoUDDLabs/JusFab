const DailyReward = require('../models/dailyReward.model');
const EError = require('../utils/EError');
const { addReward, getUnclaimedRewardsByReason } = require('./userRewards.service');

/**
 * Get the daily reward record for a user and recalculate the streak.
 * If the lastClaimedAt is neither today nor yesterday, the streak is reset to 0.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} The updated daily reward record.
 * @throws {Error} If the daily reward record is not found.
 */
async function getDailyReward(userId) {
  let dailyReward = await claimDailyReward(userId);
  return dailyReward;
}

// Your streak rewards array; index 0 is unused.
const streakRewards = [
  { type: "ENERGY", value: 50 },
  { type: "ENERGY", value: 70 },
  { type: "ENERGY", value: 100 },
  { type: "GOLD", value: 500 },
  { type: "GOLD", value: 1000 },
  { type: "ENERGY", value: 200 },
  { type: "GOLD", value: 2000 },
];

/**
 * Claim the daily reward for a user using the streak rewards.
 * If the claim is consecutive (last claimed was yesterday), the streak is incremented.
 * Otherwise, the streak resets to 1.
 * The reward is determined by the streak; if the streak is greater than the rewards array,
 * the highest reward (last element) is given.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} Object containing message, streak, reward details, and lastClaimedAt.
 */
async function claimDailyReward(userId) {
  let dailyReward = await DailyReward.findOne({ user: userId });
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (!dailyReward) {
    // Create a new record if none exists.
    dailyReward = new DailyReward({
      user: userId,
      lastClaimedAt: now,
      streak: 1,
    });
  } else {
    // Compare only date portion of lastClaimedAt
    const lastClaimStr = dailyReward.lastClaimedAt ? dailyReward.lastClaimedAt.toISOString().split('T')[0] : null;

    // If the last claim was today, return the current streak.
    if (lastClaimStr == todayStr) {
      return dailyReward;
    }

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // If the last claim was yesterday, increment streak; otherwise reset to 1.
    dailyReward.streak = (lastClaimStr === yesterdayStr) ? dailyReward.streak + 1 : 1;
    dailyReward.lastClaimedAt = now;
  }

  // Determine the reward based on the streak.
  // If streak exceeds available rewards, use the last element.
  let rewardIndex = ((dailyReward.streak - 1) % streakRewards.length);
  const bonus = Math.floor((dailyReward.streak - 1) / streakRewards.length) * 0.1;
  const reward = {...streakRewards[rewardIndex]};
  reward.value += reward.value * bonus;

  await addReward(userId, reward, "DAILY", dailyReward.streak);
  await dailyReward.save();

  return dailyReward;
}

module.exports = { getDailyReward, claimDailyReward };
