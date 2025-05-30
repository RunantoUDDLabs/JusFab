const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');
const { botUsername } = require('../config/telegram.config');
const EError = require('../utils/EError');
const Referral = require('../models/referral.model');
const { getUnclaimedRewardsByReason, claimReward, claimRewards } = require('../services/userRewards.service');
const { getUserByTelegramId } = require('../services/user.service');

/**
 * @swagger
 * /referral/link:
 *   get:
 *     tags:
 *       - referral
 *     summary: Generate a Telegram referral link for the authenticated user.
 *     description: Returns a Telegram referral link using the authenticated user's telegramId from the bearer token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral link generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referralLink:
 *                   type: string
 *                   example: "https://t.me/your_bot_username?start=johnDoe"
 *       400:
 *         description: Invalid authentication credentials.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/link', isAuth, async (req, res, next) => {
  try {
    // Extract telegramId from req.auth, which should be set by your Bearer authentication middleware.
    const telegramId = req.auth && req.auth.telegramId;

    if (!telegramId) {
      return res.status(400).json({ error: 'Invalid authentication credentials.' });
    }

    // Build the Telegram referral link using the user's username as the referral code
    const referralLink = `https://t.me/${botUsername}?start=${encodeURIComponent(telegramId)}`;

    return res.status(200).json({ referralLink });
  } catch (error) {
    next(new EError(500, "", error))
  }
});

/**
 * @swagger
 * /referral/count:
 *   get:
 *     tags:
 *       - referral
 *     summary: Get the count of referred users and the number who have completed onboarding.
 *     description: >
 *       This endpoint returns the total count of users referred by the authenticated user (referrer),
 *       and the count of those who have completed onboarding.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched referral counts and onboarded users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of users referred by the authenticated user.
 *                   example: 5
 *                 onboarded:
 *                   type: integer
 *                   description: Total number of users who have completed onboarding.
 *                   example: 3
 *       401:
 *         description: Unauthorized. User needs to be authenticated.
 *       500:
 *         description: Internal server error.
 */

router.get('/count', isAuth, async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    const count = await Referral.countDocuments({ referrer: userId });
    const onboarded = await Referral.countDocuments({referrer: userId, onboarded: true});
    const rewards = await getUnclaimedRewardsByReason(userId, "REFERRAL")
    const rewardIds = rewards.filter(r => r.reward.sumable).map((r) => r.reward._id.toString())
    const unsumRewards = rewards.filter(r => !r.reward.sumable);
    const claimedRewards = await claimRewards(userId, rewardIds);

    return res.status(200).json({ count, onboarded, total: rewards.length, sumRewards: claimedRewards, rewards: unsumRewards });
  } catch (error) {
    next(new EError(500, error.message, error))
  }
});

/**
 * @swagger
 * /referral/tree/{userId}:
 *   get:
 *     tags:
 *       - referral
 *     summary: Get the referral tree for a specific user by userId.
 *     description: >
 *       This endpoint returns the specified user's referrer and all the users they have referred.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose referral tree is to be fetched.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched referral tree.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referrer:
 *                   type: object
 *                   description: The user who referred the specified user.
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                 referredUsers:
 *                   type: array
 *                   description: List of users referred by the specified user.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       onboarded:
 *                         type: boolean
 *       401:
 *         description: Unauthorized. User needs to be authenticated.
 *       500:
 *         description: Internal server error.
 */
router.get('/tree/:userId', isAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find the referrer of the specified user
    const userReferral = await Referral.findOne({ referred: userId }).populate('referrer', 'id username displayName');
    const referrer = userReferral ? userReferral.referrer : null;

    // Find all users referred by the specified user
    const referredUsers = await Referral.find({ referrer: userId })
      .sort({ _id: -1 }) // Sort by _id in descending order to get the latest documents
      .limit(100) // Limit to the last 100 documents
      .populate('referred', 'id username displayName onboarded');

    const referredCount = await Referral.find({ referrer: userId }).countDocuments();

    return res.status(200).json({
      referrer,
      referredCount,
      referredUsers: referredUsers.map(r => ({
        id: r.referred.id,
        username: r.referred.username,
        displayName: r.referred.displayName,
        onboarded: r.referred.onboarded
      }))
    });
  } catch (error) {
    next(new EError(500, error.message, error));
  }
});

/**
 * @swagger
 * /referral/check:
 *   get:
 *     tags:
 *       - referral
 *     summary: Check if a user with a specific Telegram ID is referred by the authenticated user.
 *     description: >
 *       This endpoint checks if a user with the provided Telegram ID is referred by the authenticated user.
 *     parameters:
 *       - in: query
 *         name: telegramId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Telegram ID of the user to check.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral relationship exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referrer:
 *                   type: string
 *                   description: Telegram ID of the referrer.
 *                 referred:
 *                   type: string
 *                   description: Telegram ID of the referred user.
 *                 check:
 *                   type: boolean
 *                   description: Whether the referral relationship exists.
 *                 exists:
 *                   type: boolean
 *                   description: Whether the referred user exists.
 *       400:
 *         description: Missing or invalid Telegram ID.
 *       404:
 *         description: User not found or referral relationship does not exist.
 *       500:
 *         description: Internal server error.
 */
router.get('/check', isAuth, async (req, res, next) => {
  try {
    const { telegramId } = req.query;
    const userId = req.auth.userId;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required.' });
    }

    const referredUser = await getUserByTelegramId(telegramId);

    if( !referredUser) { 
      return res.status(404).json({ 
        referrer: req.auth.telegramId.toString(),
        referred: telegramId,
        exists: false,
        error: `User with telegram id [${telegramId}]  not found.` });
    }

    const referral = await Referral.findOne({ referrer: userId, referred: referredUser._id.toString() });
    console.log(userId, referredUser._id.toString(), referral);
    if (referral) {
      return res.status(200).json({ 
        refferrer: req.auth.telegramId.toString(),
        referred: telegramId,
        check: true,
        exists: true });
    } else {
      return res.status(200).json({ 
        refferrer: req.auth.telegramId.toString(),
        referred: telegramId,
        check: false,
        exists: true
      });
    }
  } catch (error) {
    next(new EError(500, error.message, error));
  }
});

/**
 * @swagger
 * /referral/all:
 *   get:
 *     tags:
 *       - referral
 *     summary: Get a paginated list of all referrers with their total referred users and their own referrer.
 *     description: >
 *       This endpoint returns a paginated list of all referrers, including the total number of users they referred
 *       and the user who referred them, sorted by the total referred count in descending order.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: itemsPerPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all referrers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of referrers.
 *                     page:
 *                       type: integer
 *                       description: Current page number.
 *                     itemsPerPage:
 *                       type: integer
 *                       description: Number of items per page.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       referrer:
 *                         type: object
 *                         description: The referrer user.
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                       totalReferred:
 *                         type: integer
 *                         description: Total number of users referred by this referrer.
 *                       referredBy:
 *                         type: object
 *                         description: The user who referred this referrer.
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *       401:
 *         description: Unauthorized. User needs to be authenticated.
 *       500:
 *         description: Internal server error.
 */
router.get('/all', isAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage, 10) || 10;
    const skip = (page - 1) * itemsPerPage;

    const referrals = await Referral.find()
      .populate('referrer', 'id username displayName')
      .populate('referred', 'id username displayName');

    const referrers = referrals.reduce((acc, referral) => {
      const referrerId = referral.referrer?.id;
      if (referrerId) {
        if (!acc[referrerId]) {
          acc[referrerId] = {
            referrer: {
              id: referral.referrer.id,
              username: referral.referrer.username,
            },
            totalReferred: 0,
            referredBy: null,
          };
        }
        acc[referrerId].totalReferred += 1;
      }

      const referredId = referral.referred?.id;
      if (referredId) {
        acc[referredId] = acc[referredId] || {
          referrer: {
            id: referral.referred.id,
            username: referral.referred.username,
          },
          totalReferred: 0,
          referredBy: referral.referrer
            ? {
              id: referral.referrer.id,
              username: referral.referrer.username,
            }
            : null,
        };
      }

      return acc;
    }, {});

    const referrerArray = Object.values(referrers);
    referrerArray.sort((a, b) => b.totalReferred - a.totalReferred);
    const total = referrerArray.length;
    const paginatedReferrers = referrerArray.slice(skip, skip + itemsPerPage);

    return res.status(200).json({
      meta: {
        total,
        page,
        itemsPerPage,
      },
      data: paginatedReferrers,
    });
  } catch (error) {
    next(new EError(500, error.message, error));
  }
});

router.get('/all', isAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const referrals = await Referral.find()
      .populate('referrer', 'id username')
      .populate('referred', 'id username');

    const referrers = referrals.reduce((acc, referral) => {
      const referrerId = referral.referrer?.id;
      if (referrerId) {
        if (!acc[referrerId]) {
          acc[referrerId] = {
            referrer: {
              id: referral.referrer.id,
              username: referral.referrer.username,
            },
            totalReferred: 0,
            referredBy: null,
          };
        }
        acc[referrerId].totalReferred += 1;
      }

      const referredId = referral.referred?.id;
      if (referredId) {
        acc[referredId] = acc[referredId] || {
          referrer: {
            id: referral.referred.id,
            username: referral.referred.username,
          },
          totalReferred: 0,
          referredBy: referral.referrer
            ? {
              id: referral.referrer.id,
              username: referral.referrer.username,
            }
            : null,
        };
      }

      return acc;
    }, {});

    const referrerArray = Object.values(referrers);
    const total = referrerArray.length;
    const paginatedReferrers = referrerArray.slice(skip, skip + limit);

    return res.status(200).json({
      meta: {
        total,
        page,
        limit,
      },
      data: paginatedReferrers,
    });
  } catch (error) {
    next(new EError(500, error.message, error));
  }
});

module.exports = router;