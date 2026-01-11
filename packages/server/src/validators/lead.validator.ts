import { z } from 'zod';
import { LeadStatus, LeadSource } from '@prisma/client';

export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  source: z.nativeEnum(LeadSource).optional().default(LeadSource.OTHER),
  notes: z.string().optional(),
  interestedVisa: z.string().optional(),
  nationality: z.string().optional(),
  destinationCountry: z.string().optional(),
});

export const updateLeadSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.nativeEnum(LeadSource).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  notes: z.string().optional(),
  interestedVisa: z.string().optional(),
  nationality: z.string().optional(),
  destinationCountry: z.string().optional(),
});

export const assignLeadSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
});

export const listLeadsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'firstName', 'lastName', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  assignedToId: z.string().uuid().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export type ListLeadsInput = z.infer<typeof listLeadsSchema>;
