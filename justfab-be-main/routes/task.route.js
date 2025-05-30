const express = require('express');
const router = express.Router();
const taskService = require('../services/task.service');
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');
const EError = require('../utils/EError');
const { addReward, getUnclaimedRewardsByReason } = require('../services/userRewards.service');
const Task = require('../models/task.model');
const UserTask = require('../models/userTask.model');

/**
 * @swagger
 * /task/userTasks:
 *   get:
 *     tags:
 *       - task
 *     summary: Retrieve user tasks and unclaimed rewards for the authenticated user.
 *     description: >
 *       Retrieves all tasks associated with the authenticated user, as well as any unclaimed rewards
 *       filtered by the reason "TASK". The response returns an object with two properties: "tasks" and "rewards".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An object containing a list of user tasks and a list of unclaimed rewards.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   description: List of user tasks.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "603d9b8f2a3d2b4e8a2d92b6"
 *                       user:
 *                         type: string
 *                         example: "603d9b8f2a3d2b4e8a2d92b6"
 *                       task:
 *                         type: object
 *                         description: The associated task details.
 *                       status:
 *                         type: string
 *                         enum: [PENDING, COMPLETED]
 *                         example: "PENDING"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-20T15:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-20T15:30:00Z"
 *                 rewards:
 *                   type: array
 *                   description: List of unclaimed rewards filtered by reason "TASK".
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "609d1f2c8f8a2b001c8d4567"
 *                       reward:
 *                         type: object
 *                         description: Reward details.
 *                       claimed:
 *                         type: boolean
 *                         example: false
 *                       reason:
 *                         type: string
 *                         example: "TASK"
 *                       count:
 *                         type: number
 *                         example: 3
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-20T15:30:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-20T15:30:00Z"
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/userTasks', isAuth, async (req, res, next) => {
  try {
    // Get the authenticated user's ID from req.auth
    const userId = req.auth.userId;

    // Find all UserTasks for the authenticated user and populate the task data
    const userTasks = await UserTask.find({ user: userId });
    const rewards = await getUnclaimedRewardsByReason(userId, "TASK");

    res.status(200).json({ task: userTasks, rewards });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /task:
 *   post:
 *     tags:
 *       - task
 *     summary: Create a new task.
 *     description: Create a new task with title, description, type, target, and reward.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Join Telegram Group"
 *               description:
 *                 type: string
 *                 example: "Join our Telegram group for updates."
 *               type:
 *                 type: string
 *                 enum: [LINK, TELEGRAM]
 *                 example: TELEGRAM
 *               target:
 *                 type: string
 *                 example: "https://t.me/yourgroup"
 *               reward:
 *                 $ref: '#/components/schemas/Reward'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       500:
 *         description: Internal server error.
 */
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const taskData = req.body;
    const task = await taskService.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /task:
 *   get:
 *     tags:
 *       - task
 *     summary: Get all tasks.
 *     description: Retrieve a list of all tasks.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Internal server error.
 */
router.get('/', isAuth, async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /task/{taskId}:
 *   get:
 *     tags:
 *       - task
 *     summary: Get a task by ID.
 *     description: Retrieve a single task by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID.
 *     responses:
 *       200:
 *         description: Task retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:taskId', isAuth, async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /task/{taskId}:
 *   put:
 *     tags:
 *       - task
 *     summary: Update a task.
 *     description: Update an existing task by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Task Title"
 *               description:
 *                 type: string
 *                 example: "Updated description."
 *               type:
 *                 type: string
 *                 enum: [LINK, TELEGRAM]
 *                 example: LINK
 *               target:
 *                 type: string
 *                 example: "https://example.com"
 *               reward:
 *                 $ref: '#/components/schemas/Reward'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:taskId', isAdmin, async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const taskData = req.body;
    const task = await taskService.updateTask(taskId, taskData);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /task/{taskId}:
 *   delete:
 *     tags:
 *       - task
 *     summary: Delete a task.
 *     description: Delete a task by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID.
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully."
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:taskId', isAdmin, async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const task = await taskService.deleteTask(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /task/{taskId}/complete:
 *   post:
 *     tags:
 *       - task
 *     summary: Mark a task as completed.
 *     description: Mark a specific task as completed by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task.
 *     responses:
 *       200:
 *         description: Task marked as completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task completed successfully."
 *       400:
 *         description: Task already completed or invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/:taskId/complete', isAuth, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.auth.userId;

    // Ensure the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      next(new EError(404, 'Task not found.'));
      return;
    }

    if (task.type != "LINK") {
      next(new EError(403, 'Can not be completed by this way.'));
      return;
    }

    // Check if the user has already completed the task
    let userTask = await UserTask.findOne({ user: userId, task: taskId });
    if (userTask && userTask.status === 'COMPLETED') {
      next(new EError(405, 'Task is already completed.'));
      return;
    }

    // Create or update the user task record
    if (!userTask) {
      userTask = new UserTask({ user: userId, task: taskId });
    }
    userTask.status = 'COMPLETED';
    userTask.completedAt = new Date();
    await userTask.save();
    await addReward(userId, task.reward, "TASK");
    res.status(200).json({ message: 'Task completed successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;