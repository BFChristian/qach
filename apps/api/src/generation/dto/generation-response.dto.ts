import { createZodDto } from 'nestjs-zod';
import { GenerationResponseSchema } from '@qach/contracts';

export class GenerationResponseDto extends createZodDto(
  GenerationResponseSchema,
) {}
