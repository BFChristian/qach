import { z } from "zod";

// ─── Story Schemas ───────────────────────────────────────────

export const CreateStoryInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assigneeId: z.string().uuid().optional(),
});

export type CreateStoryInput = z.infer<typeof CreateStoryInputSchema>;

export const UpdateStoryInputSchema = CreateStoryInputSchema.partial();
export type UpdateStoryInput = z.infer<typeof UpdateStoryInputSchema>;

export const StorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assigneeId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Story = z.infer<typeof StorySchema>;

export { z };
