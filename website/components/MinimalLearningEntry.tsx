import Image from "next/image";

const entries = [
  {
    title: "Agent学习路径",
    button: "开始学习",
    href: "https://cuishaoxin.github.io/-agent-/?v=a26d09d#home",
    image: "/mascot/goudan-entry.png",
    alt: "狗蛋，Minimum Agent Lab 的 AI 学习伙伴",
  },
  {
    title: "GPT/Codex购买入口",
    button: "立即购买",
    href: "https://pay.ldxp.cn/item/1vym1h",
    image: "/mascot/goudan-codex-card.png",
    alt: "狗蛋正在使用笔记本电脑进行 AI 编程",
  },
  {
    title: "深度强化学习规划",
    button: "查看规划",
    href: "/rl-planning",
    image: "/mascot/goudan-rl-planning.png",
    alt: "狗蛋手持策略地图进行强化学习规划",
  },
];

export function MinimalLearningEntry() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main className="minimal-entry-page">
      <div className="minimal-entry-grid">
        {entries.map((entry, index) => (
          <a className="learning-entry-card" href={entry.href} aria-label={entry.title} key={entry.title}>
            <span className="learning-entry-visual">
              <Image
                alt={entry.alt}
                className="learning-entry-dogdan"
                height={1254}
                priority={index === 0}
                src={`${basePath}${entry.image}`}
                width={1254}
              />
            </span>
            <strong>{entry.title}</strong>
            <span className="learning-entry-button">{entry.button} <b>→</b></span>
          </a>
        ))}
      </div>
    </main>
  );
}
