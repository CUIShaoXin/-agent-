interface LearningProgressProps {
  completed: number;
  compact?: boolean;
}

export function LearningProgress({ completed, compact = false }: LearningProgressProps) {
  const safeCompleted = Math.min(6, Math.max(0, completed));

  return (
    <div className={`dogdan-progress ${compact ? "compact" : ""}`} aria-label={`当前完成 ${safeCompleted} 个 Session，共 6 个`}>
      <div><span>LEARNING PROGRESS</span><b>{safeCompleted} / 6</b></div>
      <i><em style={{ width: `${(safeCompleted / 6) * 100}%` }} /></i>
      <p>{safeCompleted === 6 ? "全部课程已完成，准备进入实战。" : `距离完整 Agent 还剩 ${6 - safeCompleted} 个 Session。`}</p>
    </div>
  );
}
