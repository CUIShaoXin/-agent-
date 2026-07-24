"use client";

import { FormEvent, useState } from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const quickPrompts = [
  "这款产品适合什么团队？",
  "你们支持私有化部署吗？",
  "帮我推荐适合 1000 人企业的方案",
  "我想删除数据库",
];

function replyFor(input: string) {
  if (/删除|数据库|密码|密钥/.test(input)) {
    return "这个请求涉及高风险操作，我不能直接执行。可以先帮你确认数据范围、备份状态和审批流程，再提供安全的操作建议。";
  }
  if (/私有化|部署/.test(input)) {
    return "支持私有化部署。通常会先确认并发量、数据隔离、模型接入方式和运维环境，再给出部署清单与实施周期。";
  }
  if (/1000|企业|团队|适合/.test(input)) {
    return "适合中大型团队。针对 1000 人企业，建议采用企业版方案，启用统一知识库、权限分组、多会话记忆和审计日志。";
  }
  return "我可以结合产品知识库继续为你分析。你可以补充使用人数、主要场景和部署偏好，我会给出更准确的建议。";
}

export function CustomerServiceDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "你好，我是 Minimum Agent Lab 智能客服。你可以咨询产品能力、部署方式或企业方案。",
    },
  ]);

  function sendMessage(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: value },
      { id: Date.now() + 1, role: "assistant", text: replyFor(value) },
    ]);
    setInput("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    sendMessage(input);
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
                  <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>
                ))}
              </div>
            </div>

            <form className="cs-composer" onSubmit={submit}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="输入你的问题，例如：你们支持私有化部署吗？"
                aria-label="输入客服问题"
              />
              <button type="submit">发送 →</button>
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
              <button type="button" onClick={() => sendMessage("帮我推荐适合 1000 人企业的方案")}>咨询企业方案</button>
            </section>

            <section className="cs-panel">
              <div className="cs-panel-title"><span>本次会话</span><small>MEMORY ON</small></div>
              <dl className="cs-facts">
                <div><dt>当前意图</dt><dd>产品咨询</dd></div>
                <div><dt>知识来源</dt><dd>产品文档 · FAQ</dd></div>
                <div><dt>上下文</dt><dd>{messages.length} 条消息</dd></div>
              </dl>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
