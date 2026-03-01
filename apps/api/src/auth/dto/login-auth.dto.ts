import { createZodDto } from 'nestjs-zod';
import { LoginAuthSchema } from '@qach/contracts';

export class LoginAuthDto extends createZodDto(LoginAuthSchema) {}
