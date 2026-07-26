"use client";

import { useEffect, useRef, useState } from "react";
import { CustomerServiceDemo } from "../components/CustomerServiceDemo";

const loopSteps = [
  { number: "01", label: "接收输入", detail: "保存用户消息，并用 user_id + session_id 召回当前窗口的记忆。" },
  { number: "02", label: "LLM 决策", detail: "把上下文与工具 Schema 发给模型，由模型决定直接回答还是调用工具。" },
  { number: "03", label: "执行工具", detail: "ToolRegistry 根据名称分发，捕获异常并产出结构化 observation。" },
  { number: "04", label: "继续或结束", detail: "工具结果回填给模型；得到 final answer 时结束，否则进入下一轮。" },
];

const lessons = [
  {
    no: "01",
    eyebrow: "The Loop",
    title: "先让 Agent 跑起来",
    text: "用一个清晰的 for loop 串起输入、决策、工具与最终答案。没有魔法，只有可读的控制流。",
    tags: ["max_steps", "停止条件", "异常边界"],
    tone: "violet",
  },
  {
    no: "02",
    eyebrow: "Tool Calling",
    title: "把能力装进注册表",
    text: "每个工具都拥有名称、描述、JSON Schema 和 handler，模型只看 Schema 就能自主选择。",
    tags: ["calculator", "search", "weather", "todo"],
    tone: "orange",
  },
  {
    no: "03",
    eyebrow: "Memory",
    title: "让每个窗口拥有自己的记忆",
    text: "SQLite 以 user_id + session_id 隔离消息、待办和摘要，窗口之间不串线，随时可以继续聊。",
    tags: ["SQLite", "session", "多轮追问"],
    tone: "green",
  },
  {
    no: "04",
    eyebrow: "Context",
    title: "只把有用的信息给模型",
    text: "保留近期原文，将更早的对话压缩成 session summary，控制成本同时保留关键状态。",
    tags: ["召回", "压缩", "tool observation"],
    tone: "blue",
  },
];

const codeSamples: Record<string, string> = {
  runtime: `for step in range(1, max_steps + 1):
    turn = llm.complete(context, continuation, tools.schemas())

    if turn.tool_calls:
        for call in turn.tool_calls:
            result = tools.execute(call.name, call.arguments, tool_context)
            continuation.append(tool_output(call.call_id, result))
        continue

    if turn.final_answer:
        return turn.final_answer`,
  tool: `registry.register(Tool(
    name="calculator",
    description="Evaluate a numeric expression safely.",
    parameters={
        "type": "object",
        "properties": {"expression": {"type": "string"}},
        "required": ["expression"]
    },
    handler=calculator,
))`,
  memory: `context = [
    {"role": "developer", "content": session.summary},
    *recent_messages,
]

# old messages → deterministic summary
store.compact(user_id, session_id, keep_recent=12)`,
};

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeFile, setActiveFile] = useState("runtime");
  const [route, setRoute] = useState<"home" | "customer-service">("home");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const syncRoute = () => {
      setRoute(window.location.hash === "#customer-service" ? "customer-service" : "home");
    };
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function runDemo() {
    if (timer.current) clearInterval(timer.current);
    setActiveStep(0);
    setRunning(true);
    let next = 0;
    timer.current = setInterval(() => {
      next += 1;
      if (next >= loopSteps.length) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setRunning(false);
        return;
      }
      setActiveStep(next);
    }, 900);
  }

  if (route === "customer-service") {
    return <CustomerServiceDemo />;
  }

  return (
    <main>
      <nav className="nav shell" aria-label="主导航">
        <a className="brand" href="#top" aria-label="Minimum Agent Lab 首页">
          <span className="brand-mark">MA</span>
          <span>Minimum Agent Lab</span>
        </a>
        <div className="nav-links">
          <a href="#learn">学习路径</a>
          <a href="#lab">Loop 实验室</a>
          <a href="#code">代码导读</a>
          <a href="#customer-service">Agent实战项目</a>
        </div>
        <a className="nav-github" href="https://github.com/CUIShaoXin/-agent-" target="_blank" rel="noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="kicker"><span>OPEN SOURCE</span> · Python · Responses API</div>
          <h1>从零实现一个<em>最小可用 Agent</em></h1>
          <p className="hero-lead">
            不依赖 LangGraph 或任何 Agent 框架。从一个可读的 Loop 出发，亲手实现工具调用、Session 记忆、Context 压缩与 Trace。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#learn">开始学习 <span>→</span></a>
            <a className="button secondary" href="https://github.com/CUIShaoXin/-agent-" target="_blank" rel="noreferrer">查看源码</a>
          </div>
          <dl className="hero-stats">
            <div><dt>4</dt><dd>内置工具</dd></div>
            <div><dt>13</dt><dd>测试用例</dd></div>
            <div><dt>0</dt><dd>Agent 框架</dd></div>
          </dl>
        </div>

        <div className="runtime-card" aria-label="Agent Runtime 架构预览">
          <div className="runtime-topbar">
            <div className="window-dots"><i /><i /><i /></div>
            <span>runtime.py</span>
            <b>LIVE</b>
          </div>
          <div className="runtime-flow">
            <div className="flow-node user-node"><span>USER</span><strong>“查深圳天气，<br />并记下下班带伞”</strong></div>
            <div className="flow-connector"><span>context</span></div>
            <div className="flow-node brain-node"><span>LLM DECISION</span><strong>weather + todo</strong><small>tool_choice: auto</small></div>
            <div className="tool-row">
              <div className="mini-tool"><b>☀</b><span>weather</span><small>阵雨 · 31°C</small></div>
              <div className="mini-tool"><b>✓</b><span>todo</span><small>已添加 #12</small></div>
            </div>
            <div className="flow-result"><span className="pulse-dot" /> final_answer ready</div>
          </div>
          <div className="runtime-note">A tiny runtime you can read in one sitting.</div>
        </div>
      </section>

      <section className="ticker" aria-label="项目能力">
        <div>
          <span>Agent Loop</span><i>✦</i><span>Tool Schema</span><i>✦</i><span>Session Memory</span><i>✦</i>
          <span>Context Compression</span><i>✦</i><span>Execution Trace</span><i>✦</i><span>Testable by Design</span>
        </div>
      </section>

      <section className="section shell" id="learn">
        <div className="section-heading">
          <div><span className="section-no">01 / LEARNING PATH</span><h2>四块积木，搭出你的 Agent</h2></div>
          <p>每个模块都对应仓库中的真实实现。先理解边界，再进入代码。</p>
        </div>
        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <article className={`lesson-card ${lesson.tone}`} key={lesson.no}>
              <div className="lesson-visual">
                <span className="lesson-number">{lesson.no}</span>
                {lesson.no === "01" && <div className="orbit"><i /><i /><i /><b>LOOP</b></div>}
                {lesson.no === "02" && <div className="schema-stack"><i>name</i><i>description</i><i>parameters</i></div>}
                {lesson.no === "03" && <div className="session-windows"><i>window_1</i><i>window_2</i></div>}
                {lesson.no === "04" && <div className="context-bars"><i /><i /><i /><i /></div>}
              </div>
              <div className="lesson-content">
                <span className="lesson-eyebrow">{lesson.eyebrow}</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.text}</p>
                <div className="tag-row">{lesson.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-section" id="lab">
        <div className="shell">
          <div className="section-heading inverse">
            <div><span className="section-no">02 / INTERACTIVE LAB</span><h2>亲手跑一遍 Agent Loop</h2></div>
            <p>点击步骤查看每一轮发生了什么，或让演示自动运行。</p>
          </div>
          <div className="lab-grid">
            <div className="step-list" role="tablist" aria-label="Agent Loop 步骤">
              {loopSteps.map((step, index) => (
                <button
                  key={step.number}
                  className={activeStep === index ? "active" : ""}
                  onClick={() => { setActiveStep(index); setRunning(false); }}
                  role="tab"
                  aria-selected={activeStep === index}
                >
                  <span>{step.number}</span><strong>{step.label}</strong><i>→</i>
                </button>
              ))}
            </div>
            <div className="lab-console">
              <div className="console-header"><span>agent-trace.json</span><b>{running ? "RUNNING" : "READY"}</b></div>
              <div className="console-body">
                <p className="console-muted"># step {loopSteps[activeStep].number}</p>
                <h3>{loopSteps[activeStep].label}</h3>
                <p>{loopSteps[activeStep].detail}</p>
                <div className="trace-line">
                  <span>{new Date(2026, 6, 24, 10, 32, activeStep * 2).toLocaleTimeString("zh-CN", { hour12: false })}</span>
                  <b>{["run_start", "llm_response", "tool_result", "run_end"][activeStep]}</b>
                  <code>{["session=window-1", "calls=[weather,todo]", "ok=true", "answer_saved=true"][activeStep]}</code>
                </div>
                <div className="progress-track"><i style={{ width: `${((activeStep + 1) / loopSteps.length) * 100}%` }} /></div>
                <button className="run-button" onClick={runDemo} disabled={running}>
                  <span>{running ? "●" : "▶"}</span> {running ? "正在运行…" : "运行完整演示"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell code-section" id="code">
        <div className="section-heading">
          <div><span className="section-no">03 / CODE WALKTHROUGH</span><h2>核心代码，少到可以逐行读懂</h2></div>
          <p>切换文件片段，理解 Runtime、工具注册和 Memory 如何配合。</p>
        </div>
        <div className="code-browser">
          <div className="file-tabs" role="tablist" aria-label="代码文件">
            {[
              ["runtime", "runtime.py", "循环与停止"],
              ["tool", "tools.py", "Schema 与分发"],
              ["memory", "storage.py", "Session 与压缩"],
            ].map(([id, name, desc]) => (
              <button key={id} className={activeFile === id ? "active" : ""} onClick={() => setActiveFile(id)} role="tab" aria-selected={activeFile === id}>
                <span>{name}</span><small>{desc}</small>
              </button>
            ))}
            <a href="https://github.com/CUIShaoXin/-agent-" target="_blank" rel="noreferrer">打开仓库 ↗</a>
          </div>
          <pre><code>{codeSamples[activeFile]}</code></pre>
          <div className="code-caption">
            <span>为什么不使用框架？</span>
            <p>因为学习 Agent 最快的方式，是先看见它最小、最真实的控制流。理解之后，再选择框架才不会被抽象牵着走。</p>
          </div>
        </div>
      </section>

      <section className="memory-section">
        <div className="shell memory-grid">
          <div className="memory-copy">
            <span className="section-no">04 / MEMORY MAP</span>
            <h2>记住该记的，忘掉该忘的</h2>
            <p>每次对话开始时，Runtime 只召回当前 Session 的摘要与近期消息；工具结果以 observation 进入上下文，隐藏思维链不会被保存。</p>
            <ul>
              <li><b>隔离</b><span>user_id + session_id 双键</span></li>
              <li><b>召回</b><span>summary + recent messages</span></li>
              <li><b>压缩</b><span>旧消息 → 4000 字符摘要</span></li>
              <li><b>追踪</b><span>每次请求与工具结果写入 trace</span></li>
            </ul>
          </div>
          <div className="memory-map" aria-label="Session memory 隔离示意图">
            <div className="map-user">USER A</div>
            <div className="map-line" />
            <div className="map-session one"><span>WINDOW 1</span><b>天气 + 带伞待办</b><small>summary · 8 messages</small></div>
            <div className="map-session two"><span>WINDOW 2</span><b>周报 + 工作待办</b><small>summary · 5 messages</small></div>
            <div className="map-lock">Sessions never leak into each other</div>
          </div>
        </div>
      </section>

      <section className="section shell test-section">
        <div className="test-card">
          <div>
            <span className="section-no">05 / VERIFY EVERYTHING</span>
            <h2>一个 Agent，必须可测试</h2>
            <p>ScriptedLLM 让测试不依赖网络；真实 API 集成测试则按需开启。直接回答、工具循环、异常恢复、窗口隔离与 Context 压缩都有覆盖。</p>
            <div className="test-badges"><span>12 passed</span><span>1 opt-in API test</span><span>0 failures</span></div>
          </div>
          <div className="test-terminal">
            <div><i /><i /><i /><span>powershell</span></div>
            <code><b>$</b> python -m unittest discover -s tests -v</code>
            <code className="dim">test_direct_answer ............ <em>ok</em></code>
            <code className="dim">test_tool_loop ................ <em>ok</em></code>
            <code className="dim">test_session_isolation ........ <em>ok</em></code>
            <code className="dim">test_context_compaction ....... <em>ok</em></code>
            <code className="success">Ran 13 tests · OK</code>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="shell cta-inner">
          <span className="cta-star">✦</span><p>READY TO BUILD?</p><h2>读完原理，然后亲手跑起来。</h2>
          <div>
            <a className="button light" href="https://github.com/CUIShaoXin/-agent-" target="_blank" rel="noreferrer">获取完整代码 <span>↗</span></a>
            <a className="text-link" href="#top">回到顶部 ↑</a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand"><span className="brand-mark">MA</span><span>Minimum Agent Lab</span></div>
        <p>Built for learners who want to see how agents really work.</p>
        <a href="https://github.com/CUIShaoXin/-agent-" target="_blank" rel="noreferrer">CUIShaoXin / -agent- ↗</a>
      </footer>
    </main>
  );
}
