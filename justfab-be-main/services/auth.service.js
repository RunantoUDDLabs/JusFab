const { getUserByUsername, getUserByTelegramId } = require('../services/user.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';  // Make sure to store this securely in production
const JWT_LIFETIME = process.env.JWT_LIFETIME || '24h';

exports.loginUserByTelegram = async (username) => {

  const user = await getUserByUsername(username);

  const token = jwt.sign(
    { userId: user._id, username: user.username || "", telegramId: user.telegram.id, method: 'telegram', role: 'user' },  // Payload
    JWT_SECRET,  // Secret key
    { expiresIn: JWT_LIFETIME }  // Token expiry
  );

  logger.info(`${username} log in as ${user.role}`);

  // Return the token and necessary user information
  return {
    token,
    user: user
  };
};

exports.loginUserByTelegramId = async (id) => {

  const user = await getUserByTelegramId(id);

  const token = jwt.sign(
    { userId: user._id, username: user.username || "", telegramId: user.telegram.id, method: 'telegram', role: 'user' },  // Payload
    JWT_SECRET,  // Secret key
    { expiresIn: JWT_LIFETIME }  // Token expiry
  );

  logger.info(`${user.username || user.telegram.id} log in as ${user.role}`);

  // Return the token and necessary user information
  return {
    token,
    user: user
  };
};

exports.loginUser = async (user, role) => {
  role = role || "user";
  const token = jwt.sign(
    { userId: user._id, username: user.username || "", telegramId: user.telegram.id, method: 'telegram', role },  // Payload
    JWT_SECRET,  // Secret key
    { expiresIn: JWT_LIFETIME }  // Token expiry
  );

  logger.info(`${user.username || user.telegram.id} log in as ${user.role}`);

  // Return the token and necessary user information
  return {
    token,
    user: user
  };
};

exports.loginUserByTelegramUsername = async (username) => {

  const user = await getUserByUsername(username);

  const token = jwt.sign(
    { userId: user._id, username: user.username || "", telegramId: user.telegram.id, method: 'telegram', role: 'user' },  // Payload
    JWT_SECRET,  // Secret key
    { expiresIn: JWT_LIFETIME }  // Token expiry
  );

  logger.info(`${user.username || user.telegram.id} log in as ${user.role}`);

  // Return the token and necessary user information
  return {
    token,
    user: user
  };
};