import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export const listCompaniesSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type ListCompaniesInput = z.infer<typeof listCompaniesSchema>;
