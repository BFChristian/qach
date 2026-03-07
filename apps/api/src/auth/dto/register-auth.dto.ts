import { createZodDto } from 'nestjs-zod';
import { RegisterAuthSchema } from '@qach/contracts';

export class RegisterAuthDto extends createZodDto(RegisterAuthSchema) {}
