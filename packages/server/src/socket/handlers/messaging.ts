import { Server, Socket } from 'socket.io';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../utils/logger.js';

export function registerMessagingHandlers(io: Server, socket: Socket): void {
  const userId = socket.data.user?.id;
  const tenantId = socket.data.user?.tenantId;

  if (!userId || !tenantId) {
    return;
  }

  // Join a conversation room
  socket.on('room:join', async (conversationId: string) => {
    try {
      // Verify user is a member of this conversation
      const member = await prisma.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!member) {
        socket.emit('error', { message: 'Not a member of this conversation' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      logger.debug('User joined conversation room', { userId, conversationId });
    } catch (error) {
      logger.error('Error joining room', { error, userId, conversationId });
    }
  });

  // Leave a conversation room
  socket.on('room:leave', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    logger.debug('User left conversation room', { userId, conversationId });
  });

  // Send a message
  socket.on('message:send', async (data: { conversationId: string; content: string }) => {
    try {
      const { conversationId, content } = data;

      // Verify membership
      const member = await prisma.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        include: {
          conversation: true,
        },
      });

      if (!member) {
        socket.emit('error', { message: 'Not a member of this conversation' });
        return;
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
          readBy: [userId],
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update conversation lastMessageAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Broadcast to conversation room
      io.to(`conversation:${conversationId}`).emit('message:new', message);

      // Notify other participants who are not in the room
      const members = await prisma.conversationMember.findMany({
        where: { conversationId },
        select: { userId: true },
      });

      for (const m of members) {
        if (m.userId !== userId) {
          io.to(`user:${m.userId}`).emit('notification:new', {
            type: 'MESSAGE_RECEIVED',
            title: 'New message',
            message: `${socket.data.user.firstName} sent you a message`,
            conversationId,
          });
        }
      }

      logger.debug('Message sent', { userId, conversationId, messageId: message.id });
    } catch (error) {
      logger.error('Error sending message', { error, userId });
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark message as read
  socket.on('message:read', async (messageId: string) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: { conversation: true },
      });

      if (!message) {
        return;
      }

      // Verify membership
      const member = await prisma.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId: message.conversationId,
            userId,
          },
        },
      });

      if (!member) {
        return;
      }

      // Add user to readBy if not already there
      if (!message.readBy.includes(userId)) {
        await prisma.message.update({
          where: { id: messageId },
          data: {
            readBy: [...message.readBy, userId],
          },
        });

        // Notify sender that message was read
        io.to(`user:${message.senderId}`).emit('message:read', {
          messageId,
          readBy: userId,
        });
      }
    } catch (error) {
      logger.error('Error marking message as read', { error, userId, messageId });
    }
  });

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    const { conversationId, isTyping } = data;
    const event = isTyping ? 'typing:start' : 'typing:stop';

    socket.to(`conversation:${conversationId}`).emit(event, {
      conversationId,
      userId,
      userName: `${socket.data.user.firstName} ${socket.data.user.lastName}`,
    });
  });
}
