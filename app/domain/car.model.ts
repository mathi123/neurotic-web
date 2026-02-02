import * as z from 'zod';

export const carSchema = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().min(1).max(100),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type Car = z.infer<typeof carSchema>;
