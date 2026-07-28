import Image from "next/image";

const learningPathUrl = "https://cuishaoxin.github.io/-agent-/?v=a26d09d#home";

export function MinimalLearningEntry() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main className="minimal-entry-page">
      <a className="learning-entry-card" href={learningPathUrl} aria-label="进入 Agent 学习路径">
        <span className="learning-entry-visual">
          <Image
            alt="狗蛋，Minimum Agent Lab 的 AI 学习伙伴"
            className="learning-entry-dogdan"
            height={1254}
            priority
            src={`${basePath}/mascot/goudan-entry.png`}
            width={1254}
          />
        </span>
        <strong>Agent学习路径</strong>
        <span className="learning-entry-button">开始学习 <b>→</b></span>
      </a>
    </main>
  );
}
