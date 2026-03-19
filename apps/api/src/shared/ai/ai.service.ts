import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import {
  streamText,
  Output,
  type LanguageModel,
  type StreamTextResult,
  type Schema,
} from 'ai';
import { GenerationResponseSchema } from '@qach/contracts';

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  getProvider(
    provider?: string,
    model?: string,
    userApiKey?: string,
  ): LanguageModel {
    const resolvedProvider =
      provider ?? this.config.get<string>('DEFAULT_AI_PROVIDER')!;
    const resolvedModel = model ?? this.config.get<string>('DEFAULT_AI_MODEL')!;

    // Si el usuario no provee API key, usar la del servidor
    if (!userApiKey) {
      const serverApiKey = this.getServerApiKey(resolvedProvider);
      return this.createCustomProvider(
        resolvedProvider,
        resolvedModel,
        serverApiKey,
      );
    }

    return this.createCustomProvider(
      resolvedProvider,
      resolvedModel,
      userApiKey,
    );
  }

  private getServerApiKey(provider: string): string {
    switch (provider) {
      case 'anthropic':
        return this.config.get<string>('ANTHROPIC_API_KEY')!;
      case 'deepseek':
        return this.config.get<string>('DEEPSEEK_API_KEY')!;
      case 'openai':
      default:
        return this.config.get<string>('OPENAI_API_KEY')!;
    }
  }

  private createCustomProvider(
    provider: string,
    model: string,
    apiKey: string,
  ): LanguageModel {
    switch (provider) {
      case 'anthropic':
        return createAnthropic({ apiKey })(model);

      case 'deepseek':
        return createOpenAI({
          apiKey,
          baseURL: 'https://api.deepseek.com/v1',
          name: 'deepseek',
        })(model);
      case 'openai':
      default:
        return createOpenAI({ apiKey })(model);
    }
  }

  public generateStreamText(
    prompt: string,
    system: string,
    providerConfig?: { provider?: string; model?: string; apiKey?: string },
    schema?: Schema,
  ): StreamTextResult<any, any> {
    const model = this.getProvider(
      providerConfig?.provider,
      providerConfig?.model,
      providerConfig?.apiKey,
    );

    if (schema) {
      return streamText({
        model,
        prompt,
        system,
        output: Output.object({ schema }),
      });
    }

    return streamText({ model, prompt, system });
  }

  public generateTestCases(
    prompt: string,
    system: string,
    providerConfig?: { provider?: string; model?: string; apiKey?: string },
  ): StreamTextResult<any, any> {
    const model = this.getProvider(
      providerConfig?.provider,
      providerConfig?.model,
      providerConfig?.apiKey,
    );

    return streamText({
      model,
      prompt,
      system,
      output: Output.object({ schema: GenerationResponseSchema }),
    });
  }
}
