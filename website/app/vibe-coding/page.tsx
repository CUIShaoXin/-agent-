import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Vibe Coding教程｜和狗蛋一起把想法做出来",
  description: "零基础 Vibe Coding 学习路线：先完成一个能分享的网站，再学会让 AI 成为你的开发搭档。",
};

const courses = [
  {
    id: "phase-one",
    eyebrow: "第一期 · 上手",
    icon: "✨",
    title: "做一个能发给朋友的小网站",
    description:
      "第一次使用 AI 编程工具，用一个下午做出真正能打开、能分享的网页。适合完全没碰过代码的人，先尝到“我也能做出来”的甜头。",
    meta: ["4 节课", "从网页到上线", "1 个真实小工具"],
    action: "进入第一期",
    image: "/mascot/goudan-vibe-coding.png",
    alt: "狗蛋坐在电脑前进行 Vibe Coding",
  },
  {
    id: "phase-two",
    eyebrow: "第二期 · 提效",
    icon: "🧰",
    title: "两小时，雇上你的 AI 实习生",
    description:
      "把 AI 装进你的工作流，用自己的真实材料做出一套能讲的演示、整理文献、处理重复工作。为学习和工作提速，不是做玩具。",
    meta: ["5 节课", "一场两小时动手分享", "可复用工作流"],
    action: "进入第二期",
    image: "/mascot/goudan-codex-card.png",
    alt: "狗蛋使用电脑和 AI 协作完成项目",
  },
];

export default function VibeCodingPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main className="vibe-course-page">
      <header className="vibe-course-header">
        <a href={`${basePath}/?v=e6aa51d#landing`} className="vibe-course-brand">
          <span className="vibe-course-brand-avatar">
            <Image
              alt="狗蛋"
              height={56}
              src={`${basePath}/mascot/goudan-agent.png`}
              unoptimized
              width={56}
            />
          </span>
          <strong>Vibe Coding教程</strong>
          <small>Minimum Agent Lab 出品</small>
        </a>
        <a href={`${basePath}/?v=e6aa51d#landing`} className="vibe-course-home">
          返回学习首页 <span>↗</span>
        </a>
      </header>

      <section className="vibe-course-main">
        <div className="vibe-course-intro">
          <span>不用死磕代码 · 你只管想 · AI 陪你做</span>
          <h1>选一门，今天就开工</h1>
          <p>
            两期都是零基础起步，全程和狗蛋一起边做边学。
            第一期带你完成第一个作品，第二期教你把 AI 变成靠谱的开发搭档。
          </p>
          <div className="vibe-dogdan-tip">
            <Image
              alt="狗蛋学习伙伴"
              height={112}
              src={`${basePath}/mascot/goudan-agent.png`}
              unoptimized
              width={112}
            />
            <div>
              <b>狗蛋陪学提示</b>
              <span>第一次来？从第一期找手感。已经会和 AI 对话？直接去第二期，把它叫来干活。</span>
            </div>
          </div>
        </div>

        <div className="vibe-course-grid" aria-label="Vibe Coding 课程选择">
          {courses.map((course) => (
            <article className="vibe-course-card" id={course.id} key={course.id}>
              <div className="vibe-course-card-top">
                <span>{course.eyebrow}</span>
                <Image
                  alt={course.alt}
                  height={1254}
                  src={`${basePath}${course.image}`}
                  unoptimized
                  width={1254}
                />
              </div>
              <h2><span aria-hidden="true">{course.icon}</span>{course.title}</h2>
              <p>{course.description}</p>
              <ul>
                {course.meta.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <a href={`#${course.id}`}>
                {course.action} <span>→</span>
              </a>
            </article>
          ))}
        </div>

        <p className="vibe-course-recommendation">
          不知道选哪门？<a href="#phase-one">先从第一期开始</a>，做出一个作品以后，狗蛋会在第二期等你。
        </p>
      </section>

      <footer className="vibe-course-footer">
        <strong>🐶 Minimum Agent Lab · Vibe Coding教程</strong>
        <span>少一点“等我学会”，多一点“先做出来”。</span>
      </footer>
    </main>
  );
}
