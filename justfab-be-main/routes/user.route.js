const express = require('express');

const router = express.Router();

const { isAuth } = require('../middlewares/auth.middleware');
const { claimEnergy, getUsersWithSearch, countUsersWithSearch, getUserById } = require('../services/user.service');
const { botToken } = require('../config/telegram.config');
const { loginUser } = require('../services/auth.service');
const { validate, parse } = require('@telegram-apps/init-data-node');
const { loginOrSignUpByTelegramUser } = require('../services/telegram.service');
const jwt = require('jsonwebtoken');
const EError = require('../utils/EError');
const userEvents = require('../envents/user.event');

/**
 * @swagger
 * /user/info:
 *   get:
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     description: "Get logged-in user info"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal Server Error
 */
router.get('/info', isAuth, async (req, res) => {
  try {
    const user = await getUserById(req.auth.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
  return;
});


/**
 * @swagger
 * /user/all:
 *   get:
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     summary: Get a paginated list of users
 *     description: Retrieves a list of users with optional search and sorting parameters.
 *     parameters:
 *       - in: query
 *         name: phrase
 *         schema:
 *           type: string
 *         description: A search phrase to filter users.
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
 *           default: 100
 *         description: The number of items per page.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: telegram.nickname
 *         description: The field to sort by.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: The sort order (ascending or descending).
 *     responses:
 *       200:
 *         description: A paginated list of users
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
 *                       description: The total number of users.
 *                     page:
 *                       type: integer
 *                       description: The current page number.
 *                     itemsPerPage:
 *                       type: integer
 *                       description: The number of items per page.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/User"
 *       500:
 *         description: Internal Server Error
 */
router.get('/all', isAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 100;

    const { phrase, telegramId, sortBy = 'nickname', sortOrder = 'asc' } = req.query;

    const users = await getUsersWithSearch({
      phrase,
      page,
      itemsPerPage,
      sort: { [sortBy]: sortOrder == "asc" ? 1 : -1 },
    });
    const total = await countUsersWithSearch({
      phrase
    });

    res.json({
      meta: {
        total,
        page,
        itemsPerPage,
      },
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /user/claimEnergy:
 *   post:
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     summary: Claim energy for the user
 *     description: Adds 1 energy per minute since the last claim, up to a max of 50.
 *     responses:
 *       "200":
 *         description: Energy claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 energy:
 *                   type: number
 *                   description: The updated energy amount
 *                   example: 50
 *                 lastClaimed:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of the last claim
 *                   example: "2025-01-01T12:00:00.000Z"
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Server error
 */
router.post('/claimEnergy', isAuth, async (req, res, next) => {
  try {
    const userId = req.auth.userId; // Assume user is authenticated
    const result = await claimEnergy(userId);
    res.status(200).json(result);
    return;
  } catch (err) {
    next(err);
    return;
  }
});

/**
 * @swagger
 * /user/auth:
 *   post:
 *     tags: 
 *       - user
 *     summary: Authenticate Telegram Mini App users
 *     description: Validates Telegram WebApp authentication and logs in or registers the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - initData
 *             properties:
 *               initData:
 *                 type: string
 *                 example: "auth_date=1700000000&hash=abcdef1234567890&user={\"id\":1159250798,\"username\":\"minh_dangnhat\"}"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "jwt-token-xyz"
 *       403:
 *         description: Invalid authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid authentication"
 */
router.post("/auth", async (req, res, next) => {
  const initData = req.body.initData;
  console.log(initData);
  try {
    const data = parse(initData);
    validate(initData, botToken, { expiresIn: 0 });
    const user = await loginOrSignUpByTelegramUser(data.user);
    const { token } = await loginUser(user);
    res.json({ token });
  } catch (err) {
    console.log(err);
    next(new EError(403, err.message), err);
  }
  return;
});

/**
 * @swagger
 * /user/refreshToken:
 *   post:
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     summary: Refresh the user's authentication token
 *     description: Generates a new authentication token for the user.
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "new-jwt-token-xyz"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid authentication"
 */
router.post("/refreshToken", async (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';  // Make sure to store this securely in production
  const JWT_LIFETIME = process.env.JWT_LIFETIME || '24h';

  let oldToken = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    oldToken = req.headers.authorization.split(' ')[1];
  }

  if (!oldToken) {
    return next(EError(403, 'Not authorized, no token'));
  }

  let decoded = null;;
  try {
    decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });
    const user = await getUserById(decoded.userId);
    const { token } = await loginUser(user);
    res.json({ token });
  } catch (err) {
    next(new EError(403, 'Token refreshing failed'));
    return;
  }
});

module.exports = router;