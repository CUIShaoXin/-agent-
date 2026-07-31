import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Vibe Coding教程｜Minimum Agent Lab",
  description: "从想法到项目落地，学习如何使用 AI 辅助完成网站、Agent 和应用开发。",
};

export default function VibeCodingPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main className="vibe-coding-page">
      <div className="vibe-coding-shell">
        <a className="vibe-coding-back" href={`${basePath}/?v=e6aa51d#landing`}>
          ← 返回学习首页
        </a>
        <section className="vibe-coding-hero">
          <div className="vibe-coding-copy">
            <span className="vibe-coding-kicker">NEW LEARNING PATH · 04</span>
            <h1>Vibe Coding教程</h1>
            <p>
              从想法到项目落地，学习如何使用AI辅助完成网站、Agent和应用开发。
              和狗蛋一起，把“我有个想法”变成真正跑起来的项目。
            </p>
            <div className="vibe-coding-topics" aria-label="课程方向">
              <span>网站开发</span>
              <span>Agent开发</span>
              <span>应用开发</span>
              <span>AI协作工作流</span>
            </div>
          </div>
          <div className="vibe-coding-visual">
            <Image
              alt="狗蛋坐在电脑前使用 AI 编程助手学习 Vibe Coding"
              height={1254}
              priority
              src={`${basePath}/mascot/goudan-vibe-coding.png`}
              unoptimized
              width={1254}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
