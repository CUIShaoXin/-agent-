"use client";

import { useState } from "react";
import type { AgentDefinition } from "../types/agent";

export function AgentPanel({ agents }: { agents: AgentDefinition[] }) {
  const [items, setItems] = useState(agents);

  function toggle(id: string) {
    setItems((current) => current.map((agent) => agent.id === id ? { ...agent, enabled: !agent.enabled } : agent));
  }

  return (
    <div className="console-panel">
      <div className="console-panel-summary">
        <span><i className="online-dot" />{items.filter((agent) => agent.enabled).length} agents enabled</span>
        <small>orchestrator v2.4</small>
      </div>
      <div className="agent-config-list">
        {items.map((agent) => (
          <article className={!agent.enabled ? "disabled" : ""} key={agent.id}>
            <span className="config-agent-icon">{agent.icon}</span>
            <div><strong>{agent.name}</strong><small>{agent.role}</small></div>
            <button className={`toggle-switch ${agent.enabled ? "on" : ""}`} onClick={() => toggle(agent.id)} aria-label={`${agent.enabled ? "关闭" : "启用"} ${agent.name}`}><i /></button>
          </article>
        ))}
      </div>
    </div>
  );
}
