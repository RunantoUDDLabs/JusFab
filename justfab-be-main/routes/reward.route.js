// routes/rewardRoutes.js

const express = require('express');
const router = express.Router();
const { updateRewardClaimStatus, getUnclaimedRewards, getUserRewards, getUnclaimedRewardsByReason, claimReward, claimRewards } = require('../services/userRewards.service'); // Adjust the path as needed
const EError = require('../utils/EError');
const { isAuth } = require('../middlewares/auth.middleware');
const User = require('../models/user.model');
const { getDailyReward, claimDailyReward } = require('../services/dailyReward.service');

/**
 * @swagger
 * tags:
 *   - name: reward
 *     description: Endpoints for retrieving reward.
 */

/**
 * @swagger
 * /reward/claim:
 *   post:
 *     tags:
 *       - reward
 *     security:
 *       - bearerAuth: []
 *     summary: Claim a reward for the authenticated user.
 *     description: >
 *       Claims a reward for the authenticated user. The userId is obtained from req.auth.userId.
 *       The request body must include the rewardId of the reward to be claimed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewardId
 *             properties:
 *               rewardId:
 *                 type: string
 *                 description: The ID of the reward to be claimed.
 *     responses:
 *       200:
 *         description: The updated UserRewards document after claiming the reward.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserRewards"
 *       400:
 *         description: Missing userId or rewardId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "userId and rewardId are required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post('/claim', isAuth, async (req, res, next) => {
  try {
    // userId is extracted from the authenticated user (e.g., via middleware setting req.auth)
    const userId = req.auth.userId;
    const { rewardId } = req.body;
    if (!userId || !rewardId) {
      next(new EError(400, 'userId and rewardId are required.'));
    }

    // Claim the reward by setting the claimedStatus to true.
    const updatedUserRewards = await claimReward(userId, rewardId);
    res.status(200).json({ reward: updatedUserRewards });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /reward/claimMany:
 *   post:
 *     tags:
 *       - reward
 *     security:
 *       - bearerAuth: []
 *     summary: Claim multiple rewards for the authenticated user.
 *     description: >
 *       Claims multiple rewards for the authenticated user. The userId is obtained from req.auth.userId.
 *       The request body must include an array of rewardIds to be claimed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewardIds
 *             properties:
 *               rewardIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of reward IDs to be claimed.
 *     responses:
 *       200:
 *         description: The updated UserRewards documents after claiming the rewards.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rewards:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/UserRewards"
 *       400:
 *         description: Missing userId or rewardIds.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "userId and rewardIds are required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post('/claimMany', isAuth, async (req, res, next) => {
  try {
    // userId is extracted from the authenticated user (e.g., via middleware setting req.auth)
    const userId = req.auth.userId;
    const { rewardIds } = req.body;
    if (!userId || !rewardIds) {
      next(new EError(400, 'userId and rewardIds are required.'));
    }

    const updatedUserRewards = await claimRewards(userId, rewardIds);
    res.status(200).json({ rewards: updatedUserRewards });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /reward/unclaimed:
 *   get:
 *     tags:
 *       - reward
 *     security:
 *       - bearerAuth: []
 *     summary: Get all unclaimed rewards for the authenticated user.
 *     description: >
 *       Retrieves all rewards that have not been claimed by the authenticated user.
 *       The userId is obtained from req.auth.userId.
 *     responses:
 *       200:
 *         description: A list of unclaimed rewards.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/RewardEntry"
 *       400:
 *         description: Invalid request or missing user ID.
 *       404:
 *         description: User rewards document not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/unclaimed', isAuth, async (req, res, next) => {
  try {
    // userId is extracted from the authenticated user (via middleware setting req.auth)
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // Retrieve unclaimed rewards from the user's rewards document
    const unclaimedRewards = await getUnclaimedRewards(userId);
    res.status(200).json(unclaimedRewards);
  } catch (error) {
    next(new EError(500, 'userId and rewardId are required.', error));
  }
});

/**
 * @swagger
 * /reward/daily:
 *   get:
 *     tags: [reward]
 *     summary: Get the daily reward record for the authenticated user.
 *     description: >
 *       Retrieves the daily reward record for the current user and recalculates the streak. 
 *       If the last claim was not made today or yesterday, the streak is reset to 0.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily reward record retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "609d1f2c8f8a2b001c8d4567"
 *                 user:
 *                   type: string
 *                   example: "603d9b8f2a3d2b4e8a2d92b6"
 *                 lastClaimedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-02-20T15:30:00Z"
 *                 streak:
 *                   type: number
 *                   example: 3
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/daily', isAuth, async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const dailyRewardRecord = await claimDailyReward(userId);
    const rewards = await getUnclaimedRewardsByReason(userId, "DAILY");
    res.status(200).json({ record: dailyRewardRecord, rewards });
  } catch (error) {
    next(error);
  }
});

module.exports = router;