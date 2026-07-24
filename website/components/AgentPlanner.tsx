import type { PlanStep } from "../types/agent";

function PlanBranch({ step, index }: { step: PlanStep; index: number }) {
  return (
    <li>
      <div className="plan-step">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div><strong>{step.title}</strong><small>{step.description}</small></div>
      </div>
      {step.children && (
        <ul>{step.children.map((child, childIndex) => <PlanBranch key={child.id} step={child} index={childIndex} />)}</ul>
      )}
    </li>
  );
}

export function AgentPlanner({ steps }: { steps: PlanStep[] }) {
  return (
    <section className="workbench-card planner-panel">
      <header className="workbench-card-head">
        <div><span>TASK DECOMPOSITION</span><h3>Agent Planner</h3></div>
        <small>tree plan</small>
      </header>
      <ol className="plan-tree">{steps.map((step, index) => <PlanBranch key={step.id} step={step} index={index} />)}</ol>
    </section>
  );
}
