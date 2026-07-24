import type { MemoryState } from "../types/agent";

export function MemoryPanel({ memory }: { memory: MemoryState }) {
  return (
    <div className="console-panel memory-console-panel">
      <div className="memory-session-row"><span>SESSION</span><code>{memory.sessionId}</code></div>
      <div className="memory-block">
        <header><strong>Short Memory</strong><small>最近 5 轮</small></header>
        <ol>{memory.shortMemory.map((item) => <li key={item}>{item}</li>)}</ol>
      </div>
      <div className="memory-block">
        <header><strong>Long Memory</strong><small>用户偏好</small></header>
        <div className="memory-tags">{memory.longMemory.map((item) => <span key={item}>{item}</span>)}</div>
      </div>
      <div className="redis-checkpoint"><i>R</i><div><strong>Redis checkpoint</strong><small>{memory.checkpoint}</small></div><b>synced</b></div>
    </div>
  );
}
