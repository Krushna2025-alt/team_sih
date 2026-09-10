const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { startExpiryScheduler } = require('./services/expiryService');

const server = app.listen(env.port, () => {
  logger.info('KrishiLink backend running on http://localhost:' + env.port + ' (API base: /api/v1)');
  startExpiryScheduler();
});

process.on('unhandledRejection', (err) => {
  logger.error({ msg: err?.message }, 'Unhandled rejection');
});
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

