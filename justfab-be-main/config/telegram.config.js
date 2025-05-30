const { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_URL, TELEGRAM_API, TELEGRAM_FE_URL, TELEGRAM_FE_ADMIN_URL, TELEGRAM_APP_NAME, TELEGRAM_APP_PHOTO_URL, TELEGRAM_BOT_USERNAME } = process.env;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error('Telegram Bot Token is missing. Add it to your .env file.');
}

const telegramConfig = {
  botToken: TELEGRAM_BOT_TOKEN,
  webhookUrl: TELEGRAM_WEBHOOK_URL || '',
  telegramApi: `${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}`,
  feUrl: TELEGRAM_FE_URL,
  feAdminUrl: TELEGRAM_FE_ADMIN_URL,
  appName: TELEGRAM_APP_NAME,
  appPhotoURL: TELEGRAM_APP_PHOTO_URL,
  botUsername: TELEGRAM_BOT_USERNAME
};

module.exports = telegramConfig;