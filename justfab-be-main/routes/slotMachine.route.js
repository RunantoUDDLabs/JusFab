const express = require('express');
const {
  getSlotMachine,
  initializeSlotMachine,
  playSlotMachine,
} = require('../services/slotMachine.service');
const EError = require('../utils/EError');
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');
const { claimEnergy } = require('../services/userSlotRecord.service');

const router = express.Router();

/**
 * @swagger
 * /slotMachine:
 *   get:
 *     tags:
 *       - slot Machine
 *     summary: Get the current slot machine configuration
 *     description: Retrieve the configuration of the single slot machine in the system. If none exists, a default slot machine will be created.
 *     responses:
 *       "200":
 *         description: Slot machine configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SlotMachine"
 *       "500":
 *         description: Server error
 */
router.get('/', async (req, res, next) => {
  try {
    const slotMachine = await getSlotMachine();
    res.status(200).json(slotMachine);
  } catch (err) {
    next(new EError(500, err.message));
  }
});

/**
 * @swagger
 * /slotMachine:
 *   post:
 *     tags:
 *       - slot Machine
 *     summary: Initialize or update the slot machine configuration
 *     description: Creates a new slot machine or updates the existing configuration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SlotMachine"
 *     responses:
 *       "200":
 *         description: Updated slot machine configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SlotMachine"
 *       "500":
 *         description: Server error
 */
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const slotMachine = await initializeSlotMachine(req.body);
    res.status(200).json(slotMachine);
  } catch (err) {
    next(new EError(500, err.message));
  }
});

/**
 * @swagger
 * /slotMachine/play:
 *   post:
 *     tags:
 *       - slot Machine
 *     summary: Play the slot machine
 *     security:
 *       - bearerAuth: []
 *     description: Spins the slot machine reels and returns the resulting combination and any rewards.
 *     requestBody:
 *       description: Input payload for playing the slot machine.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               betX:
 *                 type: number
 *                 default: 1
 *                 description: Bet multiplier value. Defaults to 1 if omitted.
 *     responses:
 *       "200":
 *         description: Slot machine spin result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reelSymbols:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The resulting symbols from the spin
 *                   example: ["X", "F", "F", "J"]
 *                 rewards:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Reward"
 *       "500":
 *         description: Server error
 */
router.post('/play', isAuth, async (req, res, next) => {
  try {
    const betX = parseInt(req.body.betX, 10) || 1;
    console.log(req.auth);
    const result = await playSlotMachine(req.auth.userId, betX);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
