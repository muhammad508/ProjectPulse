"use client";

import {
  addMilestoneAction,
  deleteMilestoneAction,
  moveMilestoneAction,
  updateMilestoneAction,
} from "@/app/actions/milestones";
import { buttonClasses } from "@/components/ui/button";
import { addMilestoneSchema, updateMilestoneSchema } from "@/lib/validation/milestone";
import { Field, fieldA11y, FormMessage, inputClasses } from "./fields";
import { useValidatedForm } from "./use-validated-form";

export function AddMilestoneForm({ projectId }: { projectId: string }) {
  const form = useValidatedForm(addMilestoneSchema, addMilestoneAction);
  const errors = form.fieldErrors;

  return (
    <form action={form.formAction} onSubmit={form.onSubmit} noValidate className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <FormMessage error={form.error} />
      <div className="grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
        <Field label="New milestone" htmlFor="new-milestone-title" errors={errors.title}>
          <input
            id="new-milestone-title"
            name="title"
            type="text"
            maxLength={160}
            placeholder="e.g. Design approved"
            defaultValue={form.valueFor("title")}
            {...fieldA11y("new-milestone-title", errors.title)}
            className={inputClasses}
          />
        </Field>
        <Field label="Due date" htmlFor="new-milestone-due" errors={errors.dueDate}>
          <input
            id="new-milestone-due"
            name="dueDate"
            type="date"
            defaultValue={form.valueFor("dueDate")}
            {...fieldA11y("new-milestone-due", errors.dueDate)}
            className={inputClasses}
          />
        </Field>
        <button type="submit" disabled={form.pending} className={buttonClasses("primary")}>
          Add milestone
        </button>
      </div>
    </form>
  );
}

type MilestoneRowProps = {
  milestone: { id: string; title: string; dueDate: string };
  isFirst: boolean;
  isLast: boolean;
};

/** One editable milestone: save changes, reorder, or delete. */
export function MilestoneRow({ milestone, isFirst, isLast }: MilestoneRowProps) {
  const form = useValidatedForm(updateMilestoneSchema, updateMilestoneAction);
  const errors = form.fieldErrors;
  const { id } = milestone;

  return (
    <form action={form.formAction} onSubmit={form.onSubmit} noValidate className="space-y-2 py-3">
      <input type="hidden" name="milestoneId" value={id} />
      <div className="grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-start">
        <Field label="Title" htmlFor={`title-${id}`} errors={errors.title}>
          <input
            id={`title-${id}`}
            name="title"
            type="text"
            maxLength={160}
            defaultValue={form.valueFor("title", milestone.title)}
            {...fieldA11y(`title-${id}`, errors.title)}
            className={inputClasses}
          />
        </Field>
        <Field label="Due date" htmlFor={`due-${id}`} errors={errors.dueDate}>
          <input
            id={`due-${id}`}
            name="dueDate"
            type="date"
            defaultValue={form.valueFor("dueDate", milestone.dueDate)}
            {...fieldA11y(`due-${id}`, errors.dueDate)}
            className={inputClasses}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2 sm:pt-6">
          <button type="submit" disabled={form.pending} className={buttonClasses("secondary")}>
            Save
          </button>
          <button
            type="submit"
            formAction={moveMilestoneAction.bind(null, "up")}
            data-skip-validation
            disabled={isFirst}
            aria-label={`Move "${milestone.title}" up`}
            className={buttonClasses("ghost")}
          >
            ↑
          </button>
          <button
            type="submit"
            formAction={moveMilestoneAction.bind(null, "down")}
            data-skip-validation
            disabled={isLast}
            aria-label={`Move "${milestone.title}" down`}
            className={buttonClasses("ghost")}
          >
            ↓
          </button>
          <button
            type="submit"
            formAction={deleteMilestoneAction}
            data-skip-validation
            aria-label={`Delete "${milestone.title}"`}
            className={buttonClasses("danger")}
          >
            Delete
          </button>
        </div>
      </div>
      <FormMessage error={form.error} success={form.success} />
    </form>
  );
}
