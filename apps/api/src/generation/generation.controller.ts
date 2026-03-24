import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { GenerationService } from './generation.service';
import { GenerationRequestDto } from './dto/generation-request.dto';
import type { Response } from 'express';

@Controller('generation')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { ttl: 60000, limit: 10 } })
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generate')
  async generate(@Body() dto: GenerationRequestDto, @Res() res: Response) {
    return this.generationService.generate(dto, res);
  }
}
