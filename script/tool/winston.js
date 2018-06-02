var combinedTransport, errorTransport, logger, util, winston;

winston = require('winston');

util = require('./util');

require('winston-daily-rotate-file');

combinedTransport = new winston.transports.DailyRotateFile({
  filename: 'z_%DATE%-combined.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

errorTransport = new winston.transports.DailyRotateFile({
  filename: 'z_%DATE%-error.log',
  level: 'error',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

logger = winston.createLogger({
  level: 'silly',
  format: winston.format.json(),
  transports: [combinedTransport, errorTransport]
});

exports.errorLog = function(message, error) {
  return logger.log({
    time: util.timeStamp(),
    level: 'error',
    message: message,
    errorStack: error.stack
  });
};

exports.queryLog = function(query) {
  return logger.log({
    time: util.timeStamp(),
    level: 'debug',
    message: query
  });
};
