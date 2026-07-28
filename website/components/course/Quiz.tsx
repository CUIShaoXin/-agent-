"use client";

import { useState } from "react";
import type { CourseQuiz } from "../../data/sessions";

interface QuizProps {
  quiz: CourseQuiz;
  eyebrow?: string;
  title?: string;
}

export function Quiz({ quiz, eyebrow = "03 / 互动练习", title = "快速测验" }: QuizProps) {
  const [answer, setAnswer] = useState<"a" | "b" | null>(null);
  const correct = answer === quiz.answer;

  return (
    <section className="lesson-module quiz-module">
      <header><div><span>{eyebrow}</span><h2>{title}</h2></div><b>CHECK UNDERSTANDING</b></header>
      <p className="quiz-question">{quiz.question}</p>
      <div className="quiz-options">
        {quiz.options.map((option) => (
          <button
            className={answer === option.id ? (correct ? "correct" : "wrong") : ""}
            key={option.id}
            onClick={() => setAnswer(option.id)}
            type="button"
          >
            <span>{option.id.toUpperCase()}</span>{option.label}
          </button>
        ))}
      </div>
      {answer && (
        <div className={`quiz-result ${correct ? "correct" : "wrong"}`} role="status">
          <strong>{correct ? `正确答案：${quiz.answer.toUpperCase()}` : `再想一想，正确答案是 ${quiz.answer.toUpperCase()}`}</strong>
          <p>{quiz.explanation}</p>
        </div>
      )}
    </section>
  );
}
