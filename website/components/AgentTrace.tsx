import type { AgentNode } from "../types/agent";
import { StatusBadge } from "./StatusBadge";

export function AgentTrace({ nodes }: { nodes: AgentNode[] }) {
  return (
    <section className="workbench-card trace-panel" aria-label="Agent 执行链">
      <header className="workbench-card-head">
        <div><span>EXECUTION GRAPH</span><h3>Agent Trace</h3></div>
        <small>{nodes.filter((node) => node.status === "success").length}/{nodes.length} completed</small>
      </header>
      <div className="agent-trace-list">
        {nodes.map((node, index) => (
          <article className={`agent-trace-node is-${node.status}`} key={node.id}>
            <div className="trace-rail">
              <span className="trace-agent-icon">{node.icon}</span>
              {index < nodes.length - 1 && <i />}
            </div>
            <div className="trace-node-body">
              <div className="trace-node-title">
                <div><strong>{node.name}</strong><small>{node.duration} ms</small></div>
                <StatusBadge status={node.status} />
              </div>
              <dl>
                <div><dt>INPUT</dt><dd>{node.input}</dd></div>
                <div><dt>OUTPUT</dt><dd>{node.status === "pending" ? "等待上游节点完成…" : node.status === "running" ? "正在处理输入并生成结果…" : node.output}</dd></div>
              </dl>
              {node.meta && node.status !== "pending" && (
                <div className="trace-meta">{node.meta.map((item) => <span key={item}>{item}</span>)}</div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
