const TaskGroup = require('../models/taskGroup.model');
const Task = require('../models/task.model');

/**
 * Create a new task group.
 * @param {Object} groupData - The data for the new task group.
 * @returns {Promise<Object>} The created task group.
 */
async function createGroup(groupData) {
  const group = new TaskGroup(groupData);
  return group.save();
}

/**
 * Retrieve all task groups.
 * @returns {Promise<Array>} List of task groups.
 */
async function getGroups() {
  return TaskGroup.find();
}

/**
 * Retrieve a single task group by its ID.
 * @param {string} groupId - The task group ID.
 * @returns {Promise<Object|null>} The task group or null if not found.
 */
async function getGroupById(groupId) {
  return TaskGroup.findById(groupId);
}

/**
 * Update a task group.
 * @param {string} groupId - The task group ID.
 * @param {Object} groupData - The group data to update.
 * @returns {Promise<Object|null>} The updated task group.
 */
async function updateGroup(groupId, groupData) {
  return TaskGroup.findByIdAndUpdate(groupId, groupData, { new: true });
}

/**
 * Delete a task group.
 * Tasks associated with the group will have their group field unset.
 * @param {string} groupId - The task group ID.
 * @returns {Promise<Object|null>} The deleted task group.
 */
async function deleteGroup(groupId) {
  const group = await TaskGroup.findByIdAndDelete(groupId);
  await Task.updateMany({ group: groupId }, { $unset: { group: "" } });
  return group;
}

/**
 * Add a task to a group.
 * Updates the task's group reference.
 * @param {string} groupId - The task group ID.
 * @param {string} taskId - The task ID.
 * @returns {Promise<Object|null>} The updated task.
 */
async function addTaskToGroup(groupId, taskId) {
  return Task.findByIdAndUpdate(taskId, { group: groupId }, { new: true });
}

/**
 * Remove a task from its group.
 * Unsets the group field of the task.
 * @param {string} taskId - The task ID.
 * @returns {Promise<Object|null>} The updated task.
 */
async function removeTaskFromGroup(taskId) {
  return Task.findByIdAndUpdate(taskId, { $unset: { group: "" } }, { new: true });
}

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addTaskToGroup,
  removeTaskFromGroup
};
