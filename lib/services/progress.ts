/**
 * Progress of a project as a whole-number percentage of completed milestones.
 * A project without milestones has 0% progress.
 */
export function calculateProgress(milestones: ReadonlyArray<{ completedAt: Date | null }>): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((milestone) => milestone.completedAt !== null).length;
  return Math.round((completed / milestones.length) * 100);
}
