"use client";

import { useEffect, useRef, useState } from "react";
import { DogdanMessage } from "../DogdanMessage";

const flowSteps = [
  { title: "用户输入任务", detail: "帮我查询北京天气，并提醒我带伞。" },
  { title: "Agent 分析目标", detail: "任务需要天气信息与提醒工具。" },
  { title: "调用工具", detail: "weather(city=北京) → todo(content=带伞)" },
  { title: "观察结果", detail: "北京有雨，提醒事项创建成功。" },
  { title: "完成任务", detail: "整合结果，用自然语言回复用户。" },
];

export function SessionOneFlowLab() {
  const [activeStep, setActiveStep] = useState(-1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function startFlow() {
    if (timer.current) clearInterval(timer.current);
    setActiveStep(0);
    let next = 0;
    timer.current = setInterval(() => {
      next += 1;
      setActiveStep(Math.min(next, flowSteps.length - 1));
      if (next >= flowSteps.length - 1) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
      }
    }, 850);
  }

  const finished = activeStep === flowSteps.length - 1;

  return (
    <section className="lesson-module session-one-flow-lab">
      <header>
        <div><span>04 / AGENT FLOW LAB</span><h2>亲手启动一次 Agent 流程</h2></div>
        <button type="button" onClick={startFlow}>{activeStep < 0 ? "▶ 启动流程" : "↻ 再运行一次"}</button>
      </header>

      <div className="session-one-task"><span>USER TASK</span><strong>“查询北京天气，并提醒我带伞”</strong></div>

      <div className="session-one-flow-track" aria-live="polite">
        {flowSteps.map((step, index) => {
          const status = activeStep < index ? "pending" : activeStep === index && !finished ? "running" : "success";
          return (
            <div className={`session-one-flow-step ${status}`} key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><b>{step.title}</b><p>{step.detail}</p></div>
              <i>{status === "success" ? "✓" : status === "running" ? "···" : "○"}</i>
            </div>
          );
        })}
      </div>

      <DogdanMessage emotion={finished ? "success" : activeStep >= 0 ? "thinking" : "idle"} compact title={finished ? "任务完成！" : "狗蛋提示"}>
        <p>{finished ? "这就是 Agent：它不是一次生成答案，而是围绕目标持续分析、行动和观察。" : "点击启动流程，观察 Agent 如何一步步把目标变成真实行动。"}</p>
      </DogdanMessage>
    </section>
  );
}
