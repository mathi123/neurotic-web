import * as z from 'zod';

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(32),
});

export type Credentials = z.infer<typeof credentialsSchema>;
