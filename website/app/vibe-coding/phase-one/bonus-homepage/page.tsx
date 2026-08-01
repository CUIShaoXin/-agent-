import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "课间选修：做一个自己的个人主页｜Vibe Coding教程",
  description: "跟着狗蛋用 GitHub Pages 上线一个个人主页，把自我介绍和项目作品放进一个能分享的公开链接。",
};

const setupItems = [
  ["注册或登录 GitHub", "打开 github.com，完成注册或登录。已经有账号就直接使用。"],
  ["记住你的用户名", "右上角头像菜单里能看到用户名；下一步的仓库名必须和它完全一致。"],
  ["确认 AI 编程工具可用", "打开你在第 1 课用过的 Codex、Trae 或 WorkBuddy，确认可以继续对话。"],
];

export default function BonusHomepagePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const courseHref = `${basePath}/vibe-coding/#phase-one-map`;

  return (
    <main className="vibe-lesson-page vibe-bonus-page">
      <header className="vibe-lesson-header">
        <a href={courseHref} className="vibe-lesson-brand">
          <span><Image alt="狗蛋" height={52} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={52} /></span>
          <div><strong>Vibe Coding教程</strong><small>第一期 · 课间选修</small></div>
        </a>
        <nav aria-label="课程步骤">
          <a href="#stage-1"><b>1</b><span>账号</span></a>
          <a href="#stage-2"><b>2</b><span>仓库</span></a>
          <a href="#stage-3"><b>3</b><span>上线</span></a>
        </nav>
        <a className="vibe-lesson-exit" href={courseHref}>退出选修 ↗</a>
      </header>

      <div className="vibe-lesson-shell">
        <section className="vibe-lesson-hero vibe-bonus-hero">
          <div className="vibe-lesson-hero-copy">
            <span>学完第 1、2 课就能做 · 约 1 小时</span>
            <h1>做一个自己的个人主页，<br /><em>挂到网上去</em>。</h1>
            <p>先放好自我介绍和项目卡位。以后每做出一个作品，就把链接填进来——最后只发一个网址，也能让朋友或 HR 看懂你做过什么。</p>
            <div><b>免费上线</b><b>一个 HTML 文件</b><b>手机也能看</b></div>
            <a href="#stage-1">开始搭主页 <strong>↓</strong></a>
          </div>
          <figure>
            <div className="vibe-bonus-browser" aria-label="狗蛋个人主页预览">
              <div><i /><i /><i /><span>goudan.github.io</span></div>
              <section><Image alt="狗蛋头像" height={160} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={160} /><h2>你好，我是狗蛋</h2><p>我和 AI 一起，把小想法做成能用的项目。</p><nav><b>我的项目</b><b>关于我</b><b>联系我</b></nav></section>
            </div>
            <figcaption><b>狗蛋：</b>主页不是简历仓库，是让别人快速认识你的门牌。</figcaption>
          </figure>
        </section>

        <section className="vibe-bonus-concept">
          <header><span>先分清一个概念</span><h2>主页和 AI 工具，为什么上线方式不一样？</h2></header>
          <div><article><b>静态网站</b><h3>个人主页</h3><p>不登录、不调用 AI、不保存用户数据。适合免费的 GitHub Pages。</p><span>HTML + CSS → GitHub Pages</span></article><article><b>带服务器的网站</b><h3>AI 工具</h3><p>需要调用模型并藏好 API Key。后面的课程会使用支持服务器的平台。</p><span>前端 + 服务端 → Vercel 等平台</span></article></div>
        </section>

        <section className="vibe-lesson-stage" id="stage-1">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>1</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>准备 · 约 15 分钟</span><h2>🐙 先有一个 GitHub 账号</h2><p>GitHub 可以存放代码，也能把普通网页免费变成公开链接。准备完成一项，就勾掉一项。</p></header>
            <div className="vibe-lesson-checklist vibe-bonus-checklist">
              {setupItems.map(([title, copy], index) => <label key={title}><input type="checkbox" /><span><b>{index + 1}</b><strong>{title}</strong><small>{copy}</small></span></label>)}
            </div>
            <aside className="vibe-lesson-warning"><b>🧭 卡住时这样办</b><p>收不到邮件先看垃圾邮件；页面是英文可以用浏览器翻译；用户名建议使用容易记住的英文或拼音，不要把密码发给任何 AI。</p></aside>
            <a className="vibe-lesson-next" href="#stage-2">三件事准备好了 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-2">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>2</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>关键 · 约 15 分钟</span><h2>📦 建一个会变成网站的仓库</h2><p>GitHub 上放文件的地方叫“仓库”。仓库名字只要符合一条特殊规则，就会自动成为你的个人网站。</p></header>
            <div className="vibe-bonus-naming"><span>你的 GitHub 用户名</span><code>xiaoli2026</code><b>＋ .github.io</b><strong>xiaoli2026.github.io</strong></div>
            <aside className="vibe-bonus-alert"><b>⚠️ 名字必须一字不差</b><p>大小写和拼写错一个字符，网站就不会生效。请把示例里的 <code>xiaoli2026</code> 换成你自己的用户名。</p></aside>
            <ol className="vibe-lesson-steps vibe-bonus-repo-steps">
              <li><b>1</b><span>GitHub 右上角选择 <code>＋ → New repository</code>。</span></li>
              <li><b>2</b><span>仓库名称填写 <code>你的用户名.github.io</code>。</span></li>
              <li><b>3</b><span>选择 <code>Public</code>，勾选 <code>Add a README file</code>，然后创建。</span></li>
              <li><b>4</b><span>进入 <code>Settings → Pages</code>，在 Branch 选择 <code>main</code> 并保存。</span></li>
            </ol>
            <aside className="vibe-lesson-memory"><b>🎯 狗蛋检查点 · 1 / 2</b><strong>你的网址应该长这样：</strong><span>https://你的用户名.github.io</span></aside>
            <a className="vibe-lesson-next" href="#stage-3">仓库建好了 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-3">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>3</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>制作 · 约 25 分钟</span><h2>✨ 让 AI 把主页做出来</h2><p>你负责说清楚主页应该放什么，AI 负责生成文件。第一版不用惊艳，先让它能打开、能介绍你。</p></header>
            <div className="vibe-prompt-card vibe-bonus-prompt">
              <span>PROMPT · 把括号里的内容换成自己的</span>
              <p>请帮我做一个<mark>个人主页</mark>，单个 <code>index.html</code> 文件，不使用复杂框架。内容包括：① 我的名字和一句话介绍；② 我会什么、正在学什么；③ “我的项目”区域，先放 2～3 个占位卡片；④ 联系方式。要求<mark>简洁、好看、手机上也能正常浏览</mark>。最后一步步教我把文件上传到 <code>用户名.github.io</code> 仓库。</p>
            </div>
            <ol className="vibe-lesson-steps">
              <li><b>1</b><span>把提示词发给 AI 编程工具，让它生成 <code>index.html</code>。</span></li>
              <li><b>2</b><span>在电脑上双击打开文件，检查文字、图片和手机布局。</span></li>
              <li><b>3</b><span>把文件上传到 <code>用户名.github.io</code> 仓库，等待一两分钟。</span></li>
              <li><b>4</b><span>打开你的公开网址；不满意就继续告诉 AI 哪一处需要修改。</span></li>
            </ol>
            <form className="vibe-phase2-form vibe-bonus-form">
              <label><b>贴上你的主页链接</b><input placeholder="https://你的用户名.github.io" type="url" /></label>
              <label><b>写一版具体的自我介绍</b><textarea placeholder="我在学什么、做过什么、已经做出了哪些项目……" rows={5} /></label>
              <button type="button">让狗蛋看看自我介绍 ↗</button>
            </form>
            <aside className="vibe-lesson-memory"><b>🎯 狗蛋检查点 · 2 / 2</b><strong>自我介绍要写“做过什么”，别只写“热爱学习”。</strong><span>身份 · 正在学习 · 做出的项目 · 可以联系你的方式</span></aside>
            <a className="vibe-lesson-next" href="#bonus-complete">主页真的上线了 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-bonus-complete" id="bonus-complete">
          <div className="vibe-bonus-complete-visual"><Image alt="狗蛋庆祝个人主页上线" height={1254} src={`${basePath}/mascot/goudan-vibe-coding.png`} unoptimized width={1254} /><span>YOUR-NAME.GITHUB.IO</span></div>
          <div><span>🎉 完成课间选修</span><h2>你有一个自己的网站了。</h2><p>现在它还有点空——这很正常。它是一间刚拿到钥匙的新房子，等着被你的真实项目慢慢填满。</p><blockquote><b>记住这件事</b>个人主页用 GitHub Pages；需要隐藏 API Key 的 AI 工具，使用带服务端的平台。</blockquote><ul><li>第 3、4 课完成 AI 工具后，把公开链接放进“我的项目”。</li><li>项目卡写清楚解决了谁的什么问题，而不是只写技术名称。</li><li>以后投简历或介绍自己，直接发这一个主页链接。</li></ul><a href={courseHref}>返回课程地图 →</a></div>
        </section>
      </div>

      <footer className="vibe-lesson-footer"><strong>🐶 Minimum Agent Lab · Vibe Coding教程</strong><span>先有一个能放作品的地方，再慢慢把它填满。</span></footer>
    </main>
  );
}
