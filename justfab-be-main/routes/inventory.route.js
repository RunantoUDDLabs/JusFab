const express = require('express');
const Inventory = require('../models/inventory.model');
const { addItemToInventory, removeItemFromInventory, getInventoryForUser } = require('../services/inventory.service');

const router = express.Router();

/**
 * @swagger
 * /inventory/{userId}:
 *   get:
 *     tags:
 *       - inventory
 *     summary: Get a user's inventory
 *     description: Retrieve all items in the specified user's inventory.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user whose inventory is being retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: A user's inventory
 *         content:
 *           application/json:
 *               schema:
 *               $ref: "#/components/schemas/Inventory"
 *       "404":
 *         description: Inventory not found
 */
router.get('/:userId', async (req, res) => {
  try {
    const inventory = await getInventoryForUser(req.params.userId);
    res.status(200).json(inventory);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

/**
 * @swagger
 * /inventory/{userId}/add:
 *   post:
 *     tags:
 *       - inventory
 *     summary: Add an item to a user's inventory
 *     description: Add a specified item to the user's inventory, or increase the quantity if the item already exists.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user whose inventory is being updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the item to remove.
 *                 example: "64a4c66f14b9a93e7a344b0a"
 *               quantity:
 *                 type: number
 *                 description: The quantity of the item to remove.
 *                 example: 3
 *     responses:
 *       "200":
 *         description: The updated inventory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Inventory"
 *       "400":
 *         description: Bad request (e.g., invalid item ID or quantity)
 */
router.post('/:userId/add', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const inventory = await addItemToInventory(req.params.userId, itemId, quantity);
    res.status(200).json(inventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /inventory/{userId}/remove:
 *   post:
 *     tags:
 *       - inventory
 *     summary: Remove an item from a user's inventory
 *     description: Decrease the quantity of a specified item in the user's inventory, or remove it entirely if the quantity reaches zero.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user whose inventory is being updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the item to remove.
 *                 example: "64a4c66f14b9a93e7a344b0a"
 *               quantity:
 *                 type: number
 *                 description: The quantity of the item to remove.
 *                 example: 3
 *     responses:
 *       "200":
 *         description: The updated inventory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Inventory"
 *       "400":
 *         description: Bad request (e.g., invalid item ID or quantity)
 */
router.post('/:userId/remove', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const inventory = await removeItemFromInventory(req.params.userId, itemId, quantity);
    res.status(200).json(inventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
