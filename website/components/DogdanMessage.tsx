import type { ReactNode } from "react";
import type { DogdanEmotion } from "./DogdanAvatar";

interface DogdanMessageProps {
  children: ReactNode;
  emotion?: DogdanEmotion;
  eyebrow?: string;
  title?: string;
  compact?: boolean;
}

export function DogdanMessage({ children, emotion = "idle", eyebrow = "狗蛋 Agent", title, compact = false }: DogdanMessageProps) {
  return (
    <div className={`dogdan-message ${compact ? "compact" : ""}`} data-emotion={emotion} role="status">
      <span>{eyebrow}</span>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
