interface SessionPageFrameProps {
  sessionNumber: number;
}

const sessionTitles = [
  "Agent 基础认知",
  "Agent Loop",
  "Tool Calling",
  "Memory",
  "Context Compression",
  "Execution Trace",
];

export function SessionPageFrame({ sessionNumber }: SessionPageFrameProps) {
  const safeNumber = Math.min(6, Math.max(1, sessionNumber));
  const title = sessionTitles[safeNumber - 1];

  return (
    <main className="session-frame-page">
      <header className="course-map-header shell">
        <a className="brand" href="#course"><span className="brand-mark">MA</span><span>Minimum Agent Lab</span></a>
        <span>SESSION-{safeNumber}</span>
        <a href="#course">← 课程地图</a>
      </header>
      <section className="session-frame shell">
        <div className="session-frame-heading"><span className="section-no">SESSION-{safeNumber} / COURSE FRAME</span><h1>{title}</h1><p>课程页面框架已经创建，具体教学内容将在后续迭代中逐步补充。</p></div>
        <div className="session-frame-grid">
          <article><span>01</span><h2>教学内容</h2><p>概念讲解与核心知识区域</p><i>CONTENT PLACEHOLDER</i></article>
          <article><span>02</span><h2>可视化流程</h2><p>Agent 运行过程展示区域</p><i>VISUAL PLACEHOLDER</i></article>
          <article><span>03</span><h2>互动练习</h2><p>选择题、按钮和模拟操作区域</p><i>INTERACTION PLACEHOLDER</i></article>
        </div>
        <div className="session-frame-actions"><a href="#course">← 返回课程地图</a>{safeNumber < 6 && <a href={`#session-${safeNumber + 1}`}>下一个 Session →</a>}</div>
      </section>
    </main>
  );
}
