"use client";

import { useEffect, useRef, useState } from "react";

interface TraceViewerProps {
  stages: string[];
}

export function TraceViewer({ stages }: TraceViewerProps) {
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function runTrace() {
    if (timer.current) clearInterval(timer.current);
    setActive(0);
    setRunning(true);
    let next = 0;
    timer.current = setInterval(() => {
      next += 1;
      setActive(next);
      if (next >= stages.length - 1) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setRunning(false);
      }
    }, 520);
  }

  return (
    <section className="lesson-module trace-viewer-module">
      <header><div><span>04 / EXECUTION TRACE</span><h2>运行轨迹</h2></div><button type="button" onClick={runTrace} disabled={running}>{running ? "运行中…" : "运行 Trace"}</button></header>
      <div className="learning-trace">
        {stages.map((stage, index) => {
          const status = active > index ? "success" : active === index ? "running" : "pending";
          return (
            <div className={`learning-trace-node ${status}`} key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><b>{stage}</b><small>{status === "success" ? `${80 + index * 47}ms · success` : status}</small></div>
              <i>{status === "success" ? "✓" : status === "running" ? "●" : "○"}</i>
            </div>
          );
        })}
      </div>
    </section>
  );
}
