const express = require('express');
const router = express.Router();
const { setEquipments, getUserKapy } = require('../services/userKapy.service');
const { isAuth } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /kapy/setEquipments:
 *   post:
 *     summary: Set equipment for a user's Kapy
 *     description: Allows a user to set equipment for their Kapy based on their inventory.
 *     tags:
 *       - kapy
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipmentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of equipment IDs to set for the user's Kapy.
 *             required:
 *               - equipmentIds
 *     responses:
 *       200:
 *         description: Successfully updated the user's Kapy with the new equipment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 user:
 *                   type: string
 *                 equipments:
 *                   type: array
 *                   items:
 *                     type: string
 *                 baseStats:
 *                   type: object
 *                   properties:
 *                     hp:
 *                       type: number
 *                     attack:
 *                       type: number
 *                     defense:
 *                       type: number
 *                     luck:
 *                       type: number
 *                 level:
 *                   type: number
 *       400:
 *         description: Bad request. Includes validation errors or missing fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized. User is not authenticated.
 */ 
router.post('/setEquipments', isAuth, async (req, res) => {
    try {
        const userId = req.auth.userId; // Assuming `authMiddleware` attaches the user object to `req`
        let { equipmentIds } = req.body;

        if (!Array.isArray(equipmentIds) || equipmentIds.length === 0) {
            equipmentIds = [];
        }

        const updatedKapy = await setEquipments(userId, equipmentIds);
        res.status(200).json(updatedKapy);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /kapy/:
 *   get:
 *     summary: Get a user's Kapy
 *     description: Retrieves the Kapy associated with the authenticated user.
 *     tags:
 *       - kapy
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's Kapy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 user:
 *                   type: string
 *                 equipments:
 *                   type: array
 *                   items:
 *                     type: string
 *                 baseStats:
 *                   type: object
 *                   properties:
 *                     hp:
 *                       type: number
 *                     attack:
 *                       type: number
 *                     defense:
 *                       type: number
 *                     luck:
 *                       type: number
 *                 level:
 *                   type: number
 *       401:
 *         description: Unauthorized. User is not authenticated.
 *       404:
 *         description: Kapy not found for the user.
 */
router.get('/', isAuth, async (req, res) => {
    try {
        const userId = req.auth.userId; // Assuming `authMiddleware` attaches the user object to `req`
        const userKapy = await getUserKapy(userId);

        if (!userKapy) {
            return res.status(404).json({ error: 'Kapy not found for the user' });
        }

        res.status(200).json(userKapy);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
