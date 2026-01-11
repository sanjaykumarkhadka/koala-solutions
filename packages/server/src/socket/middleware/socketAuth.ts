import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/index.js';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../utils/logger.js';

interface JwtPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export async function socketAuth(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.status !== 'ACTIVE') {
      return next(new Error('User account is not active'));
    }

    if (user.tenant.status !== 'ACTIVE') {
      return next(new Error('Organization is not active'));
    }

    // Attach user data to socket
    socket.data.user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    logger.debug('Socket authenticated', { userId: user.id, socketId: socket.id });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error('Invalid token'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('Token expired'));
    }
    logger.error('Socket auth error', { error });
    next(new Error('Authentication failed'));
  }
}
