import { Controller, Post, Body, Res } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerationRequestDto } from './dto/generation-request.dto';
import type { Response } from 'express';

@Controller('generation')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generate')
  async generate(@Body() dto: GenerationRequestDto, @Res() res: Response) {
    return this.generationService.generate(dto, res);
  }
}
