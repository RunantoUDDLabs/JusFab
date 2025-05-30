const express = require('express');
const router = express.Router();
const { botToken, feAdminUrl, gameName, feUrl } = require('../config/telegram.config');
const { sendGameLink, launchGame, getUser, loginOrSignUp, sendMessage } = require("../services/telegram.service");
const { loginUser } = require('../services/auth.service');
const EError = require('../utils/EError')
const logger = require('../utils/logger');
const { createReferral } = require('../services/referral.service');
const { pathType } = require('../models/item.schema');
const userEvents = require('../envents/user.event');
const { getUserByTelegramId } = require('../services/user.service');
const webhookQueue = require('../utils/WebhookQueue');

router.post(`/webhook/`, (req, res) => {
  res.sendStatus(200);

  webhookQueue.push(async () => {
    const requestId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.time(`webhook-total-${requestId}`);
    try {
      const message = req.body.message;

      if (message && message.text) {
        const user = await loginOrSignUp(message);
        if (message.text.startsWith('/start ')) {
          const parts = message.text.split(' ');
          const parameter = parts.length > 1 ? parts[1] : null;
          if (parameter) {
            try {
              // await createReferral(parseInt(parameter, 10), user._id);
              // const referrerUser = await getUserByTelegramId(parseInt(parameter, 10));
              const [_, referrerUser] = await Promise.all([
                createReferral(parseInt(parameter, 10), user._id),
                getUserByTelegramId(parseInt(parameter, 10))
              ]);
              await Promise.all([
                sendMessage(
                  message.chat.id,
                  `🎉 Welcome to the game! You've joined through the referral of @${referrerUser.telegram.username || referrerUser.telegram.id}. Get ready to start your adventure and enjoy playing! 🏆`
                ),
                (async () => {
                  user.energy += 100;
                  await user.save();
                })()
              ]);
            } catch (e) {
              await sendMessage(message.chat.id, `❌ Referral failed! It looks like you've already been referred by another user. You can only join the game through one referral.`);
              throw e;
            }
          } 
          await sendGameLink(message);
        } else if (message.text === '/start') {
          // const user = await loginOrSignUp(message);
          await sendGameLink(message);
        } else if (message.text === '/start_dev') {
          
          const { token } = await loginUser(user);
          await sendMessage(message.chat.id, token);
        } else if (message.text === '/start_admin') {
          
          if (['MOD', 'ADMIN', 'ROOT'].includes(user.role)) {
            const { token } = await loginUser(user, user.role)
            logger.info(`${user.telegram.username || user.telegram.id} get link for admin`);
            const url = `${feAdminUrl}${token}`;
            await sendMessage(message.chat.id, url);
          }
        } else if (message.text === '/start_web') {
          const { token } = await loginUser(user);
          await sendMessage(message.chat.id, `${feUrl}${token}`);
        }
      }

      if (req.body.callback_query) {
        const callbackQuery = req.body.callback_query;
        const chatId = callbackQuery.chat_instance;

        if (callbackQuery.game_short_name === gameName) {
          await launchGame(callbackQuery.id, callbackQuery.from.id, chatId);
        }
      }

      const chatMember = req.body.chat_member;
      if (chatMember && chatMember.new_chat_member) {
        const { chat, new_chat_member } = chatMember;
        const telegramGroupIdentifier = chat.username ? chat.username : String(chat.id);
        await userEvents.asyncEmit("joinTelegramGroup", new_chat_member.user.id, telegramGroupIdentifier);
        logger.info(`${new_chat_member.user.username || new_chat_member.user.id} join group ${telegramGroupIdentifier}`);
      }
    console.timeEnd(`webhook-total-${requestId}`);
    } catch (e) {
      logger.error(e);
    }
  });
});

module.exports = router;