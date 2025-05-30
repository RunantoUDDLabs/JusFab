const Task = require("../models/task.model");
const User = require("../models/user.model");
const UserTask = require("../models/userTask.model");
const { getUserByTelegramId } = require("../services/user.service");
const { addReward } = require("../services/userRewards.service");
const logger = require("../utils/logger");
const userEvents = require("./user.event");

userEvents.on("joinTelegramGroup", async (id, telegramGroupIdentifier) => {
  console.log(id, telegramGroupIdentifier);

  const tasks = await Task.find({ type: 'TELEGRAM', target: telegramGroupIdentifier });

  if (tasks.length > 0) {
    const user = await getUserByTelegramId(id);
    if (user) {

      console.log(user, tasks);

      for (const task of tasks) {
        let userTask = await UserTask.findOne({ user: user._id, task: task._id });
        if (!userTask) {
          userTask = new UserTask({ user: user._id, task: task._id });
        }
        if (userTask.status !== 'COMPLETED') {
          userTask.status = 'COMPLETED';
          userTask.completedAt = new Date();
          await userTask.save();
          await addReward(user._id, task.reward, "TASK");
          logger.info(`Task "${task.title}" marked as completed for user ${user.username || user.telegram.id} in chat ${telegramGroupIdentifier}. Get ${task.reward}`);
        }
      }
    } else {
      console.warn(`No user found in our database with telegram.id: ${id}`);
    }
  }

  return;
})