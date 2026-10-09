import { z } from "zod";
import { PROJECT_STATUSES } from "@/lib/constants";
import { optionalDate, optionalText, requiredId } from "./common";

export const projectSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120, "Must be at most 120 characters"),
    description: optionalText(2000),
    status: z.enum(PROJECT_STATUSES, "Select a status"),
    clientId: z.string().min(1, "Select a client"),
    startDate: optionalDate,
    dueDate: optionalDate,
  })
  .refine((project) => !project.startDate || !project.dueDate || project.dueDate >= project.startDate, {
    message: "Due date must not be before the start date",
    path: ["dueDate"],
  });

export type ProjectInput = z.infer<typeof projectSchema>;

/** Hidden-field payload for actions that target an existing project. */
export const projectIdSchema = z.object({ projectId: requiredId });

export const archiveSchema = z.object({
  projectId: requiredId,
  archived: z.enum(["true", "false"]).transform((value) => value === "true"),
});
