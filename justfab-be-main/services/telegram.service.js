const axios = require('axios')
const { botToken, webhookUrl, telegramApi, feUrl, gameName, appPhotoURL } = require('../config/telegram.config');
const { createUser, getUserByTelegramId } = require("../services/user.service");
const { loginUserByTelegram, loginUserByTelegramId } = require("../services/auth.service");
const logger = require('../utils/logger');

async function setupWebhook() {
  try {
    // Set webhook
    await axios.post(`${telegramApi}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ["message", "callback_query", "chat_member"],
      max_connections: 100,
      drop_pending_updates: true
    });
    console.log(`Webhook set to ${webhookUrl}`);
    return;
  } catch (error) {
    logger.error(error);
    console.error('Error setting webhook:', error.message);
  }
}

async function getUser(userId) {
  try {
    const res = await axios.get(`${telegramApi}/getChat`, {
      params: { chat_id: userId }
    });

    return res.data.result;
  } catch (e) {
    logger.error(e);
    throw (e);
  }
}

async function sendGameLink(message) {
  let chatId = message.chat.id;

  //const { token } = await loginUserByTelegram(message.chat.username);
  //const url = `${feUrl}${token}`;
  const url = `${feUrl}`;
  try {
    await axios.post(`${telegramApi}/sendPhoto`, {
      chat_id: chatId,
      photo: appPhotoURL,
      caption: "Yo, welcome to the world of Fabs! We\'re about to go on some crazy ride, where we\'ll probably try to save this whole damn thing. Or not, we\'ll see what happens.",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Play Now!",
              web_app: { url: url }
            }
          ]
        ]
      } 
    });
    return;
  } catch (e) {
    logger.error(e);
    throw (e);
  }
}

async function loginOrSignUp(message) {
  let user = await getUserByTelegramId(message.from.id);
  try {
    if (!user) {
      user = await createUser({
        username: message.from.username,
        displayName: `${message.chat.first_name || ''} ${message.from.last_name || ''}`,
        telegram: {
          id: message.from.id,
          username: message.from.username,
          firstName: message.from.first_name,
          lastName: message.from.last_name
        }
      })
    } else {
      const newTelegramData = {
        id: message.from.id,
        username: message.from.username,
        firstName: message.from.first_name || '',
        lastName: message.from.last_name || ''
      };

      const newUsername = message.from.username;
      const newDisplayName = `${message.chat.first_name || ''} ${message.from.last_name || ''}`;

      const isTelegramChanged = JSON.stringify(user.telegram) !== JSON.stringify(newTelegramData);
      const isUsernameChanged = user.username !== newUsername;
      const isDisplayNameChanged = user.displayName !== newDisplayName;

      if (isTelegramChanged || isUsernameChanged || isDisplayNameChanged) {
        user.telegram = newTelegramData;
        user.username = newUsername;
        user.displayName = newDisplayName;
        await user.save();
      }
    }

    return user;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

async function loginOrSignUpByTelegramUser(telegramUser) {
  try {
    let user = await getUserByTelegramId(telegramUser.id);
    if (!user) {
      user = await createUser({
        username: telegramUser.username,
        displayName: `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`,
        telegram: {
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.first_name || '',
          lastName: telegramUser.last_name || '',
        }
      })
    } else {
      user.telegram = {
        id: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name
      };
      user.username = telegramUser.username;
      user.displayName = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`;

      await user.save();
    }

    return user;
  } catch(e) {
    logger.error(e);
    throw e;
  }
}

async function launchGame(callbackQueryId, telegramId, chatId) {

  try {
    const { token } = await loginUserByTelegramId(telegramId);

    const url = `${feUrl}${token}`;
    console.log("lauch url", url);

    await axios.post(`${telegramApi}/answerCallbackQuery`, {
      callback_query_id: callbackQueryId,
      url: url
    });
    return;
  } catch (e) { console.error(e) }
}

async function sendMessage(chatId, text) {
  try {

    await axios.post(`${telegramApi}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
    return;
  } catch (e) {
    logger.error(e);
    throw(e);
  }
}


module.exports = { sendGameLink, launchGame, getUser, setupWebhook, loginOrSignUp, loginOrSignUpByTelegramUser, sendMessage };