const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../utils/appError');

// ONE centralized handler. One request error must never crash the server.
module.exports = function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    logger.warn({ path: req.originalUrl, msg: err.message }, 'AppError');
    return res.status(err.status).json({ success: false, message: err.message, errors: err.errors || {} });
  }
  if (err.name === 'ZodError') {
    return res.status(422).json({ success: false, message: 'Validation failed.', errors: { issues: err.issues.map((i) => i.message) } });
  }
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body.', errors: {} });
  }
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate record.', errors: {} });
  }
  if (err.code === '23503') {
    return res.status(422).json({ success: false, message: 'Related record not found.', errors: {} });
  }

  logger.error({ path: req.originalUrl, msg: err.message, stack: env.isProduction ? undefined : err.stack }, 'Unhandled error');
  const message = env.isProduction ? 'Something went wrong. Please try again.' : err.message;
  return res.status(500).json({ success: false, message, errors: {} }); // never expose stack traces in production
};

