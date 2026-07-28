"use client";

import { courseSessions, getCourseSession } from "../../data/sessions";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { sessionHref } from "../../lib/hashRouter";
import { CodePlayground } from "./CodePlayground";
import { FlowDiagram } from "./FlowDiagram";
import { Quiz } from "./Quiz";
import { SessionOnePage } from "./SessionOnePage";

interface SessionPageProps {
  sessionNumber: number;
}

export function SessionPage({ sessionNumber }: SessionPageProps) {
  const session = getCourseSession(sessionNumber);
  const { completedCount, completeSession, isCompleted } = useCourseProgress();
  const completed = isCompleted(session.number);
  const nextSession = session.number < courseSessions.length ? session.number + 1 : null;

  if (session.number === 1) {
    return <SessionOnePage completed={completed} completeSession={completeSession} session={session} />;
  }

  return (
    <main className="session-learning-page">
      <header className="course-map-header session-course-header shell">
        <a className="brand" href="#home">
          <span className="brand-mark">MA</span>
          <span>Minimum Agent Lab</span>
        </a>
        <span>SESSION-{session.number} / {session.eyebrow}</span>
      </header>

      <article className="session-learning-content session-learning-single">
        <header className="session-title-block">
          <span>SESSION-{session.number} / {session.eyebrow}</span>
          <h1>{session.title}</h1>
          <p>{session.description}</p>
          <div>{session.tags.map((tag) => <b key={tag}>{tag}</b>)}</div>
        </header>

        <section className="learning-objective session-content-card">
          <div>
            <span>01 / 教学目标</span>
            <h2>本节学习目标</h2>
            <p>{session.objective}</p>
          </div>
          <ol>
            {session.lessons.map((lesson, index) => (
              <li key={lesson}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {lesson}
              </li>
            ))}
          </ol>
        </section>

        <FlowDiagram flows={session.flows} />
        <Quiz quiz={session.quiz} />
        <CodePlayground code={session.code} result={session.codeResult} />

        <section className={`session-complete-card ${completed ? "completed" : ""}`}>
          <div>
            <span>{completed ? "SESSION COMPLETED" : "READY TO CONTINUE?"}</span>
            <h2>{completed ? `Session-${session.number} 已完成` : "完成本节学习"}</h2>
            <p>
              {completed
                ? "学习进度已保存在当前浏览器，可以继续进入下一章节。"
                : "标记完成后会更新课程地图中的学习进度。"}
            </p>
          </div>
          <div className="session-complete-actions">
            {!completed && (
              <button type="button" onClick={() => completeSession(session.number)}>
                标记为已完成 ✓
              </button>
            )}
            {nextSession ? (
              <a href={sessionHref(nextSession)}>下一章节：Session-{nextSession} →</a>
            ) : (
              <a href="#customer-service">进入 Final Project →</a>
            )}
          </div>
        </section>

        {completedCount === courseSessions.length && (
          <section className="mini-agent-award">
            <span>✓</span>
            <div><b>MINI AGENT BUILDER</b><p>六个 Session 已全部完成。</p></div>
            <a href="#customer-service">开始实战 →</a>
          </section>
        )}
      </article>
    </main>
  );
}
