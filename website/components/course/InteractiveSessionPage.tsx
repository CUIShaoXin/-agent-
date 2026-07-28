"use client";

import type { CourseSession } from "../../data/sessions";
import { sessionHref } from "../../lib/hashRouter";
import { DogdanAvatar } from "../DogdanAvatar";
import { DogdanMessage } from "../DogdanMessage";
import { CodePlayground } from "./CodePlayground";
import { FlowDiagram } from "./FlowDiagram";
import { Quiz } from "./Quiz";

interface InteractiveSessionPageProps {
  session: CourseSession;
  completed: boolean;
  completeSession: (sessionNumber: number) => void;
}

interface SessionGuide {
  heroLead: string;
  welcome: string;
  objectiveLead: string;
  concepts: string[];
  experimentLead: string;
  challenge: string;
}

const sessionGuides: Record<number, SessionGuide> = {
  2: {
    heroLead: "让 Agent 不止回答一次，而是持续把任务向前推进。",
    welcome: "这一节我们把 Agent 的大脑拆开看：它如何思考、行动、观察，再决定下一步。",
    objectiveLead: "你会亲手读懂一次完整循环，并知道 Agent 应该在什么时候继续、什么时候停止。",
    concepts: [
      "用推理与行动交替完成任务的 Agent 工作方式。",
      "结合目标与上下文，判断当前最合理的下一步。",
      "把决策转换成工具调用、查询或其他真实操作。",
      "读取行动结果，将环境反馈重新放回决策上下文。",
      "通过最大轮次和完成条件，让循环可靠地结束。",
    ],
    experimentLead: "运行代码，观察 Thought、Action 与 Observation 如何在 Runtime 中连续发生。",
    challenge: "工具返回 Observation 后，Agent 应该直接结束，还是把结果带回下一轮思考？",
  },
  3: {
    heroLead: "为 Agent 装上工具，让它真正连接外部世界。",
    welcome: "今天我们一起设计 Agent 的能力清单：模型负责选择工具，Runtime 负责安全执行。",
    objectiveLead: "你会理解一个工具如何从普通函数变成模型可以自主发现和调用的能力。",
    concepts: [
      "让模型输出结构化工具调用，而不是只生成自然语言。",
      "用标准协议把工具、资源与 Agent 连接起来。",
      "通过 API、数据库和服务，让 Agent 能读取或改变外部世界。",
      "用名称、描述与参数约束，清楚告诉模型工具应该怎样使用。",
    ],
    experimentLead: "运行工具注册示例，观察 Schema 如何驱动工具选择、参数校验与结果回填。",
    challenge: "如果工具描述含糊、参数类型不明确，Agent 最可能在哪一步出错？",
  },
  4: {
    heroLead: "让 Agent 记住上下文，也让不同任务彼此隔离。",
    welcome: "没有记忆，Agent 每次见你都像第一次见面。今天我们给它建立可靠的会话记忆。",
    objectiveLead: "你会学会区分短期记忆、长期记忆与 Checkpoint，并理解召回发生的正确时机。",
    concepts: [
      "保存当前对话最近几轮内容，支持自然追问与任务延续。",
      "沉淀用户偏好和稳定事实，在未来会话中按需召回。",
      "用 user_id 与 session_id 隔离用户和聊天窗口。",
      "在关键节点保存运行状态，让中断的任务能够继续执行。",
    ],
    experimentLead: "运行会话示例，观察同一用户的不同窗口如何独立召回和保存上下文。",
    challenge: "用户同时打开两个窗口处理不同任务时，Memory 应该使用什么键进行隔离？",
  },
  5: {
    heroLead: "在有限 Token 中，保留真正影响任务完成的信息。",
    welcome: "上下文不是越长越好。今天我们学习如何压缩历史，同时不丢失重要任务状态。",
    objectiveLead: "你会判断何时触发压缩、哪些内容必须保留，以及 Summary Memory 如何进入新上下文。",
    concepts: [
      "模型上下文存在容量与成本限制，需要持续估算使用量。",
      "把较早消息总结为紧凑状态，同时保留近期原始对话。",
      "用结构化摘要长期保存用户约束、偏好和任务进度。",
      "在 System、Summary、Recent Messages 与当前输入之间分配空间。",
    ],
    experimentLead: "运行压缩示例，对比压缩前后的 Token 数量和被保留的关键事实。",
    challenge: "压缩历史消息时，哪些信息绝不能被简单删除？",
  },
  6: {
    heroLead: "看见 Agent 的每一步，才能真正理解和修复它。",
    welcome: "最后一节，我们给 Agent 装上仪表盘：记录决策、工具、耗时与错误恢复过程。",
    objectiveLead: "你会把一次 Agent 运行拆成可观察节点，并用 Trace 快速定位失败原因。",
    concepts: [
      "记录从用户输入到最终答案的完整执行路径。",
      "利用输入、输出和错误信息复现并定位异常行为。",
      "观察节点状态、耗时与工具结果，判断系统是否健康。",
      "把错误变成 Observation，让 Agent 选择重试、降级或停止。",
    ],
    experimentLead: "运行 Trace 示例，观察成功节点、失败节点和异常信息如何被结构化记录。",
    challenge: "工具执行失败时，应该隐藏异常，还是把错误作为 Observation 交还给 Agent？",
  },
};

export function InteractiveSessionPage({ session, completed, completeSession }: InteractiveSessionPageProps) {
  const guide = sessionGuides[session.number];
  const nextSession = session.number < 6 ? session.number + 1 : null;
  const foundationId = `session-${session.number}-foundation`;

  function startLearning() {
    document.getElementById(foundationId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className={`session-learning-page session-one-page interactive-session-page session-accent-${session.accent}`}>
      <header className="course-map-header session-course-header shell">
        <a className="brand" href="#home"><span className="brand-mark">MA</span><span>Minimum Agent Lab</span></a>
        <span>SESSION-{session.number} / {session.eyebrow}</span>
      </header>

      <article className="session-learning-content session-learning-single">
        <section className="session-one-hero">
          <div className="session-one-hero-copy">
            <span>SESSION-{session.number} / {session.eyebrow}</span>
            <h1>{session.title}</h1>
            <p><strong>{guide.heroLead}</strong><br />{session.description}</p>
            <button type="button" onClick={startLearning}>跟狗蛋开始学习 <b>↓</b></button>
          </div>
          <div className="session-one-dogdan-stage">
            <DogdanAvatar emotion="idle" size="large" />
            <DogdanMessage title={`欢迎来到 Session-${session.number}`}>
              <p>{guide.welcome}</p>
            </DogdanMessage>
          </div>
        </section>

        <section className="session-one-foundation" id={foundationId}>
          <header><span>01 / LEARNING GOAL</span><h2>本节学习目标</h2><p>{session.objective} {guide.objectiveLead}</p></header>
        </section>

        <section className="interactive-core-section">
          <header><span>02 / CORE KNOWLEDGE</span><h2>建立核心知识地图</h2></header>
          <div className={`session-one-concept-grid concept-count-${session.lessons.length}`}>
            {session.lessons.map((lesson, index) => (
              <article key={lesson}><span>{String(index + 1).padStart(2, "0")}</span><h3>{lesson}</h3><p>{guide.concepts[index]}</p></article>
            ))}
          </div>
        </section>

        <div className="interactive-flow-section"><FlowDiagram eyebrow="03 / 可视化流程" flows={session.flows} /></div>

        <section className="interactive-experiment-intro">
          <DogdanAvatar emotion="thinking" size="small" />
          <DogdanMessage compact eyebrow="狗蛋实验提示" title="轮到你动手了">
            <p>{guide.experimentLead}</p>
          </DogdanMessage>
        </section>
        <CodePlayground code={session.code} eyebrow="04 / 互动实验" result={session.codeResult} />

        <section className="interactive-challenge-intro">
          <DogdanAvatar emotion="thinking" size="small" />
          <DogdanMessage compact eyebrow="狗蛋挑战" title="先别急着看答案">
            <p>{guide.challenge}</p>
          </DogdanMessage>
        </section>
        <Quiz eyebrow="05 / 狗蛋挑战" title={`完成 Session-${session.number} 挑战`} quiz={session.quiz} />

        <section className={`session-complete-card ${completed ? "completed" : ""}`}>
          <div><span>{completed ? "MISSION COMPLETE" : "LEARNING MISSION"}</span><h2>{completed ? `Session-${session.number} 已完成` : "完成狗蛋的学习挑战"}</h2><p>完成本节后，学习进度会保存在当前浏览器。</p></div>
          <div className="session-complete-actions">
            {!completed && <button type="button" onClick={() => completeSession(session.number)}>标记为已完成 ✓</button>}
            {nextSession ? <a href={sessionHref(nextSession)}>下一章节：Session-{nextSession} →</a> : <a href="#customer-service">进入 Final Project →</a>}
          </div>
        </section>
      </article>
    </main>
  );
}
