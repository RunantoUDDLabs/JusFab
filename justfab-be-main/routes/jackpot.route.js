const express = require('express');
const { getJackpot, spinJackpot, addToJackpotPool, updateJackpot } = require('../services/jackpot.service');
const EError = require('../utils/EError');
const { isAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * /jackpot:
 *   get:
 *     tags:
 *       - jackpot
 *     summary: Get the current jackpot
 *     description: Retrieve the jackpot configuration. If no jackpot exists, a default jackpot is created.
 *     responses:
 *       "200":
 *         description: The current jackpot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Jackpot"
 *       "500":
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const jackpot = await getJackpot();
    res.status(200).json(jackpot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * @swagger
 * /jackpot/rewards:
 *   get:
 *     tags:
 *       - jackpot
 *     summary: Get the jackpot pool and reward descriptions
 *     description: Retrieves the current jackpot pool and descriptions of all rewards in the jackpot.
 *     responses:
 *       "200":
 *         description: Jackpot pool and reward descriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pool:
 *                   type: number
 *                   description: The current jackpot pool amount
 *                   example: 10000
 *                 rewards:
 *                   type: array
 *                   description: List of reward descriptions
 *                   items:
 *                     type: string
 *                     description: Reward description
 *                     example: "A rare item reward."
 *       "500":
 *         description: Server error
 */
router.get('/rewards', async (req, res) => {
  try {
    const jackpot = await getJackpot();
    const descriptions = jackpot.rewards.map((reward) => reward.description);

    res.status(200).json({
      pool: jackpot.pool,
      rewards: descriptions,
    });
  } catch (err) {
    next(new EError(500, err.message));
  }
});

/**
 * @swagger
 * /jackpot:
 *   post:
 *     tags:
 *       - jackpot
 *     summary: Update the jackpot configuration
 *     description: Updates the jackpot's name, pool, and rewards.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the jackpot
 *                 example: "Updated Jackpot"
 *               pool:
 *                 type: number
 *                 description: The updated jackpot pool amount
 *                 example: 15000
 *               rewards:
 *                 type: array
 *                 description: The updated list of rewards
 *                 items:
 *                   $ref: "#/components/schemas/JackPotReward"
 *     responses:
 *       "200":
 *         description: The updated jackpot configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Jackpot"
 *       "400":
 *         description: Validation error
 *       "500":
 *         description: Server error
 */
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, pool, rewards } = req.body;
    const updatedJackpot = await updateJackpot({ name, pool, rewards });
    res.status(200).json(updatedJackpot);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
