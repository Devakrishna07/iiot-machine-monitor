import { z } from 'zod';

export const acknowledgeFaultSchema = z.object({
  supervisorId: z
    .string()
    .trim()
    .min(1, 'supervisorId is required and cannot be empty'),
  notes: z.string().trim().optional(),
});

export type AcknowledgeFaultInput = z.infer<typeof acknowledgeFaultSchema>;
