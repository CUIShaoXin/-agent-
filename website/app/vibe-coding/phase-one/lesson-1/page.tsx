import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "第1课：做出第一个网页｜Vibe Coding教程",
  description: "跟着狗蛋，只打字、不写代码，在约 30 分钟内做出第一个能在电脑上打开的小网页。",
};

const examples = [
  { icon: "📸", title: "狗蛋拍照卡", copy: "上传一张照片，生成可以分享的纪念卡。" },
  { icon: "🍔", title: "今天吃什么", copy: "按一下按钮，帮选择困难症决定菜单。" },
  { icon: "🌍", title: "世界灵感地图", copy: "点击一个城市，发现当地美食与新鲜事。" },
];

export default function VibeCodingLessonOnePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main className="vibe-lesson-page">
      <header className="vibe-lesson-header">
        <a href={`${basePath}/vibe-coding/#phase-one`} className="vibe-lesson-brand">
          <span><Image alt="狗蛋" height={52} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={52} /></span>
          <div><strong>Vibe Coding教程</strong><small>第一期 · 第 1 课</small></div>
        </a>
        <nav aria-label="课程关卡">
          <a href="#stage-0"><b>0</b><span>准备</span></a>
          <a href="#stage-1"><b>1</b><span>生成</span></a>
          <a href="#stage-2"><b>2</b><span>修改</span></a>
          <a href="#stage-3"><b>3</b><span>排错</span></a>
        </nav>
        <a className="vibe-lesson-exit" href={`${basePath}/vibe-coding/#phase-one`}>退出课程 ↗</a>
      </header>

      <div className="vibe-lesson-shell">
        <section className="vibe-lesson-hero">
          <div className="vibe-lesson-hero-copy">
            <span>第 1 课 · 快速入门</span>
            <h1>今天，不写代码。<br />先做出<em>第一个网页</em>。</h1>
            <p>这一课你全程只打字。你说想要什么，AI 帮你写代码；像点外卖一样，你负责说清楚，狗蛋陪你验收。</p>
            <div><b>约 30 分钟</b><b>零基础</b><b>电脑操作</b></div>
            <a href="#stage-0">好，开始 <strong>↓</strong></a>
          </div>
          <figure>
            <Image
              alt="狗蛋坐在电脑前做出第一个网页"
              height={1254}
              priority
              src={`${basePath}/mascot/goudan-vibe-coding.png`}
              unoptimized
              width={1254}
            />
            <figcaption><b>狗蛋：</b>做错了就改一句，进度不会跑掉。</figcaption>
          </figure>
        </section>

        <section className="vibe-lesson-showcase">
          <header><span>先看成品</span><h2>三种小网页，都是从一句话开始</h2><p>不用先懂 HTML、CSS 或 JavaScript。先看看终点，再开始第一步。</p></header>
          <div>
            {examples.map((example) => (
              <article key={example.title}><span>{example.icon}</span><h3>{example.title}</h3><p>{example.copy}</p><a href="#stage-1">看看怎么做 →</a></article>
            ))}
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-0">
          <div className="vibe-lesson-stage-no"><span>STAGE</span><b>0</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>最简单 · 约 10 分钟</span><h2>🧰 先准备工具</h2><p>做菜先找锅。这一关只做一件事：准备一个能听懂中文、替你写文件的 AI 编程工具。</p></header>
            <div className="vibe-lesson-checklist">
              <label><input type="checkbox" /><span><b>1</b><strong>选择并安装工具</strong><small>Codex、Trae、WorkBuddy 等任选一个，跟随工具提示完成登录。</small></span></label>
              <label><input type="checkbox" /><span><b>2</b><strong>选择一个可用模型</strong><small>在模型或设置页面选择擅长编程的模型，不确定就使用工具推荐项。</small></span></label>
              <label><input type="checkbox" /><span><b>3</b><strong>新建项目文件夹</strong><small>在桌面创建 <code>my-first-app</code>，再让 AI 编程工具打开它。</small></span></label>
            </div>
            <aside className="vibe-lesson-warning"><b>🔐 狗蛋安全提醒</b><p>API Key 像钱包密码：可以填进可信工具，但不要发到群里、截图里或网页文件中。</p></aside>
            <a className="vibe-lesson-next" href="#stage-1">工具准备好了 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-1">
          <div className="vibe-lesson-stage-no"><span>STAGE</span><b>1</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>简单 · 约 10 分钟</span><h2>🐣 做出第一个网页</h2><p>秘诀只有一个：不要让 AI 猜。一次说清楚给谁用、用户做什么、生成什么，以及什么不能改。</p></header>
            <div className="vibe-prompt-card">
              <span>PROMPT · 可以直接复制</span>
              <p>做一个网页，<mark>让用户上传一张照片</mark>，然后<mark>生成一张带狗蛋贴纸的纪念卡</mark>。要求：<mark>照片不能拉伸变形</mark>、卡片铺满画面、<mark>页面上不要出现复杂说明</mark>。</p>
              <div><b>用户动作</b><b>最终结果</b><b>限制条件</b><b>验收标准</b></div>
            </div>
            <div className="vibe-prompt-compare">
              <article><span>❌ 容易让 AI 猜错</span><p>“帮我做个图片网站。”</p><small>缺少用户、动作、结果和限制，AI 只能自由发挥。</small></article>
              <article><span>✅ 更容易一次做对</span><p>“做一个上传照片并生成狗蛋纪念卡的网页……”</p><small>目标清楚、边界清楚，第一版更接近你想要的效果。</small></article>
            </div>
            <ol className="vibe-lesson-steps">
              <li><b>1</b><span>确认工具打开的是 <code>my-first-app</code> 文件夹。</span></li>
              <li><b>2</b><span>复制上面的需求，改成你真正想做的主题。</span></li>
              <li><b>3</b><span>发送后允许工具新建文件，等它完成第一版。</span></li>
              <li><b>4</b><span>双击文件夹里的 <code>index.html</code>，在浏览器里查看结果。</span></li>
            </ol>
            <aside className="vibe-lesson-memory"><b>🎯 记住这句 · 1 / 3</b><strong>需求一次说清楚，比说得多更重要。</strong><span>给谁用 · 用户做什么 · 生成什么 · 什么不能改</span></aside>
            <a className="vibe-lesson-next" href="#stage-2">我做出第一个网页了 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-2">
          <div className="vibe-lesson-stage-no"><span>STAGE</span><b>2</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>中等 · 约 8 分钟</span><h2>🪄 学会“改”和“问”</h2><p>第一版不完美非常正常。你负责拿主意，AI 负责继续修改。</p></header>
            <div className="vibe-lesson-accordions">
              <details open><summary>① 先要方案，别急着让它写 <span>＋</span></summary><p>告诉 AI：“先给我三个实现方案，说明各自优缺点，等我选完再修改。”</p></details>
              <details><summary>② 指给它看现成的东西 <span>＋</span></summary><p>截图、文件名、具体位置都比“这里不好看”更有用。</p></details>
              <details><summary>③ 让它检查自己 <span>＋</span></summary><p>修改后要求 AI 重新运行、检查报错，并列出它实际改了什么。</p></details>
              <details><summary>④ 一次只改一件事 <span>＋</span></summary><p>先改颜色，再改布局；问题越小，结果越容易验证。</p></details>
            </div>
            <aside className="vibe-lesson-memory"><b>🎯 记住这句 · 2 / 3</b><strong>你负责拿主意，写代码交给 AI。</strong><span>说清目标 · 选定方案 · 检查结果</span></aside>
            <a className="vibe-lesson-next" href="#stage-3">这四个习惯我记住了 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-3">
          <div className="vibe-lesson-stage-no"><span>STAGE</span><b>3</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>稍难 · 约 8 分钟</span><h2>🧯 遇到问题不慌</h2><p>屏幕突然蹦出一堆英文怎么办？你不需要读懂它，只需要把现场完整交给 AI。</p></header>
            <div className="vibe-error-box"><span>TERMINAL · ERROR</span><code>TypeError: Cannot read properties of undefined<br />at app.js:42:18</code></div>
            <div className="vibe-error-prompt"><b>万能排错提示词</b><p>“运行后出现了下面的错误。请先解释最可能的原因，再检查相关文件并修复。修复后请重新验证，不要修改无关功能。”</p></div>
            <aside className="vibe-lesson-memory"><b>🎯 记住这句 · 3 / 3</b><strong>报错不可怕，把完整信息交给 AI。</strong><span>复制错误 · 描述刚才做了什么 · 让它修复后重新验证</span></aside>
            <a className="vibe-lesson-next" href="#lesson-complete">我不怕报错了 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-complete" id="lesson-complete">
          <Image alt="狗蛋庆祝完成第一课" height={1254} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={1254} />
          <div><span>🎉 第一课通关</span><h2>你已经知道怎么开始了。</h2><p>说清需求、自己拿主意、报错交给 AI——这三件事，就是从“改很多次”到“说几句话”的开始。</p><a href={`${basePath}/vibe-coding/#phase-one-map`}>返回课程地图，继续第 2 课 →</a></div>
        </section>
      </div>

      <footer className="vibe-lesson-footer"><strong>🐶 Minimum Agent Lab · Vibe Coding教程</strong><span>能开始，比一次做很大更重要。</span></footer>
    </main>
  );
}
