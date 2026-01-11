import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger.js';

// In-memory store for online users (in production, use Redis)
const onlineUsers = new Map<string, Set<string>>(); // tenantId -> Set<userId>

export function registerPresenceHandlers(io: Server, socket: Socket): void {
  const userId = socket.data.user?.id;
  const tenantId = socket.data.user?.tenantId;

  if (!userId || !tenantId) {
    return;
  }

  // Add user to online list
  if (!onlineUsers.has(tenantId)) {
    onlineUsers.set(tenantId, new Set());
  }
  onlineUsers.get(tenantId)!.add(userId);

  // Broadcast user online status to tenant
  io.to(`tenant:${tenantId}`).emit('presence:online', {
    userId,
    userName: `${socket.data.user.firstName} ${socket.data.user.lastName}`,
  });

  // Get online users in tenant
  socket.on('presence:list', () => {
    const users = onlineUsers.get(tenantId) || new Set();
    socket.emit('presence:list', Array.from(users));
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const tenantUsers = onlineUsers.get(tenantId);
    if (tenantUsers) {
      tenantUsers.delete(userId);

      // Only emit offline if user has no other connections
      const roomSize = io.sockets.adapter.rooms.get(`user:${userId}`)?.size || 0;
      if (roomSize === 0) {
        io.to(`tenant:${tenantId}`).emit('presence:offline', { userId });
      }
    }
  });
}

// Helper functions
export function isUserOnline(tenantId: string, userId: string): boolean {
  return onlineUsers.get(tenantId)?.has(userId) || false;
}

export function getOnlineUsers(tenantId: string): string[] {
  return Array.from(onlineUsers.get(tenantId) || []);
}
