"use client";

import { courseSessions } from "../../data/sessions";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { ProgressBar } from "./ProgressBar";
import { SessionCard } from "./SessionCard";

export function CourseMapPage() {
  const { completedCount, isCompleted } = useCourseProgress();

  function scrollToSessions() {
    document.getElementById("course-sessions")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="course-map-page">
      <header className="course-map-header shell">
        <a className="brand" href="#home" aria-label="返回 Minimum Agent Lab 首页"><span className="brand-mark">MA</span><span>Minimum Agent Lab</span></a>
        <span>AGENT COURSE MAP</span>
        <a href="#home">返回首页 ↑</a>
      </header>

      <section className="course-map-hero shell">
        <div>
          <span className="section-no">LEARNING ROADMAP / 2026</span>
          <h1>六个 Session，<br /><em>边学边构建 Agent</em></h1>
          <p>选择章节，从 Agent 基础概念开始，<br />逐步完成一个完整智能 Agent。</p>
          <button className="course-start-button" type="button" onClick={scrollToSessions}>Start Building Agent <span>→</span></button>
        </div>
        <ProgressBar completed={completedCount} />
      </section>

      <section className="course-map-section shell" id="course-sessions">
        <div className="course-map-section-heading">
          <div><span>BUILD IN PUBLIC</span><h2>Agent 学习路径</h2></div>
          <p>选择一个章节进入课程详情，按顺序完成 Agent 学习路径。</p>
        </div>
        <div className="course-map-grid" aria-label="Agent 学习模块">
          {courseSessions.map((session) => <SessionCard completed={isCompleted(session.number)} key={session.slug} session={session} />)}
        </div>
      </section>

      <section className={`course-final shell ${completedCount === 6 ? "completed" : ""}`}>
        <div>
          <span>{completedCount === 6 ? "ACHIEVEMENT UNLOCKED" : "FINAL PROJECT"}</span>
          <h2>{completedCount === 6 ? "Mini Agent Builder" : "智能客服 Agent"}</h2>
          <p>{completedCount === 6 ? "你已经完成六个 Session。现在把 Loop、Tools、Memory、Context 与 Trace 组合成一个真实 Agent。" : "完成六个 Session 后，将所有能力组合成一个可以上传知识库、检索回答并保存多轮记忆的真实 Agent。"}</p>
        </div>
        <div className="course-final-path"><span>Loop</span><i>→</i><span>Tools</span><i>→</i><span>Memory</span><i>→</i><span>Mini Agent</span></div>
        <a href="#customer-service">进入实战项目 <span>→</span></a>
      </section>

      <footer className="course-map-footer shell"><span>Minimum Agent Lab · Course Map</span><a href="#home">返回首页</a></footer>
    </main>
  );
}
