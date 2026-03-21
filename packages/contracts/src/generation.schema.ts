import { z } from 'zod';

// ============= INPUT SCHEMA =============
export const GenerateRequestSchema = z.object({
  feature: z.string().describe('Feature o user story a testear'),
  context: z.string().optional().describe('Stack técnico, frameworks, etc.'),
  additionalInstructions: z
    .string()
    .optional()
    .describe('Instrucciones adicionales'),
  provider: z.string().optional().describe('anthropic, openai, deepseek'),
  model: z.string().optional().describe('Modelo específico'),
  apiKey: z.string().optional().describe('API key del usuario (opcional)'),
});

// ============= OUTPUT SCHEMA =============
const TestStepSchema = z.object({
  order: z.number(),
  action: z.string(), // "Click login button"
  target: z.string().nullable(), // "button#login-submit"
  input: z.string().nullable(), // "user@test.com"
  expected: z.string(), // "Redirect to /dashboard"
});

const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['positive', 'negative', 'edge', 'boundary']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  suite: z.enum(['api', 'ui', 'e2e']),
  preconditions: z.array(z.string()),
  steps: z.array(TestStepSchema),
  tags: z.array(z.string()).nullable(),
});

export const GenerationResponseSchema = z.object({
  testCases: z.array(TestCaseSchema),
  risks: z.array(z.object({ description: z.string(), severity: z.string() })),
  assumptions: z.array(z.string()),
  questions: z.array(z.string()),
  checklist: z.array(z.object({ item: z.string(), category: z.string() })),
  metadata: z.object({
    scope: z.string(),
    template: z.string().nullable(),
    model: z.string(),
    generatedAt: z.string(),
  }),
});
