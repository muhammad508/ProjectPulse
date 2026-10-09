import { z } from "zod";
import { requiredId } from "./common";

export const noteSchema = z.object({
  message: z.string().trim().min(1, "Write a note first").max(1000, "Must be at most 1000 characters"),
});

export const addNoteSchema = noteSchema.extend({ projectId: requiredId });
