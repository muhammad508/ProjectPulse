import { z } from "zod";
import { optionalDate, requiredId } from "./common";

const title = z.string().trim().min(1, "Title is required").max(160, "Must be at most 160 characters");

/** Fields shared by the "add" and "edit" milestone forms. */
export const milestoneSchema = z.object({
  title,
  dueDate: optionalDate,
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

export const addMilestoneSchema = milestoneSchema.extend({ projectId: requiredId });

export const updateMilestoneSchema = milestoneSchema.extend({ milestoneId: requiredId });

export const milestoneIdSchema = z.object({ milestoneId: requiredId });

export const moveMilestoneSchema = z.object({
  milestoneId: requiredId,
  direction: z.enum(["up", "down"]),
});

export const toggleMilestoneSchema = z.object({
  milestoneId: requiredId,
  completed: z.enum(["true", "false"]).transform((value) => value === "true"),
});
