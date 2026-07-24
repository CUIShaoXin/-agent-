import type { ToolCallRecord } from "../types/agent";
import { StatusBadge } from "./StatusBadge";

export function ToolCallViewer({ calls }: { calls: ToolCallRecord[] }) {
  return (
    <section className="workbench-card tool-call-panel">
      <header className="workbench-card-head">
        <div><span>OBSERVABILITY</span><h3>Tool Calls</h3></div>
        <small>{calls.length} calls</small>
      </header>
      <div className="tool-call-grid">
        {calls.map((call) => (
          <article key={call.id}>
            <div className="tool-call-title"><b>{call.icon}</b><strong>{call.tool}</strong><StatusBadge status={call.status} /></div>
            <label>INPUT</label><code>{call.input}</code>
            <label>RESULT · {call.duration} ms</label><p>{call.result}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
