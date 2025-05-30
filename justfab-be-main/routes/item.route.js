const express = require('express');
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require('../services/item.service'); // Adjust the path to your service // Adjust the path to your service
const { isAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: item
 *   description: API for managing items
 */

/**
 * @swagger
 * /item:
 *   post:
 *     summary: Create a new item
 *     tags: [item]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 */
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const item = await createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /item:
 *   get:
 *     summary: Retrieve all items
 *     tags: [item]
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res, next) => {
  try {
    const items = await getAllItems();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /item/{id}:
 *   get:
 *     summary: Retrieve an item by ID
 *     tags: [item]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the item to retrieve
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id);
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /item/{id}:
 *   put:
 *     summary: Update an item by ID
 *     tags: [item]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Item not found
 */
router.put('/:id', isAdmin, async (req, res, next) => {
  try {
    const item = await updateItem(req.params.id, req.body);
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /item/{id}:
 *   delete:
 *     summary: Delete an item by ID
 *     tags: [item]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the item to delete
 *     responses:
 *       200:
 *         description: Item successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 */
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const item = await deleteItem(req.params.id);
    res.status(200).json({ message: 'Item deleted successfully', item });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
