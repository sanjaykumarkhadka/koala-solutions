import { z } from 'zod';
import { JobStatus, JobType } from '@prisma/client';

export const createJobSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  title: z.string().min(1, 'Job title is required').max(200),
  description: z.string().min(1, 'Job description is required'),
  requirements: z.array(z.string()).optional().default([]),
  location: z.string().min(1, 'Location is required'),
  country: z.string().min(1, 'Country is required'),
  salary: z.string().optional(),
  jobType: z.nativeEnum(JobType),
  visaSponsorship: z.boolean().optional().default(false),
  openPositions: z.number().min(1).optional().default(1),
  deadline: z.string().datetime().optional(),
});

export const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  salary: z.string().optional(),
  jobType: z.nativeEnum(JobType).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  visaSponsorship: z.boolean().optional(),
  openPositions: z.number().min(1).optional(),
  deadline: z.string().datetime().optional(),
});

export const listJobsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  status: z.nativeEnum(JobStatus).optional(),
  jobType: z.nativeEnum(JobType).optional(),
  companyId: z.string().uuid().optional(),
  country: z.string().optional(),
  visaSponsorship: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'deadline']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ListJobsInput = z.infer<typeof listJobsSchema>;
