import { Server, Socket } from 'socket.io';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../utils/logger.js';

export function registerNotificationHandlers(io: Server, socket: Socket): void {
  const userId = socket.data.user?.id;

  if (!userId) {
    return;
  }

  // Get unread notification count
  socket.on('notifications:count', async () => {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      socket.emit('notifications:count', { count });
    } catch (error) {
      logger.error('Error getting notification count', { error, userId });
    }
  });

  // Mark notification as read
  socket.on('notification:read', async (notificationId: string) => {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user owns this notification
        },
        data: { read: true },
      });

      socket.emit('notification:updated', { id: notificationId, read: true });
    } catch (error) {
      logger.error('Error marking notification as read', { error, userId, notificationId });
    }
  });

  // Mark all notifications as read
  socket.on('notifications:readAll', async () => {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: { read: true },
      });

      socket.emit('notifications:allRead');
    } catch (error) {
      logger.error('Error marking all notifications as read', { error, userId });
    }
  });
}

// Helper function to create and emit notification
export async function createNotification(
  io: Server,
  data: {
    tenantId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }
): Promise<void> {
  try {
    const notification = await prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type as 'LEAD_ASSIGNED' | 'CASE_UPDATE' | 'DOCUMENT_UPLOADED' | 'DOCUMENT_REVIEWED' | 'MESSAGE_RECEIVED' | 'JOB_MATCH' | 'SYSTEM',
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });

    // Emit to user
    io.to(`user:${data.userId}`).emit('notification:new', notification);
  } catch (error) {
    logger.error('Error creating notification', { error, data });
  }
}
