"use client";

import Link from "next/link";
import { createProjectAction, updateProjectAction } from "@/app/actions/projects";
import { buttonClasses } from "@/components/ui/button";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";
import { projectSchema } from "@/lib/validation/project";
import { Field, fieldA11y, FormMessage, inputClasses } from "./fields";
import { useValidatedForm } from "./use-validated-form";

export type ProjectFormValues = {
  name: string;
  description: string;
  status: ProjectStatus;
  clientId: string;
  startDate: string;
  dueDate: string;
};

type ProjectFormProps = {
  clients: { id: string; name: string; email: string }[];
  /** Present when editing an existing project. */
  projectId?: string;
  initialValues?: ProjectFormValues;
  cancelHref: string;
};

const emptyValues: ProjectFormValues = {
  name: "",
  description: "",
  status: "PLANNING",
  clientId: "",
  startDate: "",
  dueDate: "",
};

export function ProjectForm({
  clients,
  projectId,
  initialValues = emptyValues,
  cancelHref,
}: ProjectFormProps) {
  const form = useValidatedForm(projectSchema, projectId ? updateProjectAction : createProjectAction);
  const errors = form.fieldErrors;

  return (
    <form action={form.formAction} onSubmit={form.onSubmit} noValidate className="space-y-5">
      {projectId && <input type="hidden" name="projectId" value={projectId} />}
      <FormMessage error={form.error} success={form.success} />

      <Field label="Name" htmlFor="name" errors={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={120}
          defaultValue={form.valueFor("name", initialValues.name)}
          {...fieldA11y("name", errors.name)}
          className={inputClasses}
        />
      </Field>

      <Field label="Description" htmlFor="description" errors={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={form.valueFor("description", initialValues.description)}
          {...fieldA11y("description", errors.description)}
          className={inputClasses}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Client" htmlFor="clientId" errors={errors.clientId}>
          <select
            id="clientId"
            name="clientId"
            defaultValue={form.valueFor("clientId", initialValues.clientId)}
            {...fieldA11y("clientId", errors.clientId)}
            className={inputClasses}
          >
            <option value="">Select a client…</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" htmlFor="status" errors={errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={form.valueFor("status", initialValues.status)}
            {...fieldA11y("status", errors.status)}
            className={inputClasses}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Start date" htmlFor="startDate" errors={errors.startDate}>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={form.valueFor("startDate", initialValues.startDate)}
            {...fieldA11y("startDate", errors.startDate)}
            className={inputClasses}
          />
        </Field>

        <Field label="Due date" htmlFor="dueDate" errors={errors.dueDate}>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={form.valueFor("dueDate", initialValues.dueDate)}
            {...fieldA11y("dueDate", errors.dueDate)}
            className={inputClasses}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={form.pending} className={buttonClasses("primary")}>
          {form.pending ? "Saving…" : projectId ? "Save changes" : "Create project"}
        </button>
        <Link href={cancelHref} className={buttonClasses("ghost")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
