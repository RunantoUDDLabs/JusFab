// services/taskService.js
const Task = require('../models/task.model');

/**
 * Create a new task.
 * @param {Object} taskData - The data for the new task.
 * @returns {Promise<Object>} The created task.
 */
async function createTask(taskData) {
  const task = new Task(taskData);
  return task.save();
}

/**
 * Retrieve all tasks.
 * @returns {Promise<Array>} List of tasks.
 */
async function getTasks() {
  return Task.find();
}

/**
 * Retrieve a single task by its ID.
 * @param {string} taskId - The task ID.
 * @returns {Promise<Object|null>} The task or null if not found.
 */
async function getTaskById(taskId) {
  return Task.findById(taskId);
}

/**
 * Update a task.
 * @param {string} taskId - The task ID.
 * @param {Object} taskData - The task data to update.
 * @returns {Promise<Object|null>} The updated task.
 */
async function updateTask(taskId, taskData) {
  return Task.findByIdAndUpdate(taskId, taskData, { new: true });
}

/**
 * Delete a task.
 * @param {string} taskId - The task ID.
 * @returns {Promise<Object|null>} The deleted task.
 */
async function deleteTask(taskId) {
  return Task.findByIdAndDelete(taskId);
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
