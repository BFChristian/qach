import { z } from 'zod';

export const userSchema = z.object({
  email: z.email(),
  username: z.string(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN']),
});
