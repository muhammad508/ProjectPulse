/** Horizontal progress bar. `percent` is a whole number between 0 and 100. */
export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-10 text-right text-sm tabular-nums text-slate-600">{percent}%</span>
    </div>
  );
}
