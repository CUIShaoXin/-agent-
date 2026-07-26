"use client";

import { FormEvent, useRef, useState } from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type ChatResponse = {
  answer: string;
  session_id: string;
  intent: string;
  sources: Array<{ filename: string }>;
  database_used: boolean;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000").replace(/\/$/, "");

const quickPrompts = [
  "这款产品适合什么团队？",
  "你们支持私有化部署吗？",
  "帮我推荐适合 1000 人企业的方案",
  "我想删除数据库",
];

function getSessionId() {
  const storageKey = "minimum-agent-customer-session";
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const created = window.crypto.randomUUID?.() || `cs-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(storageKey, created);
  return created;
}

export function CustomerServiceDemo() {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [intent, setIntent] = useState("产品咨询");
  const [knowledgeSource, setKnowledgeSource] = useState("企业知识库");
  const sessionId = useRef("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "你好，我是 Minimum Agent Lab 智能客服。你可以咨询产品能力、部署方式或企业方案。",
    },
  ]);

  async function sendMessage(text: string) {
    const value = text.trim();
    if (!value || sending) return;
    const userMessageId = Date.now();
    setMessages((current) => [...current, { id: userMessageId, role: "user", text: value }]);
    setInput("");
    setSending(true);
    try {
      sessionId.current ||= getSessionId();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, session_id: sessionId.current }),
      });
      const payload = await response.json().catch(() => ({})) as Partial<ChatResponse> & { detail?: string };
      if (!response.ok || !payload.answer) {
        throw new Error(payload.detail || `Agent API 请求失败（${response.status}）`);
      }
      setMessages((current) => [...current, { id: userMessageId + 1, role: "assistant", text: payload.answer! }]);
      setIntent(payload.intent || "产品咨询");
      setKnowledgeSource(
        payload.database_used
          ? "企业知识库 · MySQL"
          : payload.sources?.length
            ? payload.sources.map((source) => source.filename).slice(0, 2).join(" · ")
            : "企业知识库",
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : "未知错误";
      setMessages((current) => [
        ...current,
        { id: userMessageId + 1, role: "assistant", text: `暂时无法连接 Agent 服务：${detail}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <main className="cs-page">
      <header className="cs-header">
        <a className="cs-back" href="#home">← 返回首页</a>
        <div className="cs-brand">
          <span className="brand-mark">MA</span>
          <div><b>智能客服 Agent</b><small>Minimum Agent Lab Demo</small></div>
        </div>
        <span className="cs-online"><i /> 服务在线</span>
      </header>

      <section className="cs-shell">
        <div className="cs-intro">
          <div><span>AI CUSTOMER SERVICE</span><h1>让每次咨询，都得到专业回应</h1></div>
          <p>知识问答、需求引导、边界防护、销售转化和多轮记忆，一次体验完整的智能客服 Agent。</p>
        </div>

        <div className="cs-workspace">
          <section className="cs-chat" aria-label="智能客服对话">
            <header>
              <div className="cs-avatar">AI</div>
              <div><b>企业产品顾问</b><small><i /> 在线 · 知识库已连接</small></div>
              <span>会话 #CS-0724</span>
            </header>

            <div className="cs-messages" aria-live="polite">
              {messages.map((message) => (
                <div className={`cs-message ${message.role}`} key={message.id}>
                  <span>{message.role === "assistant" ? "AI" : "你"}</span>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>

            <div className="cs-quick">
              <span>快捷示例</span>
              <div>
                {quickPrompts.map((prompt) => (
                  <button type="button" key={prompt} disabled={sending} onClick={() => void sendMessage(prompt)}>{prompt}</button>
                ))}
              </div>
            </div>

            <form className="cs-composer" onSubmit={submit}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="输入你的问题，例如：你们支持私有化部署吗？"
                aria-label="输入客服问题"
                disabled={sending}
              />
              <button type="submit" disabled={sending}>{sending ? "处理中…" : "发送 →"}</button>
            </form>
          </section>

          <aside className="cs-sidebar">
            <section className="cs-panel cs-product">
              <div className="cs-panel-title"><span>产品预览</span><b>推荐</b></div>
              <div className="cs-product-visual"><span>MA</span><i>Enterprise</i></div>
              <h2>Minimum Agent 企业版</h2>
              <p>适用于需要知识库、会话记忆与安全控制的企业团队。</p>
              <ul>
                <li><span>✓</span> 企业知识库问答</li>
                <li><span>✓</span> 多 Session 记忆隔离</li>
                <li><span>✓</span> 安全边界与审计</li>
              </ul>
              <button type="button" disabled={sending} onClick={() => void sendMessage("帮我推荐适合 1000 人企业的方案")}>咨询企业方案</button>
            </section>

            <section className="cs-panel">
              <div className="cs-panel-title"><span>本次会话</span><small>MEMORY ON</small></div>
              <dl className="cs-facts">
                <div><dt>当前意图</dt><dd>{intent}</dd></div>
                <div><dt>知识来源</dt><dd>{knowledgeSource}</dd></div>
                <div><dt>上下文</dt><dd>{messages.length} 条消息</dd></div>
              </dl>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
