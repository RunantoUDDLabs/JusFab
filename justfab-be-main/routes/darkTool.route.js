const express = require('express');
const { addReward, getUserRewards } = require('../services/userRewards.service');
const UserRewards = require('../models/userRewards.model');
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');
const { getRewardByReferalCount } = require('../envents/referral.listener');
const router = express.Router();

/**
 * @swagger
 * /darkTool/addReward:
 *   post:
 *     tags:
 *       - darkTool
 *     summary: Add a reward for the authenticated user.
 *     description: >
 *       Adds a reward for the authenticated user by providing the reward data, an optional reason,
 *       and an optional level/count associated with that reason. Returns the updated rewards document.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reward
 *             properties:
 *               reward:
 *                 type: object
 *                 description: "The reward object (e.g., { 'type': 'GOLD', 'value': 100 })."
 *                 example:
 *                   type: GOLD
 *                   value: 100
 *               reason:
 *                 type: string
 *                 description: "Optional reason for the reward (e.g., 'daily streak', 'mission completion')."
 *                 example: "daily streak"
 *               level:
 *                 type: number
 *                 description: "Optional numerical value representing the count or streak for this reward."
 *                 example: 3
 *     responses:
 *       200:
 *         description: "Reward added successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reward added successfully."
 *                 userRewardsDoc:
 *                   type: object
 *                   description: "The updated user rewards document."
 *       400:
 *         description: "User ID and reward data are required."
 *       500:
 *         description: "Internal server error."
 */
router.post('/addReward', isAdmin, async (req, res, next) => {
  try {
    // Extract userId from the authenticated user (e.g., via middleware setting req.auth)
    const userId = req.auth.userId;
    const reward = req.body.reward;
    const reason = req.body.reason;
    const level = req.body.level;

    if (!userId || !reward) {
      return res.status(400).json({ error: 'User ID and reward data are required.' });
    }

    let rewardEntry = await addReward(userId, reward, reason, level);

    res.status(200).json({ reward: rewardEntry });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /darkTool/resetAllData:
 *   post:
 *     tags:
 *       - darkTool
 *     summary: Reset all user-related data.
 *     description: >
 *       Resets all user-related data including daily rewards, inventory, referrals, user items, user rewards, and user tasks.
 *       Also resets user attributes such as gold, token, energy, and food.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirm:
 *                 type: string
 *                 description: "Confirmation to reset all data."
 *                 example: "yes"
 *     responses:
 *       200:
 *         description: "All data has been reset."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All data has been reset."
 *                 deletedRecords:
 *                   type: object
 *                   properties:
 *                     dailyRewards:
 *                       type: integer
 *                       example: 10
 *                     inventory:
 *                       type: integer
 *                       example: 5
 *                     referrals:
 *                       type: integer
 *                       example: 3
 *                     userItems:
 *                       type: integer
 *                       example: 7
 *                     userRewards:
 *                       type: integer
 *                       example: 12
 *                     userTasks:
 *                       type: integer
 *                       example: 8
 *                     users:
 *                       type: integer
 *                       example: 20
 *       500:
 *         description: "Internal server error."
 */
router.post('/resetAllData', isAdmin, async (req, res, next) => {
  try {
    const confirm = req.body.confirm;

    const DailyReward = require('../models/dailyReward.model');
    const Inventory = require('../models/inventory.model');
    const Referral = require('../models/referral.model');
    const UserItem = require('../models/userItem.model');
    const UserRewards = require('../models/userRewards.model');
    const User = require('../models/user.model');
    const UserTask = require('../models/userTask.model');

    const dailyRewardCount = await DailyReward.countDocuments({});
    const inventoryCount = await Inventory.countDocuments({});
    const referralCount = await Referral.countDocuments({});
    const userItemCount = await UserItem.countDocuments({});
    const userRewardsCount = await UserRewards.countDocuments({});
    const userTaskCount = await UserTask.countDocuments({});
    const userCount = await User.countDocuments({});

    if (confirm !== 'yes') {
      return res.status(200).json({
        message: 'Confirmation is required to reset all data.',
        deletedRecords: {
          dailyRewards: dailyRewardCount,
          inventory: inventoryCount,
          referrals: referralCount,
          userItems: userItemCount,
          userRewards: userRewardsCount,
          userTasks: userTaskCount,
          users: userCount
        }
      });
    }

    await DailyReward.deleteMany({});
    await Inventory.deleteMany({});
    await Referral.deleteMany({});
    await UserItem.deleteMany({});
    await UserRewards.deleteMany({});
    await UserTask.deleteMany({});
    await User.updateMany({}, { $set: { gold: 0, token: 0, energy: 50, food: 0 } });

    res.status(200).json({
      message: 'All data has been reset.',
      deletedRecords: {
        dailyRewards: dailyRewardCount,
        inventory: inventoryCount,
        referrals: referralCount,
        userItems: userItemCount,
        userRewards: userRewardsCount,
        userTasks: userTaskCount,
        users: userCount
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /darkTool/referral/addReward:
 *   post:
 *     tags:
 *       - darkTool
 *     summary: Add rewards for referrals.
 *     description: >
 *       Adds rewards for a user based on the referral count. The rewards are determined by the referral count and are added to the user's account.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: "The ID of the user to add rewards for. Defaults to the authenticated user."
 *                 example: "64f8c0e5b2a1d2a3e4f5g6h7"
 *               count:
 *                 type: number
 *                 description: "The number of referrals to process rewards for. Defaults to 1."
 *                 example: 3
 *     responses:
 *       200:
 *         description: "Rewards added successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reward:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: "The list of rewards added for the user."
 *       500:
 *         description: "Internal server error."
 */
router.post('/referral/addReward', isAdmin, async (req, res, next) => {
  try {
    const userId = req.body.userId || req.auth.userId;
    const count = req.body.count || 1;
    
    const returnRewards = [];

    for (let i = 0; i < count; i++) {
      const rewards = getRewardByReferalCount(i + 1);
      for (const reward of rewards) {
        returnRewards.push(await addReward(userId, reward, "REFERRAL", i + 1));
      }
    } 

    res.status(200).json({ reward: returnRewards });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /darkTool/migrateRewardsToSumable:
 *   post:
 *     tags:
 *       - darkTool
 *     summary: Migrate user rewards to sumable format.
 *     description: >
 *       Migrates user rewards to a sumable format for specified users. This process consolidates rewards of the same type and level into a single entry.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "List of user IDs to process."
 *                 example: ["64f8c0e5b2a1d2a3e4f5g6h7", "64f8c0e5b2a1d2a3e4f5g6h8"]
 *               confirm:
 *                 type: string
 *                 description: "Confirmation to apply changes. Use 'yes' to confirm."
 *                 example: "no"
 *     responses:
 *       200:
 *         description: "Rewards migrated successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         description: "The ID of the user."
 *                         example: "64f8c0e5b2a1d2a3e4f5g6h7"
 *                       noOldRewards:
 *                         type: integer
 *                         description: "The number of old rewards before migration."
 *                         example: 10
 *                       noNewRewards:
 *                         type: integer
 *                         description: "The number of new rewards after migration."
 *                         example: 5
 *                       newRewards:
 *                         type: array
 *                         items:
 *                           type: object
 *                         description: "The list of new rewards after migration."
 *       500:
 *         description: "Internal server error."
 */
router.post('/migrateRewardsToSumable', isAdmin, async (req, res, next) => {
  try {
    const userIds = req.body.userIds;
    const confirm = req.body.confirm;
    const logs = [];
    for(let id of userIds) {
      const userRewards = await getUserRewards(id);
      const newRewards = [];
      const refLevelAdded = [];
      const noOldRewards = userRewards.rewards.length;
      for(let i = 0; i < userRewards.rewards.length; i++) {
        const reward = userRewards.rewards[i];
        if(reward.reason !== "REFERRAL"){
          newRewards.push(reward);
          continue;
        }
        if(refLevelAdded.includes(reward.level)) continue;
        refLevelAdded.push(reward.level);
        //PROCESS REF REWARD WITH LEVEL
        const newRefRewards = getRewardByReferalCount(reward.level);
        for(let j = 0; j < newRefRewards.length; j++) {
          const newRefReward = newRefRewards[j];
          if(newRefReward.sumable) {
            const existingRewardEntry = newRewards.find(
              entry => entry.reason === "REFERRAL" && entry.reward.sumable && entry.reward.type == newRefReward.type
            );
            if (existingRewardEntry) {
              existingRewardEntry.reward.value = (existingRewardEntry.reward.value || 0) + (newRefReward.value || 0);
              existingRewardEntry.level = reward.level || existingRewardEntry.level;
              continue;
            }
          }
          newRewards.push({reward: newRefReward, reason: "REFERRAL", level: reward.level});
        }
      }

      logs.push({
        userId: id,
        noOldRewards,
        noNewRewards: newRewards.length,
        newRewards
      })

      if(confirm == "yes") {
        userRewards.rewards = newRewards;
        await userRewards.save();
      }
    }
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;