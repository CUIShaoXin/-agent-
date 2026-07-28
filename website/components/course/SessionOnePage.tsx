"use client";

import type { CourseSession } from "../../data/sessions";
import { sessionHref } from "../../lib/hashRouter";
import { DogdanAvatar } from "../DogdanAvatar";
import { DogdanMessage } from "../DogdanMessage";
import { CodePlayground } from "./CodePlayground";
import { Quiz } from "./Quiz";
import { SessionOneFlowLab } from "./SessionOneFlowLab";

interface SessionOnePageProps {
  session: CourseSession;
  completed: boolean;
  completeSession: (sessionNumber: number) => void;
}

export function SessionOnePage({ session, completed, completeSession }: SessionOnePageProps) {
  function startLearning() {
    document.getElementById("session-one-foundation")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="session-learning-page session-one-page">
      <header className="course-map-header session-course-header shell">
        <a className="brand" href="#home"><span className="brand-mark">MA</span><span>Minimum Agent Lab</span></a>
        <span>SESSION-1 / FOUNDATION</span>
      </header>

      <article className="session-learning-content session-learning-single">
        <section className="session-one-hero">
          <div className="session-one-hero-copy">
            <span>SESSION-1 / FOUNDATION</span>
            <h1>Agent基础认知</h1>
            <p><strong>和狗蛋一起认识真正的 Agent。</strong><br />从普通 LLM 的一次回答出发，理解 Agent 如何围绕目标思考、行动、观察，并最终完成任务。</p>
            <button type="button" onClick={startLearning}>跟狗蛋开始学习 <b>↓</b></button>
          </div>
          <div className="session-one-dogdan-stage">
            <DogdanAvatar emotion="idle" size="large" />
            <DogdanMessage title="你好，我是狗蛋！">
              <p>今天我们一起学习 Agent 基础知识。别担心，我会陪你完成每一步。</p>
            </DogdanMessage>
          </div>
        </section>

        <section className="session-one-foundation" id="session-one-foundation">
          <header>
            <span>01 / AGENT FOUNDATION</span>
            <h2>先建立 Agent 基础认知</h2>
            <p>{session.description} 学完这一部分，你会知道“会回答问题”和“能完成任务”之间的关键区别。</p>
          </header>
          <div className="session-one-concept-grid">
            {session.lessons.map((lesson, index) => (
              <article key={lesson}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{lesson}</h3>
                <p>{[
                  "根据输入预测并生成文本的语言模型。",
                  "围绕目标自主决策并采取行动的系统。",
                  "LLM 负责生成，Agent 负责让任务向前推进。",
                  "目标、推理、工具、观察和执行循环。",
                ][index]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lesson-module session-one-compare">
          <header><div><span>02 / LLM VS AGENT</span><h2>同一个问题，两种工作方式</h2></div><b>COMPARE THE LOOP</b></header>
          <div className="session-one-compare-grid">
            <article>
              <span>普通 LLM</span><h3>生成一个答案</h3>
              <div className="session-one-chain"><b>User</b><i>→</i><b>Prompt</b><i>→</i><b>LLM</b><i>→</i><b>Answer</b></div>
              <DogdanMessage compact eyebrow="狗蛋解释"><p>普通 LLM 擅长理解和生成文本，但回答结束后，任务通常也就停止了。</p></DogdanMessage>
            </article>
            <article className="agent-card">
              <span>Agent</span><h3>持续完成目标</h3>
              <div className="session-one-chain"><b>Goal</b><i>→</i><b>Think</b><i>→</i><b>Act</b><i>→</i><b>Observe</b></div>
              <DogdanMessage compact emotion="thinking" eyebrow="狗蛋解释"><p>Agent 会读取反馈并决定下一步，必要时重复执行，直到目标真正完成。</p></DogdanMessage>
            </article>
          </div>
        </section>

        <Quiz eyebrow="03 / 狗蛋小测试" title="什么是 Agent？" quiz={session.quiz} />
        <SessionOneFlowLab />
        <CodePlayground code={session.code} eyebrow="05 / 代码示例" result={session.codeResult} />

        <section className={`session-complete-card ${completed ? "completed" : ""}`}>
          <div><span>{completed ? "MISSION COMPLETE" : "LEARNING MISSION"}</span><h2>{completed ? "Agent 基础认知已完成" : "完成狗蛋的第一项学习任务"}</h2><p>掌握基础概念后，下一节将亲手拆解 Agent Loop。</p></div>
          <div className="session-complete-actions">
            {!completed && <button type="button" onClick={() => completeSession(1)}>标记为已完成 ✓</button>}
            <a href={sessionHref(2)}>下一章节：Agent Loop →</a>
          </div>
        </section>
      </article>
    </main>
  );
}
