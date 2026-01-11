import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/index.js';
import { logger } from './utils/logger.js';
import { initializeSocket } from './socket/index.js';

const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`, {
    env: env.NODE_ENV,
    url: `http://localhost:${env.PORT}`,
  });
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
