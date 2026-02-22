import { z } from "zod";

export const QAchPromptInputSchema = z.object({
  story: z.string().min(10),
  acceptanceCriteria: z.array(z.string()).default([]),
  context: z.string().optional(),
  scope: z.enum(["API_ONLY", "UI_ONLY", "E2E", "MIXED"]).optional(),
});

export const QAchOutputSchema = z.object({
  meta: z.object({
    version: z.string(),
    model: z.string().optional(),
  }),
  questionsForPO: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  testCases: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        priority: z.enum(["P0", "P1", "P2"]).default("P1"),
        steps: z.array(z.string()).min(1),
        expected: z.array(z.string()).min(1),
        tags: z.array(z.string()).default([]),
      }),
    )
    .min(1),
});

export type QAchPromptInput = z.infer<typeof QAchPromptInputSchema>;
export type QAchOutput = z.infer<typeof QAchOutputSchema>;
