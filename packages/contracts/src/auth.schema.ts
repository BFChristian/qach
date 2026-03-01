import { z } from 'zod';

export const RegisterAuthSchema = z.object({
  email: z.email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

export const LoginAuthSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});
