const express = require('express');
const router = express.Router();
const groupService = require('../services/taskGroup.service');
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: taskGroup
 *     description: API endpoints for managing task groups and associating tasks.
 */

/**
 * @swagger
 * /taskGroup/:
 *   post:
 *     tags: [taskGroup]
 *     summary: Create a new task group.
 *     description: Create a new task group with a name and icon.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Social Tasks"
 *               icon:
 *                 type: string
 *                 example: "https://example.com/group-icon.png"
 *     responses:
 *       201:
 *         description: Task group created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskGroup'
 *       500:
 *         description: Internal server error.
 */
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const groupData = req.body;
    const group = await groupService.createGroup(groupData);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /taskGroup/:
 *   get:
 *     tags: [taskGroup]
 *     summary: Get all task groups.
 *     description: Retrieve a list of all task groups.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of task groups.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskGroup'
 *       500:
 *         description: Internal server error.
 */
router.get('/', isAuth, async (req, res, next) => {
  try {
    const groups = await groupService.getGroups();
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /taskGroup/{groupId}:
 *   get:
 *     tags: [taskGroup]
 *     summary: Get a task group by ID.
 *     description: Retrieve a single task group by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task group ID.
 *     responses:
 *       200:
 *         description: Task group retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskGroup'
 *       404:
 *         description: Task group not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:groupId', isAuth, async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await groupService.getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Task group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /taskGroup/{groupId}:
 *   put:
 *     tags: [taskGroup]
 *     summary: Update a task group.
 *     description: Update an existing task group by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task group ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Group Name"
 *               icon:
 *                 type: string
 *                 example: "https://example.com/new-group-icon.png"
 *     responses:
 *       200:
 *         description: Task group updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskGroup'
 *       404:
 *         description: Task group not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:groupId', isAdmin, async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const data = req.body;
    const group = await groupService.updateGroup(groupId, data);
    if (!group) {
      return res.status(404).json({ error: 'Task group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /taskGroup/{groupId}:
 *   delete:
 *     tags: [taskGroup]
 *     summary: Delete a task group.
 *     description: Delete a task group by its ID. Tasks in the group will have their group field unset.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task group ID.
 *     responses:
 *       200:
 *         description: Task group deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task group deleted successfully."
 *       404:
 *         description: Task group not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:groupId', isAdmin, async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await groupService.deleteGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Task group not found' });
    }
    res.status(200).json({ message: 'Task group deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /taskGroup/{groupId}/tasks/{taskId}:
 *   post:
 *     tags: [taskGroup]
 *     summary: Add a task to a group.
 *     description: Associate a task with a task group.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task group ID.
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID.
 *     responses:
 *       200:
 *         description: Task added to group successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task or group not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/:groupId/tasks/:taskId', isAdmin, async (req, res, next) => {
  try {
    const { groupId, taskId } = req.params;
    const task = await groupService.addTaskToGroup(groupId, taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task or group not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /taskGroup/tasks/{taskId}:
 *   delete:
 *     tags: [taskGroup]
 *     summary: Remove a task from its group.
 *     description: Remove the group association from a task.
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
 *         description: Task removed from group successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/tasks/:taskId', isAdmin, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await groupService.removeTaskFromGroup(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
