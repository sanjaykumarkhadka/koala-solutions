import { z } from 'zod';

export const checkSlugSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const createAgencySchema = z.object({
  // Agency details
  agencyName: z.string().min(2, 'Agency name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  // Admin user details
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),

  // Optional settings
  timezone: z.string().optional(),
  primaryColor: z.string().optional(),
});

export type CheckSlugInput = z.infer<typeof checkSlugSchema>;
export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
