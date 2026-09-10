const pino = require('pino');
const env = require('./env');

// Never log OTPs, passwords, tokens, service keys, payment credentials.
module.exports = pino({
  level: env.isProduction ? 'info' : 'debug',
  transport: env.isProduction ? undefined : { target: 'pino-pretty', options: { colorize: true } },
  redact: ['req.headers.authorization', '*.password', '*.token', '*.access_token', '*.otp'],
});

