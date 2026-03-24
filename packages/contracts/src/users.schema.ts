import { z } from 'zod';
import { RoleEnum } from './enums';

export const userSchema = z.object({
  email: z.email(),
  username: z.string(),
  password: z.string().min(6),
  role: RoleEnum,
});
