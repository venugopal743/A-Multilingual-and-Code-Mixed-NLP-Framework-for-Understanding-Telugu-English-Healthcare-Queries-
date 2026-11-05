const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

function formatTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message, meta) {
  const timestamp = formatTimestamp();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

const logger = {
  error(message, meta) {
    console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
  },

  warn(message, meta) {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
  },

  info(message, meta) {
    console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
  },

  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  },
};

module.exports = logger;
