import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from 'src/shared/ai/ai.service';
import { GenerationRequestDto } from './dto/generation-request.dto';
import type { Response } from 'express';

@Injectable()
export class GenerationService {
  constructor(
    private readonly aiService: AiService,
    private readonly config: ConfigService,
  ) {}

  async generate(dto: GenerationRequestDto, res: Response) {
    // System prompt desde variable de entorno
    const systemPrompt = this.config.get<string>('SYSTEM_PROMPT');
    if (!systemPrompt) {
      throw new Error('SYSTEM_PROMPT is not defined in environment variables');
    }

    // Construir el prompt del usuario
    const userPrompt = this.buildUserPrompt(dto);

    // Generar stream de test cases con schema embebido en AiService
    const stream = this.aiService.generateTestCases(userPrompt, systemPrompt, {
      provider: dto.provider,
      model: dto.model,
      apiKey: dto.apiKey,
    });

    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream de texto que contiene el JSON estructurado
    for await (const chunk of stream.textStream) {
      res.write(chunk);
    }
    res.end();
  }

  private buildUserPrompt(dto: GenerationRequestDto): string {
    let prompt = `Generate comprehensive test cases for the following feature:\n\n${dto.feature}`;

    if (dto.scope) {
      prompt += `\n\nScope: Focus on ${dto.scope.toUpperCase()} testing only.`;
    }

    if (dto.context) {
      prompt += `\n\nTechnical Context:\n${dto.context}`;
    }

    if (dto.additionalInstructions) {
      prompt += `\n\nAdditional Instructions:\n${dto.additionalInstructions}`;
    }

    return prompt;
  }
}
