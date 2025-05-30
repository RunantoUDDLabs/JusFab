const express = require('express');
const {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} = require('../services/skill.service'); // Adjust the path to your service
const { isAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: skill
 *   description: API for managing skills
 */

/**
 * @swagger
 * /skill:
 *   post:
 *     summary: Create a new skill
 *     tags: [skill]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skill'
 *     responses:
 *       201:
 *         description: Skill successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Validation error
 */
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const skill = await createSkill(req.body);
    res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /skill:
 *   get:
 *     summary: Retrieve all skills
 *     tags: [skill]
 *     responses:
 *       200:
 *         description: List of all skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res, next) => {
  try {
    const skills = await getAllSkills();
    res.status(200).json(skills);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /skill/{id}:
 *   get:
 *     summary: Retrieve a skill by ID
 *     tags: [skill]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the skill to retrieve
 *     responses:
 *       200:
 *         description: Skill details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skill not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const skill = await getSkillById(req.params.id);
    res.status(200).json(skill);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /skill/{id}:
 *   put:
 *     summary: Update a skill by ID
 *     tags: [skill]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the skill to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skill'
 *     responses:
 *       200:
 *         description: Skill successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Skill not found
 */
router.put('/:id', isAdmin, async (req, res, next) => {
  try {
    const skill = await updateSkill(req.params.id, req.body);
    res.status(200).json(skill);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /skill/{id}:
 *   delete:
 *     summary: Delete a skill by ID
 *     tags: [skill]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the skill to delete
 *     responses:
 *       200:
 *         description: Skill successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skill not found
 */
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const skill = await deleteSkill(req.params.id);
    res.status(200).json({ message: 'Skill deleted successfully', skill });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
