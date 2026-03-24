import { z } from 'zod';

export const RoleEnum = z.enum(['USER', 'ADMIN']);

export const ScopeEnum = z.enum(['api', 'ui', 'e2e']);

export const SuiteEnum = z.enum(['api', 'ui', 'e2e']);

export const TestCaseTypeEnum = z.enum([
  'positive',
  'negative',
  'edge',
  'boundary',
]);

export const PriorityEnum = z.enum(['critical', 'high', 'medium', 'low']);
