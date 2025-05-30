const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const fs = require('fs');
const path = require('path');

const logDirectory = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
  level: 'info', // Default log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Log output in JSON format
  ),
  transports: [
    new winston.transports.Console(), // Log to the console

    new DailyRotateFile({
      filename: 'logs/just-fab-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      level: 'error'
    }),
    new DailyRotateFile({
      filename: 'logs/just-fab-combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
    }),
  ],
});

module.exports = logger;
