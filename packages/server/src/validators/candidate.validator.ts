import { z } from 'zod';
import { CandidateStatus, ApplicationStatus } from '@prisma/client';

export const updateCandidateSchema = z.object({
  skills: z.array(z.string()).optional(),
  experience: z.number().min(0).optional(),
  education: z.string().optional(),
  currentLocation: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  expectedSalary: z.string().optional(),
  availableFrom: z.string().datetime().optional(),
  status: z.nativeEnum(CandidateStatus).optional(),
});

export const listCandidatesSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  status: z.nativeEnum(CandidateStatus).optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
  minExperience: z.coerce.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'experience', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const applyToJobSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  notes: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type ListCandidatesInput = z.infer<typeof listCandidatesSchema>;
export type ApplyToJobInput = z.infer<typeof applyToJobSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
