"use client";

import { useState } from "react";
import type { CourseSession } from "../data/sessions";
import { DogdanAvatar, type DogdanEmotion } from "./DogdanAvatar";
import { DogdanMessage } from "./DogdanMessage";

interface DogdanAgentProps {
  session: CourseSession;
  completed: boolean;
}

export function DogdanAgent({ session, completed }: DogdanAgentProps) {
  const [answer, setAnswer] = useState<"a" | "b" | null>(null);
  const [emotion, setEmotion] = useState<DogdanEmotion>("idle");
  const correct = answer === session.quiz.answer;
  const displayedEmotion = completed && !answer ? "success" : emotion;

  function chooseAnswer(nextAnswer: "a" | "b") {
    setAnswer(nextAnswer);
    setEmotion("thinking");
    window.setTimeout(() => setEmotion(nextAnswer === session.quiz.answer ? "success" : "error"), 420);
  }

  return (
    <aside className="dogdan-teacher" aria-label="狗蛋互动教学助手">
      <div className="dogdan-teacher-sticky">
        <header><span>AI TEACHING COMPANION</span><b>{displayedEmotion.toUpperCase()}</b></header>
        <DogdanAvatar emotion={displayedEmotion} size="medium" />
        <DogdanMessage emotion={displayedEmotion} title={`今天学习：${session.title}`} compact>
          <p>{session.goudanTip}</p>
        </DogdanMessage>
        <div className="dogdan-mini-quiz">
          <span>狗蛋的小测试</span>
          <p>{session.quiz.question}</p>
          <div>
            {session.quiz.options.map((option) => (
              <button
                className={answer === option.id ? (correct ? "correct" : "wrong") : ""}
                key={option.id}
                onClick={() => chooseAnswer(option.id)}
                type="button"
              >
                <b>{option.id.toUpperCase()}</b>{option.label}
              </button>
            ))}
          </div>
          {answer && emotion !== "thinking" && (
            <DogdanMessage emotion={correct ? "success" : "error"} eyebrow={correct ? "回答正确" : "再试一次"} compact>
              <p>{correct ? "做得好！你已经抓住了本节的关键。" : session.quiz.explanation}</p>
            </DogdanMessage>
          )}
        </div>
      </div>
    </aside>
  );
}
