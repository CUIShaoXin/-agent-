import type { GuardRule } from "../types/agent";

export function GuardPanel({ rules }: { rules: GuardRule[] }) {
  return (
    <div className="console-panel guard-console-panel">
      <div className="guard-score"><span>SECURITY SCORE</span><strong>98<small>/100</small></strong><i /></div>
      <div className="guard-list">
        {rules.map((rule) => (
          <article key={rule.id}>
            <div><span className={rule.status}>{rule.status === "blocked" ? "!" : "✓"}</span><strong>{rule.name}</strong><b>{rule.status}</b></div>
            <p>{rule.description}</p><small>{rule.lastCheck}</small>
          </article>
        ))}
      </div>
      <div className="guard-event"><span>BLOCKED EVENT</span><p>用户：删除数据库</p><strong>原因：危险 SQL · destructive operation</strong></div>
    </div>
  );
}
