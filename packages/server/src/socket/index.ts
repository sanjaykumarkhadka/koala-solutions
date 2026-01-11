import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { socketAuth } from './middleware/socketAuth.js';
import { registerMessagingHandlers } from './handlers/messaging.js';
import { registerNotificationHandlers } from './handlers/notifications.js';
import { registerPresenceHandlers } from './handlers/presence.js';

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;
    const tenantId = socket.data.user?.tenantId;

    logger.info('Socket connected', { socketId: socket.id, userId, tenantId });

    // Join tenant room for tenant-wide broadcasts
    if (tenantId) {
      socket.join(`tenant:${tenantId}`);
    }

    // Join user's personal room
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Register event handlers
    registerMessagingHandlers(io!, socket);
    registerNotificationHandlers(io!, socket);
    registerPresenceHandlers(io!, socket);

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, userId, reason });
    });

    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, error: error.message });
    });
  });

  logger.info('Socket.IO server initialized');

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

// Helper functions for emitting events

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToTenant(tenantId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`tenant:${tenantId}`).emit(event, data);
  }
}

export function emitToRoom(room: string, event: string, data: unknown): void {
  if (io) {
    io.to(room).emit(event, data);
  }
}
