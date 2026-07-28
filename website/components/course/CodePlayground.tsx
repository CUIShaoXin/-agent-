"use client";

import { useEffect, useRef, useState } from "react";

interface CodePlaygroundProps {
  code: string;
  result: string[];
  eyebrow?: string;
}

export function CodePlayground({ code, result, eyebrow = "04 / 代码示例" }: CodePlaygroundProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function run() {
    if (timer.current) clearInterval(timer.current);
    setVisibleLines(1);
    let next = 1;
    timer.current = setInterval(() => {
      next += 1;
      setVisibleLines(Math.min(next, result.length));
      if (next >= result.length) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
      }
    }, 430);
  }

  return (
    <section className="lesson-module code-playground-module">
      <header><div><span>{eyebrow}</span><h2>代码演练</h2></div><button type="button" onClick={run}>▶ 运行示例</button></header>
      <div className="playground-grid">
        <div className="playground-code"><div><i /><i /><i /><span>agent.py</span></div><pre><code>{code}</code></pre></div>
        <div className="playground-output" aria-live="polite">
          <span>EXECUTION OUTPUT</span>
          {visibleLines === 0 && <p className="empty">点击运行，观察 Agent 的执行过程。</p>}
          {result.slice(0, visibleLines).map((line, index) => <p key={line}><b>{String(index + 1).padStart(2, "0")}</b>{line}</p>)}
        </div>
      </div>
    </section>
  );
}
