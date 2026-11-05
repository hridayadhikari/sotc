import { z } from 'zod';

export const certificateSchema = z.object({
  certificate_id: z
    .string()
    .trim()
    .min(3, 'Certificate reference is required')
    .max(100),
  certificate_type: z
    .string()
    .trim()
    .min(2, 'Certificate type is required')
    .default('Internship Completion'),
  certificate_title: z
    .string()
    .trim()
    .optional()
    .default('Certificate of Internship'),
  recipient_name: z
    .string()
    .trim()
    .min(2, 'Recipient name must be at least 2 characters')
    .max(120),
  role: z
    .string()
    .trim()
    .min(2, 'Role or purpose is required')
    .max(120),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  issuing_org: z
    .string()
    .trim()
    .min(2)
    .default('Streets of Tripura'),
  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
  status: z.enum(['valid', 'revoked']).default('valid'),
});

export const updateCertificateSchema = certificateSchema.omit({ certificate_id: true }).partial().extend({
  status: z.enum(['valid', 'revoked']).optional(),
  reason: z.string().trim().max(300).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
