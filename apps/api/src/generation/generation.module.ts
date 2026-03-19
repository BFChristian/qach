import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { AiModule } from 'src/shared/ai/ai.module';

@Module({
  controllers: [GenerationController],
  providers: [GenerationService],
  imports: [AiModule],
})
export class GenerationModule {}
