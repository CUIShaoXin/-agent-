import type { AgentStatus } from "../types/agent";

const labels: Record<AgentStatus, string> = {
  pending: "pending",
  running: "running",
  success: "success",
  failed: "failed",
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  return <span className={`status-badge status-${status}`}><i />{labels[status]}</span>;
}
