interface ProgressBarProps {
  completed: number;
  total?: number;
  compact?: boolean;
}

export function ProgressBar({ completed, total = 6, compact = false }: ProgressBarProps) {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className={`learning-progress ${compact ? "compact" : ""}`} aria-label={`${completed} / ${total} Session Completed`}>
      <div>
        <span>YOUR PROGRESS</span>
        <b>{completed} / {total}</b>
      </div>
      <i><em style={{ width: `${percentage}%` }} /></i>
      {!compact && <p>{completed} / {total} Session Completed</p>}
    </div>
  );
}
