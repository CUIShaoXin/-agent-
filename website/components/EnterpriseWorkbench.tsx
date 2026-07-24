"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  agentDefinitions,
  guardRules,
  knowledgeSources,
  memoryState,
  scenarios,
  skillPresets,
} from "../lib/enterpriseMock";
import type { AgentNode, AgentScenario } from "../types/agent";
import { AgentPanel } from "./AgentPanel";
import { AgentPlanner } from "./AgentPlanner";
import { AgentTrace } from "./AgentTrace";
import { GuardPanel } from "./GuardPanel";
import { KnowledgeBasePanel } from "./KnowledgeBasePanel";
import { MemoryPanel } from "./MemoryPanel";
import { ToolCallViewer } from "./ToolCallViewer";

type ConsoleTab = "agents" | "knowledge" | "memory" | "guard";

export function EnterpriseWorkbench() {
  const [scenarioId, setScenarioId] = useState("analysis");
  const [prompt, setPrompt] = useState(scenarios.analysis.question);
  const [cursor, setCursor] = useState(scenarios.analysis.trace.length);
  const [running, setRunning] = useState(false);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("agents");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scenario: AgentScenario = scenarios[scenarioId];

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const displayNodes = useMemo<AgentNode[]>(() => scenario.trace.map((node, index) => {
    if (!running && cursor >= scenario.trace.length) return node;
    if (index < cursor) return node;
    if (index === cursor && running) return { ...node, status: "running" };
    return { ...node, status: "pending" };
  }), [cursor, running, scenario]);

  function selectSkill(id: string) {
    if (timer.current) clearInterval(timer.current);
    setScenarioId(id);
    setPrompt(scenarios[id].question);
    setCursor(scenarios[id].trace.length);
    setRunning(false);
  }

  function run(event?: FormEvent) {
    event?.preventDefault();
    if (!prompt.trim()) return;
    if (timer.current) clearInterval(timer.current);
    setCursor(0);
    setRunning(true);
    let next = 0;
    timer.current = setInterval(() => {
      next += 1;
      if (next >= scenario.trace.length) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setCursor(scenario.trace.length);
        setRunning(false);
        return;
      }
      setCursor(next);
    }, 720);
  }

  return (
    <section className="enterprise-section" id="enterprise">
      <div className="shell">
        <div className="section-heading enterprise-heading">
          <div><span className="section-no">ENTERPRISE AGENT PLAYGROUND</span><h2>把 Agent 的每一步，都放到台面上</h2></div>
          <p>从任务规划、知识召回、工具调用到安全检查，完整观察多 Agent 协作链路。</p>
        </div>

        <div className="skill-presets" aria-label="Agent 技能快捷入口">
          {skillPresets.map((preset) => (
            <button className={scenarioId === preset.id ? "active" : ""} key={preset.id} onClick={() => selectSkill(preset.id)}>
              <b>{preset.icon}</b><span>{preset.label}</span><small>{preset.prompt}</small>
            </button>
          ))}
        </div>

        <div className="enterprise-app">
          <header className="enterprise-app-bar">
            <div><span className="enterprise-logo">EA</span><strong>Enterprise Agent Playground</strong><small>development</small></div>
            <div className="runtime-health"><span><i />Runtime online</span><span>6 Agents</span><span>Trace on</span></div>
          </header>

          <div className="enterprise-layout">
            <div className="enterprise-main">
              <form className="enterprise-prompt" onSubmit={run}>
                <div className="prompt-context"><span>USER REQUEST</span><small>session: sess_ent_2026_0724</small></div>
                <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="输入企业 Agent 任务" rows={2} />
                <div className="prompt-actions"><span>⌘ Enter 运行 · Mock execution</span><button type="submit" disabled={running}>{running ? "运行中…" : "Run Agent"} <i>→</i></button></div>
              </form>

              <div className="planner-trace-grid">
                <AgentPlanner steps={scenario.plan} />
                <AgentTrace nodes={displayNodes} />
              </div>
              <ToolCallViewer calls={running ? scenario.tools.map((tool, index) => ({ ...tool, status: index < Math.max(0, cursor - 2) ? tool.status : "pending" })) : scenario.tools} />
              <section className={`enterprise-answer ${running ? "is-waiting" : ""}`}>
                <header><span>✦ RESPONSE AGENT</span><small>{running ? "waiting for execution…" : "grounded answer · confidence 0.91"}</small></header>
                <p>{running ? "多个 Agent 正在协作，最终答案将在 Guard 检查通过后生成。" : scenario.answer}</p>
              </section>
            </div>

            <aside className="agent-console" aria-label="Agent Configuration Panel">
              <header><div><span>CONTROL PLANE</span><h3>Agent Configuration</h3></div><button aria-label="更多配置">•••</button></header>
              <div className="console-tabs" role="tablist">
                {([
                  ["agents", "Agents"],
                  ["knowledge", "Knowledge"],
                  ["memory", "Memory"],
                  ["guard", "Guard"],
                ] as const).map(([id, label]) => (
                  <button key={id} className={consoleTab === id ? "active" : ""} onClick={() => setConsoleTab(id)} role="tab" aria-selected={consoleTab === id}>{label}</button>
                ))}
              </div>
              {consoleTab === "agents" && <AgentPanel agents={agentDefinitions} />}
              {consoleTab === "knowledge" && <KnowledgeBasePanel sources={knowledgeSources} />}
              {consoleTab === "memory" && <MemoryPanel memory={memoryState} />}
              {consoleTab === "guard" && <GuardPanel rules={guardRules} />}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
