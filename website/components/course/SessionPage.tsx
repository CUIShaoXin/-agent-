"use client";

import { courseSessions, getCourseSession } from "../../data/sessions";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { courseHref, sessionHref } from "../../lib/hashRouter";
import { DogdanAgent } from "../DogdanAgent";
import { FlowDiagram } from "./FlowDiagram";
import { ProgressBar } from "./ProgressBar";
import { Quiz } from "./Quiz";

interface SessionPageProps {
  sessionNumber: number;
}

export function SessionPage({ sessionNumber }: SessionPageProps) {
  const session = getCourseSession(sessionNumber);
  const { completedCount, completeSession, isCompleted } = useCourseProgress();
  const completed = isCompleted(session.number);
  const nextSession = session.number < courseSessions.length ? session.number + 1 : null;

  return (
    <main className="session-learning-page">
      <header className="course-map-header shell">
        <a className="brand" href="#home"><span className="brand-mark">MA</span><span>Minimum Agent Lab</span></a>
        <span>SESSION-{session.number} / {session.eyebrow}</span>
        <a href={courseHref()}>← 课程地图</a>
      </header>

      <section className="session-learning-hero shell">
        <span>AGENT COURSE / SESSION-{session.number}</span>
        <h1>六个 Session，边学边构建 Agent</h1>
        <p>选择章节，从 Agent 基础概念开始，逐步完成一个完整智能 Agent。</p>
      </section>

      <div className="session-learning-layout shell">
        <aside className="session-sidebar">
          <ProgressBar completed={completedCount} compact />
          <nav aria-label="Session 导航">
            {courseSessions.map((item) => (
              <a className={item.number === session.number ? "active" : ""} href={sessionHref(item.number)} key={item.slug}>
                <span>{String(item.number).padStart(2, "0")}</span>
                <div><b>Session-{item.number} {item.title}</b><small>{item.eyebrow}</small></div>
                <i>{isCompleted(item.number) ? "✓" : "→"}</i>
              </a>
            ))}
            <a href="#customer-service">
              <span>07</span>
              <div><b>Final Project</b><small>智能客服 Agent</small></div>
              <i>→</i>
            </a>
          </nav>
          <a className="session-sidebar-back" href={courseHref()}>← 返回课程地图</a>
        </aside>

        <article className="session-learning-content">
          <header className="session-title-block">
            <span>SESSION-{session.number} · {session.eyebrow}</span>
            <h1>{session.title}</h1>
            <p>{session.description}</p>
            <div>{session.tags.map((tag) => <b key={tag}>{tag}</b>)}</div>
          </header>

          <section className="learning-objective session-content-card">
            <div><span>01 / 教学内容</span><h2>本节目标</h2><p>{session.objective}</p></div>
            <ol>{session.lessons.map((lesson, index) => <li key={lesson}><span>{String(index + 1).padStart(2, "0")}</span>{lesson}</li>)}</ol>
          </section>

          <FlowDiagram flows={session.flows} />
          <Quiz quiz={session.quiz} />

          <section className={`session-complete-card ${completed ? "completed" : ""}`}>
            <div>
              <span>{completed ? "SESSION COMPLETED" : "READY TO CONTINUE?"}</span>
              <h2>{completed ? `Session-${session.number} 已完成` : "完成本节学习"}</h2>
              <p>{completed ? "进度已经保存在当前浏览器，下次回来仍会保留。" : "完成后会更新学习进度，并解锁下一步学习建议。"}</p>
            </div>
            {!completed && <button type="button" onClick={() => completeSession(session.number)}>标记为已完成 ✓</button>}
            {completed && nextSession && <a href={sessionHref(nextSession)}>下一节：Session-{nextSession} →</a>}
            {completed && !nextSession && <a href="#customer-service">进入 Final Project →</a>}
          </section>

          {completedCount === 6 && (
            <section className="mini-agent-award"><span>✦</span><div><b>MINI AGENT BUILDER</b><p>六个 Session 已全部完成。</p></div><a href="#customer-service">开始实战 →</a></section>
          )}
        </article>

        <DogdanAgent completed={completed} key={session.slug} session={session} />
      </div>
    </main>
  );
}
