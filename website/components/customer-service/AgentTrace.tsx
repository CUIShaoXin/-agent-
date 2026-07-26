export type AgentRunStatus = "idle" | "running" | "success" | "failed";

export interface AgentTraceProps {
  question: string;
  status: AgentRunStatus;
  activeStep: number;
}

interface AgentTraceNode {
  id: string;
  name: string;
}

const traceNodes: AgentTraceNode[] = [
  { id: "intent", name: "Intent Agent" },
  { id: "retriever", name: "Retriever Agent" },
  { id: "llm", name: "LLM Agent" },
  { id: "guard", name: "Guard" },
  { id: "answer", name: "Answer Ready" },
];

function nodeStatus(index: number, status: AgentRunStatus, activeStep: number) {
  if (status === "idle") return "pending";
  if (status === "success") return "success";
  if (status === "failed") {
    if (index < activeStep) return "success";
    return index === activeStep ? "failed" : "pending";
  }
  if (index < activeStep) return "success";
  return index === activeStep ? "running" : "pending";
}

export function AgentTrace({ question, status, activeStep }: AgentTraceProps) {
  return (
    <section className="cs-trace" aria-label="Agent 执行流程">
      <div className="cs-trace-heading">
        <span>AGENT TRACE</span>
        <small className={status}>{status === "idle" ? "READY" : status.toUpperCase()}</small>
      </div>
      <div className="cs-trace-question" title={question || "等待用户问题"}>
        <span>用户问题</span><b>{question || "等待输入知识库问题"}</b>
      </div>
      <div className="cs-trace-flow">
        {traceNodes.map((node, index) => {
          const currentStatus = nodeStatus(index, status, activeStep);
          return (
            <div className={`cs-trace-step ${currentStatus}`} key={node.id}>
              <i />
              <span>{node.name}</span>
              {index < traceNodes.length - 1 && <b aria-hidden="true">→</b>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
