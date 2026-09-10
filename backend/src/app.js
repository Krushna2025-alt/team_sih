const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());

// CORS allowlist. Never origin:"*" for authenticated APIs. FRONTEND_URL must be set in production.
const allowedOrigins = env.isProduction
  ? [env.frontendUrl]
  : [env.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' })); // request-size limit

app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

// Request logging: method, path, status, duration. Authorization never logged.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({ method: req.method, path: req.originalUrl, status: res.statusCode, duration_ms: Date.now() - start });
  });
  next();
});

app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/v1', routes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.', errors: {} }));
app.use(errorHandler);

module.exports = app;

