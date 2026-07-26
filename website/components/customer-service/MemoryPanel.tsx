export interface MemoryPanelProps {
  sessionId: string;
  turns: number;
  messageCount: number;
  intent: string;
}

export function MemoryPanel({ sessionId, turns, messageCount, intent }: MemoryPanelProps) {
  const contextStatus = messageCount > 12 ? "摘要 + 近期消息" : "近期消息完整";
  const visibleSession = sessionId ? `${sessionId.slice(0, 8)}…` : "首次提问后创建";

  return (
    <section className="cs-panel">
      <div className="cs-panel-title"><span>会话记忆</span><small>MEMORY ON</small></div>
      <dl className="cs-facts">
        <div><dt>Session ID</dt><dd title={sessionId}>{visibleSession}</dd></div>
        <div><dt>历史消息轮数</dt><dd>{turns} 轮</dd></div>
        <div><dt>上下文状态</dt><dd>{contextStatus}</dd></div>
        <div><dt>当前意图</dt><dd>{intent}</dd></div>
      </dl>
    </section>
  );
}
