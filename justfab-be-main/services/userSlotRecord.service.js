const UserSlotRecord = require('../models/userSlotRecord.model');
const EError = require('../utils/EError'); // Custom error class

/**
 * Create a new user slot record
 */
async function createUserSlotRecord(userId) {
  try {
    const existingRecord = await UserSlotRecord.findOne({ userId });
    if (existingRecord) {
      throw new EError(400, 'User slot record already exists');
    }

    const newRecord = new UserSlotRecord({ userId });
    await newRecord.save();
    return newRecord;
  } catch (error) {
    throw new EError(500, error.message);
  }
}

/**
 * Get a user slot record by userId
 */
async function getUserSlotRecord(userId) {
  try {
    const record = await UserSlotRecord.findOne({ userId });
    if (!record) {
      return createUserSlotRecord(userId);
    }
    return record;
  } catch (error) {
    throw new EError(500, error.message);
  }
}

/**
 * Claim energy for a user
 */
async function claimEnergy(userId) {
  try {
    const record = await getUserSlotRecord(userId);
    const newEnergy = record.calculateEnergy();
    await record.save();
    return { energy: newEnergy };
  } catch (error) {
    throw new EError(500, error.message);
  }
}

/**
 * Add a record for the user (e.g., win/lose results)
 */
async function addSlotRecord(userId, result) {
  try {
    const record = await getUserSlotRecord(userId);
    record.records.push({ result });
    await record.save();
    return record;
  } catch (error) {
    throw new EError(500, error.message);
  }
}

module.exports = {
  createUserSlotRecord,
  getUserSlotRecord,
  claimEnergy,
  addSlotRecord
};
