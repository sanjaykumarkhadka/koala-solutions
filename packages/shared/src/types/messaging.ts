export enum ConversationType {
  CASE = 'CASE',
  SUPPORT = 'SUPPORT',
  DIRECT = 'DIRECT',
}

export interface Conversation {
  id: string;
  tenantId: string;
  type: ConversationType;
  caseId: string | null;
  participantIds: string[];
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface CreateConversationInput {
  type: ConversationType;
  participantIds: string[];
  caseId?: string;
}

export interface SendMessageInput {
  content: string;
}

// Socket events
export interface SocketEvents {
  // Server to Client
  'notification:new': (notification: Notification) => void;
  'message:new': (message: Message) => void;
  'case:updated': (caseId: string, status: string) => void;
  'lead:assigned': (leadId: string, assigneeId: string) => void;
  'typing:start': (conversationId: string, userId: string) => void;
  'typing:stop': (conversationId: string, userId: string) => void;

  // Client to Server
  'message:send': (conversationId: string, content: string) => void;
  'message:read': (messageId: string) => void;
  'room:join': (conversationId: string) => void;
  'room:leave': (conversationId: string) => void;
  'typing': (conversationId: string, isTyping: boolean) => void;
}

export enum NotificationType {
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  CASE_UPDATE = 'CASE_UPDATE',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_REVIEWED = 'DOCUMENT_REVIEWED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  JOB_MATCH = 'JOB_MATCH',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}
