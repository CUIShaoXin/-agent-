"use client";

import { courseSessions } from "../../data/sessions";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { DogdanAvatar } from "../DogdanAvatar";
import { DogdanMessage } from "../DogdanMessage";
import { LearningProgress } from "../LearningProgress";
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
          <span className="section-no">SIX SESSIONS / AGENT COURSE</span>
          <h1><em>Agent学习路径</em></h1>
          <p>六个 Session，边学边构建 Agent。<br />选择章节，从基础概念逐步完成一个完整智能 Agent。</p>
          <button className="course-start-button" type="button" onClick={scrollToSessions}>Start Building Agent <span>→</span></button>
        </div>
        <LearningProgress completed={completedCount} />
      </section>

      <section className="dogdan-welcome shell" aria-label="狗蛋 Agent 欢迎区域">
        <DogdanAvatar emotion={completedCount === 6 ? "success" : "idle"} size="medium" />
        <DogdanMessage title="欢迎来到 Minimum Agent Lab！">
          <p>我是狗蛋。接下来我会陪你从普通 LLM 出发，一步一步搭建完整智能体系统。</p>
          <div className="dogdan-learning-path"><span>普通 LLM</span><i>→</i><span>Agent</span><i>→</i><span>完整智能体系统</span></div>
          <strong>准备开始你的 Agent 之旅了吗？</strong>
        </DogdanMessage>
      </section>

      <section className="course-map-section shell" id="course-sessions">
        <div className="course-map-section-heading">
          <div><span>BUILD IN PUBLIC</span><h2>选择一个 Session 开始学习</h2></div>
          <p>选择一个章节进入课程详情，按顺序完成 Agent 学习路径。</p>
        </div>
        <div className="course-map-grid" aria-label="Agent 学习模块">
          {courseSessions.map((session) => <SessionCard completed={isCompleted(session.number)} key={session.slug} session={session} />)}
        </div>
      </section>

      <section className={`course-final shell ${completedCount === 6 ? "completed" : ""}`}>
        <div>
          <span>{completedCount === 6 ? "ACHIEVEMENT UNLOCKED" : "FINAL PROJECT"}</span>
          <h2>{completedCount === 6 ? "Mini Agent Builder" : "和狗蛋一起打造第一个真实 Agent"}</h2>
          <p>{completedCount === 6 ? "你已经完成六个 Session。现在和狗蛋一起把 Loop、Tools、Memory、RAG 与 Trace 组合成真实 Agent。" : "完成六个 Session 后，你将掌握 Agent Loop、Tool Calling、Memory、RAG 与 Execution Trace，并最终实现智能客服 Agent。"}</p>
        </div>
        <div className="course-final-path"><span>Loop</span><i>→</i><span>Tools</span><i>→</i><span>Memory</span><i>→</i><span>Mini Agent</span></div>
        <a href="#/customer-service">进入实战项目 <span>→</span></a>
      </section>

      <footer className="course-map-footer shell"><span>Minimum Agent Lab · Course Map</span><a href="#home">返回首页</a></footer>
    </main>
  );
}
