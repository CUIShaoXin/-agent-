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
    href: "#phase-one",
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
    href: "#course-phase-two",
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
            <article className="vibe-course-card" id={`course-${course.id}`} key={course.id}>
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
              <a href={course.href}>
                {course.action} <span>→</span>
              </a>
            </article>
          ))}
        </div>

        <p className="vibe-course-recommendation">
          不知道选哪门？<a href="#phase-one">先从第一期开始</a>，做出一个作品以后，狗蛋会在第二期等你。
        </p>
      </section>

      <section className="vibe-phase-one" id="phase-one">
        <div className="vibe-phase-shell">
          <a className="vibe-phase-back" href={`${basePath}/vibe-coding/`}>
            ← 返回课程选择
          </a>

          <header className="vibe-phase-hero">
            <div>
              <span>第一期 · 零基础上手</span>
              <h1>做一个能发给朋友的<br /><em>小网站</em></h1>
              <p>不背术语，不先学一整套代码。跟着狗蛋用 AI 编程工具，把一个小想法变成真正能打开、能分享的网页。</p>
              <a href="#phase-one-map">从第 1 课开始 <b>→</b></a>
              <small>约 30 分钟入门 · 需要一台电脑 · Windows / macOS 都可以</small>
            </div>
            <figure>
              <Image
                alt="狗蛋坐在电脑前带你开始 Vibe Coding"
                height={1254}
                priority
                src={`${basePath}/mascot/goudan-vibe-coding.png`}
                unoptimized
                width={1254}
              />
              <figcaption>GOUDAN · YOUR AI CODING BUDDY</figcaption>
            </figure>
          </header>

          <section className="vibe-phase-playground">
            <div className="vibe-phase-heading">
              <span>先玩一下</span>
              <h2>这三个都是你能做出来的小东西</h2>
              <p>点子不用宏大，先让页面真的动起来。第一份成就感，比第一百页教程更重要。</p>
            </div>
            <div className="vibe-mini-projects">
              <article><span>📸</span><h3>狗蛋拍照卡</h3><p>做一张能换照片、写祝福的分享卡片。</p><a href="#phase-one-map">怎么玩 →</a></article>
              <article><span>🍔</span><h3>今天吃什么</h3><p>点一下，帮选择困难症随机决定菜单。</p><a href="#phase-one-map">怎么玩 →</a></article>
              <article><span>🌍</span><h3>世界灵感地图</h3><p>点击城市，发现一道当地美食或新鲜事。</p><a href="#phase-one-map">怎么玩 →</a></article>
            </div>
            <a className="vibe-phase-start" href="#phase-one-map">▶ 从第 1 课开始，自己做一个</a>
          </section>

          <section className="vibe-phase-outcome">
            <div className="vibe-phase-heading">
              <span>学完带走</span>
              <h2>玩过了？那再往下看</h2>
              <p>刚才只是热身。完整门课会带你走完“想法 → 制作 → 上线 → 分享”的第一圈。</p>
            </div>
            <div className="vibe-phase-outcome-visual">
              <Image
                alt="狗蛋陪你走完从想法到上线的学习路线"
                height={1254}
                src={`${basePath}/mascot/goudan-agent.png`}
                unoptimized
                width={1254}
              />
              <div><span>IDEA</span><i>→</i><span>BUILD</span><i>→</i><span>SHIP</span></div>
            </div>
            <div className="vibe-phase-takeaways">
              <b>不是学“会用 AI”，而是带走能反复用的本事</b>
              <ul>
                <li><strong>一个真实上线的网站</strong>，有链接，也能发给朋友。</li>
                <li><strong>一份作品说明</strong>，能用一句话讲清它解决什么问题。</li>
                <li><strong>一套排错方法</strong>，知道如何描述问题、让 AI 帮你继续。</li>
                <li><strong>三个习惯</strong>：先说目标、拆小步骤、每一步都验证。</li>
              </ul>
            </div>
          </section>

          <section className="vibe-phase-rhythm">
            <div className="vibe-phase-heading">
              <span>学习节奏</span>
              <h2>两个周末，完成第一次上线</h2>
              <p>四节正课放在周末，中间留一周慢慢打磨；不用每天追进度，但每次都留下看得见的成果。</p>
            </div>
            <div className="vibe-rhythm-board">
              <div><b>周六 ①</b><strong>快速入门</strong><span>装好工具，做出第一个网页</span></div>
              <div><b>周日 ①</b><strong>探索问题</strong><span>像产品经理一样找到真实需求</span></div>
              <div className="vibe-rhythm-break"><b>工作日</b><strong>孵化周</strong><span>带着问题去访谈、收集素材，不用写代码</span></div>
              <div><b>周六 ②</b><strong>搭建工具</strong><span>把问题做成一个会调用 AI 的小应用</span></div>
              <div><b>周日 ②</b><strong>部署上线</strong><span>变成一个能分享给朋友的链接</span></div>
            </div>
          </section>

          <section className="vibe-phase-map" id="phase-one-map">
            <div className="vibe-phase-heading">
              <span>课程地图</span>
              <h2>从第一行提示词，到第一个公开链接</h2>
            </div>
            <div className="vibe-phase-lessons">
              <article><span>第 1 课 · 周六 ①</span><h3>🐣 快速入门：做出第一个网页</h3><p>只打字、不写代码，做出第一个能在电脑上打开的网页，约 30 分钟。</p><a href="#phase-one-map">进入第 1 课 →</a></article>
              <article><span>第 2 课 · 周日 ①</span><h3>🔎 找到一个真问题</h3><p>不碰代码，用“六个一”框架找到真正值得做、你也做得到的问题。</p><a href="#phase-one-map">进入第 2 课 →</a></article>
              <article className="vibe-phase-project"><span>课间选修 · 学完前两课</span><h3>🏠 做一个自己的个人主页</h3><p>用 AI 编程工具做一个公开的个人主页，练习把内容组织成能被别人看懂的作品。</p><a href="#phase-one-map">进入课间选修 →</a></article>
              <article><span>第 3 课 · 周六 ②</span><h3>🛠️ 做一个真能用的 AI 工具</h3><p>把问题卡做成会调用 AI、能处理失败、被真实样本验证过的小应用。</p><a href="#phase-one-map">进入第 3 课 →</a></article>
              <article><span>第 4 课 · 周日 ②</span><h3>🚀 部署上线，变成一个链接</h3><p>上线到托管平台，打磨简历和作品页，收集第一条真实反馈。</p><a href="#phase-one-map">进入第 4 课 →</a></article>
            </div>
          </section>

          <aside className="vibe-phase-next">
            <div><span>学完这期，还想更进一步？</span><h2>让 AI 从“会聊天”升级成你的实习生</h2><p>带上自己的材料，进入第二期，把重复工作真正交给 AI。</p></div>
            <a href={`${basePath}/vibe-coding/#course-phase-two`}>看看第二期 →</a>
          </aside>
        </div>
      </section>

      <footer className="vibe-course-footer">
        <strong>🐶 Minimum Agent Lab · Vibe Coding教程</strong>
        <span>少一点“等我学会”，多一点“先做出来”。</span>
      </footer>
    </main>
  );
}
