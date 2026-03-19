import { GenerateRequestSchema } from '@qach/contracts';
import { createZodDto } from 'nestjs-zod';

export class GenerationRequestDto extends createZodDto(GenerateRequestSchema) {}
