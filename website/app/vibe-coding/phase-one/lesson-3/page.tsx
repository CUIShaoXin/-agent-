import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "第3课：做一个真能用的 AI 工具｜Vibe Coding教程",
  description: "跟着狗蛋把问题卡做成会调用 AI、能处理失败，并经过真实样本验证的小工具。",
};

const templates = [
  ["🍜", "食堂选择助手", "预算、口味、忌口 → 3 个窗口建议和理由"],
  ["📝", "社团推文助手", "活动信息 → 标题备选、正文初稿、缺失信息"],
  ["📖", "读书会准备器", "文本或笔记 → 讨论问题、关键矛盾、追问点"],
  ["🎯", "课程选题陪跑器", "兴趣和要求 → 3 个选题、资料方向、风险"],
];

const scoreSamples = [1, 2, 3, 4, 5];

export default function VibeCodingLessonThreePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const courseHref = `${basePath}/vibe-coding/#phase-one-map`;

  return (
    <main className="vibe-lesson-page vibe-lesson3-page">
      <header className="vibe-lesson-header">
        <a href={courseHref} className="vibe-lesson-brand"><span><Image alt="狗蛋" height={52} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={52} /></span><div><strong>Vibe Coding教程</strong><small>第一期 · 第 3 课</small></div></a>
        <nav aria-label="课程关卡">{Array.from({ length: 7 }, (_, index) => <a href={`#stage-${index + 1}`} key={index}><b>{index + 1}</b><span>{["模板", "输入", "输出", "提示词", "接入", "兜底", "测试"][index]}</span></a>)}</nav>
        <a className="vibe-lesson-exit" href={courseHref}>退出课程 ↗</a>
      </header>

      <div className="vibe-lesson-shell">
        <section className="vibe-lesson-hero vibe-lesson3-hero">
          <div className="vibe-lesson-hero-copy"><span>第 3 课 · 做一个会调用 AI 的工具</span><h1>把你的问题卡，<br />变成一个<em>真能用的 AI 工具</em>。</h1><p>第二课找到了真实问题，今天就让它动起来：接收用户输入、交给 AI 思考、返回有用结果，并在出错时给出体面的提示。</p><div><b>约 3 小时</b><b>无需手写代码</b><b>准备 3～5 条样本</b></div><a href="#stage-1">开始搭工具 <strong>↓</strong></a></div>
          <figure><div className="vibe-lesson3-flow"><article><span>USER</span><b>用户输入</b></article><i>→</i><article><Image alt="狗蛋 AI 核心" height={150} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={150} /><b>AI 思考</b></article><i>→</i><article><span>RESULT</span><b>有用结果</b></article></div><figcaption><b>狗蛋：</b>第一课的网页会展示；今天的工具还要会思考。</figcaption></figure>
        </section>

        <aside className="vibe-lesson3-prepare"><b>开工前准备</b><span>第二课的问题卡</span><span>至少 3 条真实测试样本</span><span>可用的 AI 编程工具</span></aside>

        <section className="vibe-lesson-stage" id="stage-1"><div className="vibe-lesson-stage-no"><span>STEP</span><b>1</b></div><div className="vibe-lesson-stage-body">
          <header><span>定方向 · 约 25 分钟</span><h2>🧩 确认问题，选一个模板</h2><p>先照抄问题卡里的“一人 + 一痛 + 一小帮忙”。纯新手第一次做，不从空白自由发挥。</p></header>
          <form className="vibe-phase2-form"><label><b>我的工具要帮谁、解决哪一步？</b><textarea placeholder="例：帮第一次写推文的大一同学，把零散活动信息整理成推文初稿" rows={4} /></label></form>
          <div className="vibe-lesson3-templates">{templates.map(([icon, title, copy]) => <label key={title}><input name="template" type="radio" /><span>{icon}</span><b>{title}</b><small>{copy}</small></label>)}</div>
          <aside className="vibe-lesson-memory"><b>🎯 狗蛋检查点 · 1 / 4</b><strong>一次只解决一个场景。</strong><span>用户越具体 · 痛点越真实 · 第一版越容易做完</span></aside><a className="vibe-lesson-next" href="#stage-2">设计用户输入 <span>→</span></a>
        </div></section>

        <section className="vibe-lesson-stage" id="stage-2"><div className="vibe-lesson-stage-no"><span>STEP</span><b>2</b></div><div className="vibe-lesson-stage-body">
          <header><span>设计 · 约 25 分钟</span><h2>⌨️ 用户要填什么？</h2><p>AI 需要用户给它一些信息，这叫输入。规矩只有一条：最多 6 个填写框，越少越好。</p></header>
          <div className="vibe-lesson3-rule"><strong>每多一个填写框，</strong><span>就少一个人愿意用。</span><b>MAX 6</b></div>
          <form className="vibe-phase2-form"><label><b>用户要填写的内容（一行一个）</b><textarea placeholder={'例：\n预算\n口味偏好\n有没有忌口\n现在几点'} rows={7} /></label><button type="button">让狗蛋看看我的输入 ↗</button></form>
          <a className="vibe-lesson-next" href="#stage-3">设计 AI 输出 <span>→</span></a>
        </div></section>

        <section className="vibe-lesson-stage" id="stage-3"><div className="vibe-lesson-stage-no"><span>STEP</span><b>3</b></div><div className="vibe-lesson-stage-body">
          <header><span>收口 · 约 25 分钟</span><h2>📤 AI 要给出什么？</h2><p>用户填完，AI 要还给他一个能直接使用的结果。最多 3 个模块，不要用一大段漂亮废话糊住用户。</p></header>
          <div className="vibe-prompt-compare"><article><span>❌ AI Slop</span><p>一大段华丽、丰富却没有行动方向的文字。</p><small>用户读完仍然不知道下一步做什么。</small></article><article><span>✅ 能用的输出</span><p>① 推荐结果　② 一句话理由　③ 一个备选方案</p><small>短、具体，用户拿到就能行动。</small></article></div>
          <form className="vibe-phase2-form"><label><b>AI 要返回的结果（一行一个，最多 3 行）</b><textarea placeholder={'例：\n推荐的 3 个食堂窗口\n每个窗口的一句话理由\n都不合适时的调整建议'} rows={6} /></label><button type="button">让狗蛋看看我的输出 ↗</button></form>
          <aside className="vibe-lesson-memory"><b>🎯 狗蛋检查点 · 2 / 4</b><strong>结果不是越多越好，是越能用越好。</strong><span>结论 · 理由 · 下一步</span></aside><a className="vibe-lesson-next" href="#stage-4">写 AI 说明书 <span>→</span></a>
        </div></section>

        <section className="vibe-lesson-stage" id="stage-4"><div className="vibe-lesson-stage-no"><span>STEP</span><b>4</b></div><div className="vibe-lesson-stage-body">
          <header><span>核心 · 约 35 分钟</span><h2>📋 写一份“给 AI 的说明书”</h2><p>系统提示词会告诉 AI：它是谁、要做什么、不能做什么，以及按什么格式回答。</p></header>
          <form className="vibe-lesson3-system"><label><span>01</span><b>角色</b><input placeholder="你是一个帮社团新人写推文的助手" /></label><label><span>02</span><b>任务</b><input placeholder="根据活动信息生成推文初稿和标题" /></label><label><span>03</span><b>边界</b><input placeholder="只使用用户提供的信息，不允许编造" /></label><label><span>04</span><b>输出格式</b><input placeholder="标题备选、推文正文、缺失信息" /></label></form>
          <div className="vibe-lesson3-system-preview"><span>SYSTEM PROMPT</span><p><b>【角色】</b>你是……<br /><b>【任务】</b>根据用户输入……<br /><b>【边界】</b>信息不足时直接说明，不允许编造。<br /><b>【输出格式】</b>严格按三个模块回答。</p></div>
          <aside className="vibe-lesson-warning"><b>⚠️ 边界最重要</b><p>不写边界，AI 可能在信息不足时自信地编答案。明确告诉它什么时候必须说“信息不足”。</p></aside><a className="vibe-lesson-next" href="#stage-5">让网页接上 AI <span>→</span></a>
        </div></section>

        <section className="vibe-lesson-stage" id="stage-5"><div className="vibe-lesson-stage-no"><span>STEP</span><b>5</b></div><div className="vibe-lesson-stage-body">
          <header><span>连接 · 约 30 分钟</span><h2>🔌 让网页真的会调用 AI</h2><p>网页负责收集和展示，后台负责调用 AI 并保管钥匙。这一来一回，就是 API 调用。</p></header>
          <div className="vibe-lesson3-architecture"><article><b>浏览器</b><span>表单与结果</span></article><i>请求 →</i><article><b>你的后台</b><span>保管钥匙</span></article><i>请求 →</i><article><b>AI 服务</b><span>生成回答</span></article></div>
          <div className="vibe-prompt-card"><span>PROMPT · 发给 AI 编程工具</span><p>请帮我做一个网页小工具。<mark>用户输入</mark>：（贴第 2 步）；<mark>需要生成的结果</mark>：（贴第 3 步）；<mark>系统提示词</mark>：（贴第 4 步）。请调用 AI 接口生成结果。<strong>API Key 不得写进网页文件</strong>，请放进 <code>.env</code>，由后台代码调用，并告诉我如何在本机运行。</p></div>
          <aside className="vibe-lesson3-key"><span>PUBLIC</span><b>网页代码</b><i>绝不放钥匙</i><span>PRIVATE</span><b>.env 文件</b><i>只放自己电脑</i></aside>
          <form className="vibe-phase2-form"><label><b>第一次运行结果</b><textarea placeholder="例：成功返回 3 个推荐；或：遇到报错，准备下一步处理" rows={3} /></label></form>
          <a className="vibe-lesson-next" href="#stage-6">给工具加兜底 <span>→</span></a>
        </div></section>

        <section className="vibe-lesson-stage" id="stage-6"><div className="vibe-lesson-stage-no"><span>STEP</span><b>6</b></div><div className="vibe-lesson-stage-body">
          <header><span>可靠 · 约 25 分钟</span><h2>🛟 让它“出错也不难看”</h2><p>真工具和临时演示品的区别，往往不是成功时多漂亮，而是失败时还让用户知道发生了什么。</p></header>
          <div className="vibe-lesson3-fallbacks"><article><span>01</span><b>等待状态</b><p>AI 返回前显示“正在生成…”，不要让页面像卡死。</p></article><article><span>02</span><b>失败提示</b><p>解释网络有点忙，并提供清楚可见的“重试”按钮。</p></article><article><span>03</span><b>输入校验</b><p>用户什么都没填时，先提醒补全必要内容。</p></article></div>
          <div className="vibe-error-box"><span>友好失败示例</span><code>狗蛋暂时没接到 AI 的回复。<br />请检查网络，或稍后点击「重新生成」。</code></div>
          <form className="vibe-phase2-form"><label><b>记下你的失败测试结果</b><textarea placeholder="例：把测试 Key 改错后，页面会显示友好提示和重试按钮" rows={3} /></label></form>
          <a className="vibe-lesson-next" href="#stage-7">用真实样本验收 <span>→</span></a>
        </div></section>

        <section className="vibe-lesson-stage" id="stage-7"><div className="vibe-lesson-stage-no"><span>STEP</span><b>7</b></div><div className="vibe-lesson-stage-body">
          <header><span>验收 · 约 25 分钟</span><h2>🧪 用真实样本打分</h2><p>工具能跑不等于好用。拿孵化周收集的真实材料逐条测试，至少评 3 条，有 5 条就全部测完。</p></header>
          <div className="vibe-lesson3-scores">{scoreSamples.map((sample) => <fieldset key={sample}><legend>样本 {sample}</legend><input aria-label={`样本 ${sample} 的输入`} placeholder="简单记下这条真实输入" /><label><input name={`score-${sample}`} type="radio" />好</label><label><input name={`score-${sample}`} type="radio" />凑合</label><label><input name={`score-${sample}`} type="radio" />差</label></fieldset>)}</div>
          <aside className="vibe-lesson-memory"><b>🎯 狗蛋检查点 · 4 / 4</b><strong>能跑 ≠ 好用。</strong><span>用真实样本打分，才知道它到底行不行。</span></aside><a className="vibe-lesson-next" href="#lesson3-complete">完成第三课 <span>→</span></a>
        </div></section>

        <section className="vibe-lesson3-complete" id="lesson3-complete"><Image alt="狗蛋完成一个 AI 工具" height={1254} src={`${basePath}/mascot/goudan-vibe-coding.png`} unoptimized width={1254} /><div><span>🎉 第三课通关</span><h2>你做出了一个真能用的 AI 工具。</h2><p>它会接收输入、调用 AI、处理失败，并被真实样本验证过。这已经不只是一个看起来很酷的玩具。</p><dl><div><dt>用户输入</dt><dd>清楚、必要、不超过 6 项</dd></div><div><dt>AI 输出</dt><dd>最多 3 个可行动模块</dd></div><div><dt>失败兜底</dt><dd>等待、报错、重试和校验</dd></div><div><dt>真实验证</dt><dd>至少 3 条样本完成评分</dd></div></dl><blockquote>下一课：把这个只能在你电脑打开的工具，变成全世界都能访问的链接。</blockquote><a href={courseHref}>返回课程地图 →</a></div></section>
      </div>
      <footer className="vibe-lesson-footer"><strong>🐶 Minimum Agent Lab · Vibe Coding教程</strong><span>能跑只是开始，好用才是本事。</span></footer>
    </main>
  );
}
