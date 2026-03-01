import { createZodDto } from 'nestjs-zod';
import { userSchema } from '@qach/contracts';

export class CreateUserDto extends createZodDto(userSchema) {}
