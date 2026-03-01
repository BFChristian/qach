import { createZodDto } from 'nestjs-zod';
import { RegisterAuthSchema } from 'node_modules/@qach/contracts/src/auth.schema';

export class RegisterAuthDto extends createZodDto(RegisterAuthSchema) {}
