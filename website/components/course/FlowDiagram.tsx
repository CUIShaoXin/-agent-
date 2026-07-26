import type { CourseFlow } from "../../data/sessions";

interface FlowDiagramProps {
  flows: CourseFlow[];
}

export function FlowDiagram({ flows }: FlowDiagramProps) {
  return (
    <section className="lesson-module concept-module">
      <header><div><span>01 / CONCEPT</span><h2>概念流程</h2></div><b>ANIMATED FLOW</b></header>
      <div className="concept-flow-grid">
        {flows.map((flow) => (
          <article key={flow.title}>
            <h3>{flow.title}</h3>
            <div className="concept-flow-steps">
              {flow.steps.map((step, index) => (
                <div className="concept-flow-step" key={step} style={{ animationDelay: `${index * 90}ms` }}>
                  <span>{step}</span>
                  {index < flow.steps.length - 1 && <i>→</i>}
                </div>
              ))}
            </div>
            <p>{flow.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
