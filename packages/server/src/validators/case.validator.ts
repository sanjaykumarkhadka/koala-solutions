import { z } from 'zod';
import { CaseStatus, VisaType } from '@prisma/client';

export const createCaseSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  visaType: z.nativeEnum(VisaType),
  nationality: z.string().optional(),
  destinationCountry: z.string().optional(),
  notes: z.string().optional(),
  leadId: z.string().uuid().optional(),
});

export const updateCaseSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  visaType: z.nativeEnum(VisaType).optional(),
  nationality: z.string().optional(),
  destinationCountry: z.string().optional(),
  notes: z.string().optional(),
  expectedDate: z.string().datetime().optional(),
});

export const updateCaseStatusSchema = z.object({
  status: z.nativeEnum(CaseStatus),
  notes: z.string().optional(),
});

export const assignCaseSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
});

export const listCasesSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  status: z.nativeEnum(CaseStatus).optional(),
  visaType: z.nativeEnum(VisaType).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'caseNumber', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  assignedToId: z.string().uuid().optional(),
});

export const createTimelineEventSchema = z.object({
  type: z.enum([
    'STATUS_CHANGE',
    'NOTE_ADDED',
    'DOCUMENT_UPLOADED',
    'DOCUMENT_REVIEWED',
    'ASSIGNMENT_CHANGED',
    'EMAIL_SENT',
    'CALL_MADE',
    'MEETING_SCHEDULED',
    'OTHER',
  ]),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;
export type AssignCaseInput = z.infer<typeof assignCaseSchema>;
export type ListCasesInput = z.infer<typeof listCasesSchema>;
export type CreateTimelineEventInput = z.infer<typeof createTimelineEventSchema>;
