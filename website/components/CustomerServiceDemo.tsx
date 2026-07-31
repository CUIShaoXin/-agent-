"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AgentRunStatus, AgentTrace } from "./customer-service/AgentTrace";
import { EmbeddingStatus, KnowledgeBasePanel } from "./customer-service/KnowledgeBasePanel";
import { MemoryPanel } from "./customer-service/MemoryPanel";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  sources?: string[];
};

type ChatResponse = {
  answer: string;
  session_id: string;
  intent: string;
  sources: Array<{ filename: string }>;
  database_used: boolean;
};

type KnowledgeUploadResponse = {
  ok: boolean;
  document_id: string;
  filename: string;
  chunks: number;
};

type HealthResponse = {
  status: string;
  knowledge_documents: number;
};

const API_BASE_URL = "http://localhost:8000";

type LoopbackRequestInit = RequestInit & {
  targetAddressSpace?: "loopback";
};

function agentFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    targetAddressSpace: "loopback",
  } as LoopbackRequestInit);
}

const quickPrompts = [
  "SafeVR 支持哪些培训场景？",
  "公司的售后政策是什么？",
  "请总结上传文档中的部署要求",
  "刚才提到的方案有哪些限制？",
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
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("支持 PDF / Markdown");
  const [intent, setIntent] = useState("等待识别");
  const [knowledgeSource, setKnowledgeSource] = useState("企业知识库");
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [embeddingStatus, setEmbeddingStatus] = useState<EmbeddingStatus>("waiting");
  const [retrieverOnline, setRetrieverOnline] = useState(false);
  const [traceStatus, setTraceStatus] = useState<AgentRunStatus>("idle");
  const [traceStep, setTraceStep] = useState(0);
  const [lastQuestion, setLastQuestion] = useState("");
  const [activeSessionId, setActiveSessionId] = useState("");
  const sessionId = useRef("");
  const nextMessageId = useRef(2);
  const traceTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "你好，我是 RAG 智能客服 Agent。请上传企业 PDF 或 Markdown 文档，然后直接向知识库提问。",
    },
  ]);

  useEffect(() => {
    let active = true;
    void agentFetch("/health")
      .then((response) => response.json() as Promise<HealthResponse>)
      .then((payload) => {
        if (!active) return;
        setRetrieverOnline(payload.status === "ok");
        setDocumentCount(payload.knowledge_documents ?? 0);
        if ((payload.knowledge_documents ?? 0) > 0) setEmbeddingStatus("ready");
      })
      .catch(() => {
        if (active) setRetrieverOnline(false);
      });
    return () => {
      active = false;
      if (traceTimer.current) clearInterval(traceTimer.current);
    };
  }, []);

  function stopTraceTimer() {
    if (traceTimer.current) clearInterval(traceTimer.current);
    traceTimer.current = null;
  }

  function startTrace(question: string) {
    stopTraceTimer();
    setLastQuestion(question);
    setTraceStatus("running");
    setTraceStep(0);
    traceTimer.current = setInterval(() => {
      setTraceStep((current) => Math.min(current + 1, 3));
    }, 650);
  }

  async function sendMessage(text: string) {
    const value = text.trim();
    if (!value || sending) return;
    startTrace(value);
    const userMessageId = nextMessageId.current++;
    setMessages((current) => [...current, { id: userMessageId, role: "user", text: value }]);
    setInput("");
    setSending(true);
    try {
      if (!sessionId.current) {
        sessionId.current = getSessionId();
        setActiveSessionId(sessionId.current);
      }
      const response = await agentFetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, session_id: sessionId.current }),
      });
      const payload = await response.json().catch(() => ({})) as Partial<ChatResponse> & { detail?: string };
      if (!response.ok || !payload.answer) {
        throw new Error(payload.detail || `Agent API 请求失败（${response.status}）`);
      }
      const sourceNames = [...new Set((payload.sources || []).map((source) => source.filename))];
      stopTraceTimer();
      setTraceStep(4);
      setTraceStatus("success");
      setMessages((current) => [
        ...current,
        { id: nextMessageId.current++, role: "assistant", text: payload.answer!, sources: sourceNames },
      ]);
      setIntent(payload.intent || "产品咨询");
      setKnowledgeSource(
        payload.database_used
          ? "企业知识库 · MySQL"
          : payload.sources?.length
            ? payload.sources.map((source) => source.filename).slice(0, 2).join(" · ")
            : "企业知识库",
      );
    } catch (error) {
      stopTraceTimer();
      setTraceStatus("failed");
      const isConnectionError = error instanceof TypeError;
      const detail = error instanceof Error ? error.message : "未知错误";
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          role: "assistant",
          text: isConnectionError
            ? "智能客服服务未启动，请启动 FastAPI"
            : `智能客服请求失败：${detail}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  async function uploadKnowledge(file: File) {
    if (uploading) return;
    setUploading(true);
    setEmbeddingStatus("processing");
    setUploadStatus("正在解析并构建向量索引…");
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await agentFetch("/knowledge/upload", {
        method: "POST",
        body: form,
      });
      const payload = await response.json().catch(() => ({})) as Partial<KnowledgeUploadResponse> & { detail?: string };
      if (!response.ok || !payload.ok || !payload.filename || typeof payload.chunks !== "number") {
        throw new Error(payload.detail || `知识库上传失败（${response.status}）`);
      }
      setKnowledgeSource(payload.filename);
      setDocumentCount((current) => (current ?? 0) + 1);
      setEmbeddingStatus("ready");
      setRetrieverOnline(true);
      setUploadStatus(`已建立 ${payload.chunks} 个知识片段`);
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          role: "assistant",
          text: `知识库文件「${payload.filename}」已完成解析和向量索引，现在可以直接提问。`,
        },
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "未知错误";
      setEmbeddingStatus("failed");
      setUploadStatus(`上传失败：${detail}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="cs-page">
      <header className="cs-header">
        <a className="cs-back" href="#home">← 返回首页</a>
        <div className="cs-brand">
          <span className="brand-mark">MA</span>
          <div><b>智能客服 Agent</b><small>Minimum Agent Lab Demo</small></div>
        </div>
        <span className="cs-online"><i /> RAG Runtime Online</span>
      </header>

      <section className="cs-shell">
        <div className="cs-intro">
          <div><span>RAG AGENT PLAYGROUND</span><h1>让企业知识，<br />真正被 Agent 理解</h1></div>
          <p>基于 RAG、Agent Workflow 和多轮记忆，构建面向企业知识库的智能客服系统。<br /><br />支持 PDF、Markdown 文档导入，实现知识检索、智能问答和业务辅助。</p>
        </div>

        <div className="cs-workspace">
          <section className="cs-chat" aria-label="智能客服对话">
            <header>
              <div className="cs-avatar">AI</div>
              <div><b>智能客服 Agent</b><small><i /> Knowledge Base Online</small></div>
              <span>RAG PLAYGROUND</span>
            </header>

            <div className="cs-messages" aria-live="polite">
              {messages.map((message) => (
                <div className={`cs-message ${message.role}`} key={message.id}>
                  <span>{message.role === "assistant" ? "AI" : "你"}</span>
                  <div className="cs-message-content">
                    <p>{message.text}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="cs-message-sources">
                        <small>找到相关文档</small>
                        {message.sources.map((source) => <b key={source}>{source}</b>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="cs-message cs-thinking">
                  <span>AI</span>
                  <div className="cs-message-content"><p>正在检索知识库...</p><small>正在理解问题并召回相关文档</small></div>
                </div>
              )}
            </div>

            <AgentTrace question={lastQuestion} status={traceStatus} activeStep={traceStep} />

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
                placeholder="输入知识库问题，例如：SafeVR 支持哪些培训场景？"
                aria-label="输入客服问题"
                disabled={sending}
              />
              <button type="submit" disabled={sending}>{sending ? "处理中…" : "发送 →"}</button>
            </form>
          </section>

          <aside className="cs-sidebar">
            <KnowledgeBasePanel
              documentCount={documentCount}
              embeddingStatus={embeddingStatus}
              retrieverOnline={retrieverOnline}
              sourceLabel={knowledgeSource}
              uploadStatus={uploadStatus}
              disabled={uploading || sending}
              onUpload={(file) => void uploadKnowledge(file)}
            />
            <MemoryPanel
              sessionId={activeSessionId}
              turns={messages.filter((message) => message.role === "user").length}
              messageCount={messages.length}
              intent={intent}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
