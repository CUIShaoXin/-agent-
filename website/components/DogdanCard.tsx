"use client";

import { useCourseProgress } from "../hooks/useCourseProgress";
import { DogdanAvatar } from "./DogdanAvatar";
import { LearningProgress } from "./LearningProgress";

const learningTopics = ["什么是 Agent", "Agent Loop", "Tool Calling", "Memory", "Context Compression", "Execution Trace"];

export function DogdanCard() {
  const { completedCount } = useCourseProgress();

  return (
    <aside className="dogdan-card" aria-label="狗蛋 Agent 学习助手">
      <header><span>GOUDAN AGENT</span><b>LEARNING ONLINE</b></header>
      <div className="dogdan-card-body">
        <DogdanAvatar emotion={completedCount === 6 ? "success" : "idle"} size="large" />
        <div className="dogdan-card-copy">
          <span>MINIMUM AGENT LAB 官方学习助手</span>
          <h2>你好，我是狗蛋！</h2>
          <p>我会陪你从一个 Loop 开始，亲手搭建真正可用的 Agent。</p>
        </div>
        <ul>{learningTopics.map((topic) => <li key={topic}><i>✓</i>{topic}</li>)}</ul>
        <LearningProgress completed={completedCount} compact />
        <a href="#home">和狗蛋一起开始学习 <span>→</span></a>
      </div>
    </aside>
  );
}
