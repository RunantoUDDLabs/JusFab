// referralService.js
const User = require('../models/user.model');
const Referral = require('../models/referral.model');
const EError = require('../utils/EError');
const { getUserByTelegramId } = require('./user.service');
const userEvents = require('../envents/user.event');

/**
 * Creates a referral record linking a referrer (by username) to a referred user.
 *
 * @param {string} referrerTelegramId - The username of the referrer.
 * @param {string} referredUserId - The ObjectId of the referred user.
 * @returns {Promise<Object>} The created referral record.
 * @throws {Error} If inputs are missing, a referral already exists, or the referrer is not found.
 */
async function createReferral(referrerTelegramId, referredUserId, onboarded = false) {
  // Check if the referred user already has a referral record.
  const existingReferral = await Referral.findOne({ referred: referredUserId });
  if (existingReferral) {
    throw new EError(405, 'Referral already exists for this user.');
  }

  // Find the referrer using their username.
  const referrerUser = await getUserByTelegramId(referrerTelegramId);
  if (!referrerUser) {
    throw new EError(404, 'Referrer not found.');
  }

  // Create the referral record linking the referrer and the referred user.
  const newReferral = new Referral({
    referrer: referrerUser._id,
    referred: referredUserId,
    onboarded
  });

  await newReferral.save();

  try {
    const referedUser = await User.findById(referredUserId);
    await userEvents.asyncEmit('beReferred', referedUser);
  } catch (e) {
    throw new EError(500, e.message, e);
  }

  return newReferral;
}

module.exports = {
  createReferral,
};
