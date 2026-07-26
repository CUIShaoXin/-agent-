interface CourseModule {
  number: string;
  title: string;
  description: string;
  topics: string[];
  href: string;
  accent: string;
}

const courseModules: CourseModule[] = [
  { number: "01", title: "Agent 基础认知", description: "介绍 Agent 与普通 LLM 的区别，理解智能体如何从生成文本走向自主行动。", topics: ["Reasoning", "Action", "Observation"], href: "#session-1", accent: "violet" },
  { number: "02", title: "Agent Loop", description: "学习 Agent 核心循环，理解每一轮决策如何连接工具与最终答案。", topics: ["Think", "Action", "Observation", "Answer"], href: "#session-2", accent: "orange" },
  { number: "03", title: "Tool Calling", description: "学习如何描述、注册和执行工具，让模型基于 Schema 自主选择能力。", topics: ["Tool Schema", "Function Calling", "Registry"], href: "#session-3", accent: "blue" },
  { number: "04", title: "Memory", description: "理解 Session Memory、上下文管理与长期记忆如何支持连续对话。", topics: ["Session", "Context", "Long Memory"], href: "#session-4", accent: "green" },
  { number: "05", title: "Context Compression", description: "认识 Token 限制，学习在保留关键状态的同时压缩历史消息。", topics: ["Token Limit", "Summary", "Recall"], href: "#session-5", accent: "rose" },
  { number: "06", title: "Execution Trace", description: "学习查看 Agent 运行轨迹、状态变化与异常信息，建立 Debug 能力。", topics: ["Trace", "Status", "Debug"], href: "#session-6", accent: "indigo" },
];

export function CourseMapPage() {
  return (
    <main className="course-map-page">
      <header className="course-map-header shell">
        <a className="brand" href="#home" aria-label="返回 Minimum Agent Lab 首页"><span className="brand-mark">MA</span><span>Minimum Agent Lab</span></a>
        <span>AGENT COURSE MAP</span>
        <a href="#home">返回首页 ↑</a>
      </header>

      <section className="course-map-hero shell">
        <div>
          <span className="section-no">LEARNING ROADMAP / 2026</span>
          <h1>六个 Session，<br /><em>边学边构建 Agent</em></h1>
          <p>选择章节学习，从 Agent 基础概念到完整智能体开发。</p>
        </div>
        <div className="course-map-progress" aria-label="课程完成进度">
          <div><span>YOUR PROGRESS</span><b>0 / 6</b></div>
          <i><em /></i>
          <p>0 / 6 Session Completed</p>
        </div>
      </section>

      <section className="course-map-grid shell" aria-label="Agent 学习模块">
        {courseModules.map((module) => (
          <a className={`course-map-card ${module.accent}`} href={module.href} key={module.number}>
            <div className="course-map-card-top"><span>SESSION-{Number(module.number)}</span><b>{module.number}</b></div>
            <div className="course-map-symbol"><i /><i /><i /><strong>{module.number}</strong></div>
            <div className="course-map-card-copy">
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <div>{module.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
            </div>
            <footer><span>开始学习</span><b>→</b></footer>
          </a>
        ))}
      </section>

      <section className="course-final shell">
        <div><span>FINAL PROJECT</span><h2>智能客服 Agent Demo</h2><p>完成六个 Session 后，将所有能力组合成一个可以上传知识库、检索回答并保存多轮记忆的真实 Agent。</p></div>
        <div className="course-final-path"><span>Loop</span><i>→</i><span>Tools</span><i>→</i><span>Memory</span><i>→</i><span>RAG Agent</span></div>
        <a href="#customer-service">进入实战项目 <span>→</span></a>
      </section>

      <footer className="course-map-footer shell"><span>Minimum Agent Lab · Course Map</span><a href="#home">返回首页</a></footer>
    </main>
  );
}
