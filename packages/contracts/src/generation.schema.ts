import { z } from 'zod';
import { ScopeEnum, SuiteEnum, TestCaseTypeEnum, PriorityEnum } from './enums';

// ============= INPUT SCHEMA =============
export const GenerateRequestSchema = z.object({
  feature: z
    .string()
    .describe('Feature or user story to generate test cases for'),
  context: z
    .string()
    .optional()
    .describe('Technical stack, frameworks, or relevant project context'),
  scope: ScopeEnum.describe('Test case scope: api, ui, or e2e'),
  additionalInstructions: z
    .string()
    .optional()
    .describe('Extra instructions to guide the generation process'),
  provider: z
    .string()
    .optional()
    .describe('AI provider to use: anthropic, openai, deepseek'),
  model: z
    .string()
    .optional()
    .describe('Specific model identifier to use for generation'),
  apiKey: z
    .string()
    .optional()
    .describe('User-provided API key (overrides default)'),
});

// ============= OUTPUT SCHEMA =============
const TestStepSchema = z.object({
  order: z.number().describe('Sequential step number within the test case'),
  action: z.string().describe('Action to perform, e.g. "Click login button"'),
  target: z
    .string()
    .nullable()
    .describe('UI selector or API endpoint target, e.g. "button#login-submit"'),
  input: z
    .string()
    .nullable()
    .describe('Input data for the action, e.g. "user@test.com"'),
  expected: z
    .string()
    .describe(
      'Expected result after the action, e.g. "Redirect to /dashboard"',
    ),
});

const TestCaseSchema = z.object({
  id: z.string().describe('Unique identifier for the test case'),
  title: z.string().describe('Short descriptive title of the test case'),
  type: TestCaseTypeEnum.describe(
    'Test case category: positive, negative, edge, or boundary',
  ),
  priority: PriorityEnum.describe(
    'Execution priority: critical, high, medium, or low',
  ),
  suite: SuiteEnum.describe('Test suite classification: api, ui, or e2e'),
  preconditions: z
    .array(z.string())
    .describe('Conditions that must be met before executing the test'),
  steps: z.array(TestStepSchema).describe('Ordered list of steps to execute'),
  tags: z
    .array(z.string())
    .nullable()
    .describe('Optional labels for filtering and grouping'),
});

export const GenerationResponseSchema = z.object({
  testCases: z.array(TestCaseSchema).describe('Generated test cases'),
  risks: z
    .array(
      z.object({
        description: z.string().describe('Description of the identified risk'),
        severity: z.string().describe('Risk severity level'),
      }),
    )
    .describe('Potential risks identified during analysis'),
  assumptions: z
    .array(z.string())
    .describe('Assumptions made during test case generation'),
  questions: z
    .array(z.string())
    .describe('Open questions that need clarification from the user'),
  checklist: z
    .array(
      z.object({
        item: z.string().describe('Checklist item description'),
        category: z.string().describe('Category the checklist item belongs to'),
      }),
    )
    .describe('QA checklist derived from the analysis'),
  metadata: z
    .object({
      scope: z.string().describe('Scope used for generation'),
      template: z.string().nullable().describe('Template used, if any'),
      model: z.string().describe('AI model used for generation'),
      generatedAt: z.string().describe('ISO 8601 timestamp of generation'),
    })
    .describe('Metadata about the generation process'),
});
