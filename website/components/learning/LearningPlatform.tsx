"use client";

import { useEffect, useRef, useState } from "react";

type SessionId = "foundation" | "loop" | "tools" | "memory" | "compression" | "trace" | "final";

interface LearningSession {
  id: SessionId;
  number: string;
  title: string;
  eyebrow: string;
  summary: string;
  concepts: string[];
}

interface LoopStage {
  name: string;
  detail: string;
}

interface TraceRow {
  id: string;
  event: string;
  status: "success" | "running";
  duration: string;
  detail: string;
}

const sessions: LearningSession[] = [
  { id: "foundation", number: "01", title: "Agent 基础认知", eyebrow: "FOUNDATION", summary: "先分清一次性生成文本的 LLM，与能够观察、决策、行动的 Agent。", concepts: ["LLM 是推理引擎", "Agent 是带循环的系统", "工具让模型影响外部世界"] },
  { id: "loop", number: "02", title: "Agent Loop", eyebrow: "THE LOOP", summary: "把输入、决策、工具结果和最终答案串成一个可控、可停止的循环。", concepts: ["每轮只做一次决策", "工具结果回填为 Observation", "max_steps 防止无限循环"] },
  { id: "tools", number: "03", title: "Tool Calling", eyebrow: "TOOLS", summary: "用名称、描述和参数 Schema 注册工具，让模型自主选择能力。", concepts: ["Schema 是能力说明书", "Runtime 负责校验与分发", "错误也要成为 Observation"] },
  { id: "memory", number: "04", title: "Memory", eyebrow: "MEMORY", summary: "使用 user_id 与 session_id 隔离会话，让不同窗口拥有独立记忆。", concepts: ["短期记忆保留近期原文", "Session 必须严格隔离", "持久化后才能随时继续"] },
  { id: "compression", number: "05", title: "Context Compression", eyebrow: "CONTEXT", summary: "保留近期消息，将较早内容压缩为摘要，在连续对话中控制上下文长度。", concepts: ["重要事实不能丢", "旧消息转为结构化摘要", "摘要与近期原文一起召回"] },
  { id: "trace", number: "06", title: "Execution Trace", eyebrow: "OBSERVABILITY", summary: "记录每一步输入、输出、状态和耗时，让 Agent 的行为可解释、可调试。", concepts: ["每次运行拥有 run_id", "工具调用需要输入与结果", "异常必须定位到具体步骤"] },
  { id: "final", number: "07", title: "Final Project", eyebrow: "SHIP IT", summary: "把 Loop、Tools、Memory、Context 与 Trace 组合成一个真实 RAG 智能客服 Agent。", concepts: ["上传企业知识库", "检索增强问答", "完整 Agent 执行链"] },
];

const loopStages: LoopStage[] = [
  { name: "Thinking", detail: "模型理解任务，判断需要天气与待办工具。" },
  { name: "Tool Call", detail: "调用 weather(city=深圳) 与 todo(action=add)。" },
  { name: "Observation", detail: "天气：阵雨 31°C；待办：下班带伞已保存。" },
  { name: "Final Answer", detail: "深圳今天有阵雨，已帮你记下下班带伞。" },
];

const toolOptions = [
  { id: "calculator", name: "calculator", description: "安全计算数值表达式", schema: "{ expression: string }" },
  { id: "search", name: "search", description: "检索公开资料", schema: "{ query: string }" },
  { id: "weather", name: "weather", description: "查询城市天气", schema: "{ city: string }" },
  { id: "todo", name: "todo", description: "添加或读取待办", schema: "{ action, content? }" },
];

const traceRows: TraceRow[] = [
  { id: "01", event: "run_start", status: "success", duration: "2ms", detail: "载入 user-a / window-1 的近期上下文。" },
  { id: "02", event: "llm_decision", status: "success", duration: "428ms", detail: "模型选择 weather 与 todo 两个工具。" },
  { id: "03", event: "tool_result", status: "success", duration: "86ms", detail: "两个工具均返回 ok=true 的结构化结果。" },
  { id: "04", event: "final_answer", status: "success", duration: "311ms", detail: "最终答案写入 Session Memory。" },
];

export function LearningPlatform() {
  const [activeId, setActiveId] = useState<SessionId>("foundation");
  const [quizAnswer, setQuizAnswer] = useState<"llm" | "agent" | null>(null);
  const [loopInput, setLoopInput] = useState("查深圳天气，并记下下班带伞");
  const [loopStep, setLoopStep] = useState(-1);
  const [loopRunning, setLoopRunning] = useState(false);
  const loopTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [enabledTools, setEnabledTools] = useState(["weather", "todo"]);
  const [toolTask, setToolTask] = useState("查杭州天气并提醒我带伞");
  const [toolResult, setToolResult] = useState("等待 Runtime 分发工具");
  const [memoryWindow, setMemoryWindow] = useState<"window-1" | "window-2">("window-1");
  const [memoryAdded, setMemoryAdded] = useState({ "window-1": 0, "window-2": 0 });
  const [compressed, setCompressed] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState(traceRows[0]);

  const activeSession = sessions.find((session) => session.id === activeId) || sessions[0];

  useEffect(() => () => {
    if (loopTimer.current) clearInterval(loopTimer.current);
  }, []);

  function runLoop() {
    if (loopTimer.current) clearInterval(loopTimer.current);
    setLoopStep(0);
    setLoopRunning(true);
    let next = 0;
    loopTimer.current = setInterval(() => {
      next += 1;
      setLoopStep(next);
      if (next >= loopStages.length - 1) {
        if (loopTimer.current) clearInterval(loopTimer.current);
        loopTimer.current = null;
        setLoopRunning(false);
      }
    }, 780);
  }

  function toggleTool(toolId: string) {
    setEnabledTools((current) => current.includes(toolId) ? current.filter((id) => id !== toolId) : [...current, toolId]);
  }

  function dispatchTools() {
    const requested = [
      toolTask.match(/天气|气温/) ? "weather" : "",
      toolTask.match(/提醒|待办|记下/) ? "todo" : "",
      toolTask.match(/计算|加|乘/) ? "calculator" : "",
      toolTask.match(/搜索|资料/) ? "search" : "",
    ].filter(Boolean);
    const available = requested.filter((id) => enabledTools.includes(id));
    setToolResult(available.length ? `已分发：${available.join(" + ")} · arguments 校验通过` : "没有匹配到已启用工具，模型将直接回答或请求补充能力。 ");
  }

  function addMemory() {
    setMemoryAdded((current) => ({ ...current, [memoryWindow]: current[memoryWindow] + 1 }));
  }

  return (
    <section className="section shell learning-platform" id="learn">
      <div className="section-heading">
        <div><span className="section-no">01 / INTERACTIVE COURSE</span><h2>六个 Session，边学边构建 Agent</h2></div>
        <p>选择章节，先理解概念，再操作对应实验。每一步都映射到仓库里的真实 Runtime 实现。</p>
      </div>

      <div className="course-shell">
        <nav className="course-nav" aria-label="Agent 学习章节">
          <div className="course-progress"><span>学习进度</span><b>{sessions.findIndex((item) => item.id === activeId) + 1} / 7</b><i><em style={{ width: `${((sessions.findIndex((item) => item.id === activeId) + 1) / 7) * 100}%` }} /></i></div>
          {sessions.map((session) => (
            <button key={session.id} className={activeId === session.id ? "active" : ""} onClick={() => setActiveId(session.id)}>
              <span>{session.number}</span><div><b>{session.id === "final" ? session.title : `Session-${Number(session.number)} ${session.title}`}</b><small>{session.eyebrow}</small></div><i>→</i>
            </button>
          ))}
        </nav>

        <div className="course-stage">
          <header className="course-stage-header">
            <div><span>{activeSession.eyebrow}</span><h3>{activeSession.id === "final" ? activeSession.title : `Session-${Number(activeSession.number)} · ${activeSession.title}`}</h3></div>
            <b>INTERACTIVE</b>
          </header>

          <article className="course-theory">
            <span>教学内容</span><p>{activeSession.summary}</p>
            <ul>{activeSession.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul>
          </article>

          {activeId === "foundation" && (
            <div className="course-lab-grid">
              <section className="course-visual">
                <div className="course-block-title"><span>可视化流程</span><small>LLM VS AGENT</small></div>
                <div className="compare-flow">
                  <div><b>普通 LLM</b><span>Prompt</span><i>→</i><span>Text</span><small>一次输入，一次输出</small></div>
                  <div className="agent"><b>Agent</b><span>Goal</span><i>→</i><span>Think</span><i>→</i><span>Act</span><i>↻</i><small>观察环境，循环到任务完成</small></div>
                </div>
              </section>
              <section className="course-interaction">
                <div className="course-block-title"><span>选择题</span><small>TRY IT</small></div>
                <p>“查天气并把带伞加入待办”更适合交给谁？</p>
                <div className="choice-row"><button onClick={() => setQuizAnswer("llm")} className={quizAnswer === "llm" ? "selected" : ""}>普通 LLM</button><button onClick={() => setQuizAnswer("agent")} className={quizAnswer === "agent" ? "selected" : ""}>Agent</button></div>
                {quizAnswer && <div className={`course-feedback ${quizAnswer === "agent" ? "correct" : "wrong"}`}>{quizAnswer === "agent" ? "回答正确：任务需要调用两个工具并检查结果。" : "再想想：普通 LLM 只能生成文本，不能真正写入待办。"}</div>}
              </section>
            </div>
          )}

          {activeId === "loop" && (
            <div className="course-lab-grid">
              <section className="course-visual">
                <div className="course-block-title"><span>Agent Loop 模拟器</span><small>{loopRunning ? "RUNNING" : "READY"}</small></div>
                <div className="loop-simulator">
                  {loopStages.map((stage, index) => <div key={stage.name} className={loopStep > index ? "done" : loopStep === index ? "running" : ""}><i>{index + 1}</i><span><b>{stage.name}</b><small>{stage.detail}</small></span></div>)}
                </div>
              </section>
              <section className="course-interaction">
                <div className="course-block-title"><span>输入任务</span><small>RUN LOOP</small></div>
                <textarea value={loopInput} onChange={(event) => setLoopInput(event.target.value)} aria-label="Agent Loop 任务" />
                <button className="course-action" onClick={runLoop} disabled={loopRunning || !loopInput.trim()}>{loopRunning ? "Agent 运行中…" : "运行 Agent Loop →"}</button>
              </section>
            </div>
          )}

          {activeId === "tools" && (
            <div className="course-lab-grid">
              <section className="course-visual">
                <div className="course-block-title"><span>Tool Registry</span><small>{enabledTools.length} ENABLED</small></div>
                <div className="tool-registry">{toolOptions.map((tool) => <button key={tool.id} className={enabledTools.includes(tool.id) ? "enabled" : ""} onClick={() => toggleTool(tool.id)}><i>{enabledTools.includes(tool.id) ? "✓" : "+"}</i><span><b>{tool.name}</b><small>{tool.description}</small><code>{tool.schema}</code></span></button>)}</div>
              </section>
              <section className="course-interaction">
                <div className="course-block-title"><span>工具分发体验</span><small>SCHEMA FIRST</small></div>
                <input value={toolTask} onChange={(event) => setToolTask(event.target.value)} aria-label="工具调用任务" />
                <button className="course-action" onClick={dispatchTools}>让 Runtime 选择工具 →</button>
                <div className="tool-result">{toolResult}</div>
              </section>
            </div>
          )}

          {activeId === "memory" && (
            <div className="course-lab-grid">
              <section className="course-visual">
                <div className="course-block-title"><span>Session Memory</span><small>ISOLATED</small></div>
                <div className="memory-demo-tabs"><button className={memoryWindow === "window-1" ? "active" : ""} onClick={() => setMemoryWindow("window-1")}>Window 1</button><button className={memoryWindow === "window-2" ? "active" : ""} onClick={() => setMemoryWindow("window-2")}>Window 2</button></div>
                <div className="memory-demo-card"><span>USER A / {memoryWindow}</span><b>{memoryWindow === "window-1" ? "天气与出行计划" : "周报与工作计划"}</b><p>{memoryWindow === "window-1" ? "深圳有阵雨 · 下班带伞" : "本周完成 Agent Loop · 周五提交周报"}</p><small>{2 + memoryAdded[memoryWindow]} 条记忆 · 与另一窗口完全隔离</small></div>
              </section>
              <section className="course-interaction">
                <div className="course-block-title"><span>记忆实验</span><small>USER + SESSION</small></div>
                <p>当前正在向 <b>{memoryWindow}</b> 写入记忆。切换窗口后，内容不会串线。</p>
                <button className="course-action" onClick={addMemory}>向当前 Session 写入一条记忆</button>
                <div className="memory-key"><code>key = user-a:{memoryWindow}</code><span>SQLite checkpoint</span></div>
              </section>
            </div>
          )}

          {activeId === "compression" && (
            <div className="course-lab-grid">
              <section className="course-visual">
                <div className="course-block-title"><span>压缩前后对比</span><small>{compressed ? "420 TOKENS" : "1,840 TOKENS"}</small></div>
                <div className={`context-stack ${compressed ? "compressed" : ""}`}>
                  {compressed ? <><div className="summary"><b>SESSION SUMMARY</b><p>用户在深圳，关注天气；已创建“下班带伞”待办；偏好简洁回答。</p></div><div><b>RECENT</b><p>用户：明天还需要带伞吗？</p></div></> : ["用户询问深圳天气", "Agent 调用 weather", "工具返回阵雨 31°C", "用户要求记下带伞", "Agent 调用 todo", "待办写入成功", "用户追问明天情况"].map((text) => <div key={text}><span>{text}</span></div>)}
                </div>
              </section>
              <section className="course-interaction">
                <div className="course-block-title"><span>Context 操作</span><small>KEEP SIGNAL</small></div>
                <p>压缩不会简单删除历史，而是提取事实、状态和用户偏好，再保留近期原文。</p>
                <button className="course-action" onClick={() => setCompressed((value) => !value)}>{compressed ? "查看压缩前" : "执行 Context Compression →"}</button>
                <div className="compression-meter"><span style={{ width: compressed ? "23%" : "100%" }} /><b>{compressed ? "上下文减少 77%" : "上下文接近阈值"}</b></div>
              </section>
            </div>
          )}

          {activeId === "trace" && (
            <div className="course-lab-grid">
              <section className="course-visual">
                <div className="course-block-title"><span>Agent Trace 查看器</span><small>RUN #A-0726</small></div>
                <div className="trace-viewer">{traceRows.map((row) => <button key={row.id} className={selectedTrace.id === row.id ? "active" : ""} onClick={() => setSelectedTrace(row)}><i>{row.id}</i><span><b>{row.event}</b><small>{row.status}</small></span><code>{row.duration}</code></button>)}</div>
              </section>
              <section className="course-interaction trace-detail">
                <div className="course-block-title"><span>步骤详情</span><small>INSPECT</small></div>
                <span>EVENT</span><h4>{selectedTrace.event}</h4><p>{selectedTrace.detail}</p>
                <dl><div><dt>status</dt><dd>{selectedTrace.status}</dd></div><div><dt>duration</dt><dd>{selectedTrace.duration}</dd></div><div><dt>run_id</dt><dd>A-0726</dd></div></dl>
              </section>
            </div>
          )}

          {activeId === "final" && (
            <div className="final-project-card">
              <div><span>FINAL PROJECT</span><h3>构建一个 RAG 智能客服 Agent</h3><p>上传 PDF / Markdown 企业资料，观察 Intent、Retriever、LLM、Guard 的完整执行链，并通过 Session Memory 继续追问。</p><ul><li>真实知识库上传</li><li>RAG 检索增强回答</li><li>Agent Trace 与多轮记忆</li></ul></div>
              <div className="final-project-flow"><span>Document</span><i>→</i><span>Embedding</span><i>→</i><span>Retriever</span><i>→</i><span>Answer</span></div>
              <a href="#customer-service">进入 Final Project <span>→</span></a>
            </div>
          )}

          <footer className="course-footer">
            <span>SESSION {activeSession.number} / 07</span>
            {activeId !== "final" && <button onClick={() => setActiveId(sessions[Math.min(sessions.findIndex((item) => item.id === activeId) + 1, sessions.length - 1)].id)}>下一章节 →</button>}
          </footer>
        </div>
      </div>
    </section>
  );
}
