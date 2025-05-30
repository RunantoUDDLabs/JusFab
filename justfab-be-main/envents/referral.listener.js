const Referral = require("../models/referral.model");
const { addReward } = require("../services/userRewards.service");
const logger = require("../utils/logger");
const userEvents = require("./user.event");


const resetCount = 999;

const milestoneReward = {
  "1": { type: 'ENERGY', value: 10 },
  "2": { type: 'ENERGY', value: 20 },
  "3": { type: 'ENERGY', value: 30 },
  "10": { type: 'ENERGY', value: 100 },
  "20": { type: 'ENERGY', value: 200 },
  "50": { type: 'ENERGY', value: 400 },
  "100": { type: 'ENERGY', value: 600 },
  "200": { type: 'ENERGY', value: 800 },
  "500": { type: 'ENERGY', value: 1000 },
  "1000": { type: 'NFT', value: 1 },
  "2000": { type: 'NFT', value: 1 },
  "3000": { type: 'NFT', value: 1 },
}

const rangeReward = [
  { min: 1, max: 1, reward: { type: "GOLD", value: 100 } },
  { min: 2, max: 2, reward: { type: "GOLD", value: 100 } },
  { min: 3, max: 9, reward: { type: "GOLD", value: 100 } },
  { min: 11, max: 19, reward: { type: "GOLD", value: 200 } },
  { min: 21, max: 49, reward: { type: "GOLD", value: 400 } },
  { min: 51, max: 99, reward: { type: "GOLD", value: 600 } },
  { min: 101, max: 199, reward: { type: "GOLD", value: 800 } },
  { min: 201, max: 499, reward: { type: "GOLD", value: 1000 } },
  { min: 501, max: 999, reward: { type: "GOLD", value: 1200 } },
  { min: 1001, max: 1999, reward: { type: "GOLD", value: 1500 } },
  { min: 2001, max: 2999, reward: { type: "GOLD", value: 1500 } },
  { min: 3001, max: Infinity, reward: { type: "GOLD", value: 1500 } },
]

const getRewardByReferalCount = (n) => {
  // n = n % 999;
  // if (n == 0) n = 999;
  const rewards = [];
  if (milestoneReward[n.toString()]) rewards.push({...milestoneReward[n.toString()], keepAfterCalimed: true, sumable: false});
  for (let i = 0; i < rangeReward.length; i++) {
    const range = rangeReward[i];
    if ((n >= range.min) && (n <= range.max)) {
      rewards.push({...range.reward, keepAfterCalimed: false, sumable: true});
      break;
    }
  }

  return rewards;
}

userEvents.on("beReferred", async (referredUser) => {
  try {
    const ref = await Referral.findOne({ 'referred': referredUser._id });
    if (!ref) return;
    if (ref.onboarded) return;
    const count = await Referral.countDocuments({ referrer: ref.referrer })
    const rewards = getRewardByReferalCount(count);
    for (const r of rewards) {
      await addReward(ref.referrer, r, "REFERRAL", count);
    }
    ref.onboarded = true;
    await ref.save();
    logger.info(`${referredUser.username || referredUser.telegram.id} has just onboarded.`);
    logger.info(`${ref.referrer} recruited ${count} friends. Got ...`);
    return;
  } catch (e) {
    throw e;
    logger.error(e);
  }
})

module.exports = {getRewardByReferalCount}