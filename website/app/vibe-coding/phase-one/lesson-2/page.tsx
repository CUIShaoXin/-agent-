import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "第2课：找到一个真问题｜Vibe Coding教程",
  description: "跟着狗蛋拆掉空想法，用具体场景、真实访谈和六个一问题卡，找到值得做也做得动的问题。",
};

const quizOne = [
  ["做一个万能校园 AI 助手，什么都能问。", "空想法"],
  ["帮第一次写社团推文的大一同学，把零散活动信息整理成推文初稿。", "真问题"],
  ["做一个 AI，自动帮所有大学生规划完美人生。", "空想法"],
  ["帮选课时纠结的同学，比较 3 门候选课的作业量和踩雷点。", "真问题"],
];

const interviewQuiz = [
  ["你是不是也觉得选课很麻烦，需要一个工具来帮忙？", "在诱导"],
  ["你上次选课是什么时候？当时卡得最久的是哪一步？", "好问题"],
  ["如果我做一个选课助手，你会不会用？", "在诱导"],
  ["你最后是怎么把这门课的踩雷点查清楚的？", "好问题"],
];

const sixOnes = [
  ["一人", "具体是谁？不能只写“大学生”", "例：第一次负责社团推文的大一同学"],
  ["一事", "他正在完成什么具体事情？", "例：把一场活动写成能发布的推文"],
  ["一痛", "哪一步最麻烦、费时间或容易错？", "例：活动信息散在几个群里，凑不齐也排不顺"],
  ["一旧办法", "他现在怎么凑合解决？", "例：翻聊天记录，再手动复制到文档里拼"],
  ["一证据", "你怎么知道这是真的？", "例：上周学姐为这件事忙到半夜，亲口抱怨过"],
  ["一小帮忙", "AI 只帮其中哪一步？", "例：只把零散信息整理成推文初稿"],
];

export default function VibeCodingLessonTwoPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const courseHref = `${basePath}/vibe-coding/#phase-one-map`;

  return (
    <main className="vibe-lesson-page vibe-phase2-page">
      <header className="vibe-lesson-header">
        <a href={courseHref} className="vibe-lesson-brand">
          <span><Image alt="狗蛋" height={52} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={52} /></span>
          <div><strong>Vibe Coding教程</strong><small>第一期 · 第 2 课</small></div>
        </a>
        <nav aria-label="课程关卡">
          {Array.from({ length: 6 }, (_, index) => <a href={`#stage-${index + 1}`} key={index}><b>{index + 1}</b><span>{["辨别", "具体", "访谈", "问题卡", "过滤", "行动"][index]}</span></a>)}
        </nav>
        <a className="vibe-lesson-exit" href={courseHref}>退出课程 ↗</a>
      </header>

      <div className="vibe-lesson-shell">
        <section className="vibe-lesson-hero vibe-phase2-hero">
          <div className="vibe-lesson-hero-copy">
            <span>第 2 课 · 探索问题</span>
            <h1>今天不碰代码。<br />先找到一个<em>真问题</em>。</h1>
            <p>第一课你学会了让 AI 写网页。但“会写”不等于“值得写”。这一课，狗蛋陪你像产品经理一样，把模糊点子变成具体、真实、做得动的问题。</p>
            <div><b>约 3 小时</b><b>无需写代码</b><b>带走问题卡</b></div>
            <a href="#stage-1">开始找问题 <strong>↓</strong></a>
          </div>
          <figure>
            <Image alt="狗蛋拿着放大镜寻找真实问题" height={1254} priority src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={1254} />
            <div className="vibe-phase2-orbit"><span>谁？</span><span>何时？</span><span>哪一步？</span></div>
            <figcaption><b>狗蛋：</b>AI 能做很多东西，也包括没人需要的东西。</figcaption>
          </figure>
        </section>

        <aside className="vibe-phase2-thesis"><span>空想法</span><p>“做一个什么都能干的 AI。”</p><i>→</i><span>真问题</span><p>“帮一个具体的人，在某一步少痛苦一点。”</p></aside>

        <section className="vibe-lesson-stage" id="stage-1">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>1</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>热身 · 约 25 分钟</span><h2>💭 拆掉“万能 AI”的幻想</h2><p>好项目不是“AI 帮我生成一切”，而是帮一个具体的人，在一个具体时刻，少痛苦一点。</p></header>
            <div className="vibe-phase2-quiz">
              <h3>练一练：它是真问题，还是空想法？</h3>
              {quizOne.map(([question, answer], index) => (
                <fieldset key={question}><legend>{question}</legend><label><input name={`idea-${index}`} type="radio" />真问题</label><label><input name={`idea-${index}`} type="radio" />空想法</label><small>狗蛋答案：{answer}</small></fieldset>
              ))}
            </div>
            <aside className="vibe-lesson-memory"><b>🎯 判断标准 · 1 / 4</b><strong>越万能，越容易没人真正需要。</strong><span>具体的人 · 真实发生 · 只帮一步</span></aside>
            <a className="vibe-lesson-next" href="#stage-2">把想法写具体 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-2">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>2</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>动手 · 约 25 分钟</span><h2>🔎 把想法改成具体场景</h2><p>补齐三件事：帮谁、在什么时候、解决哪一步。一个模糊方向，就会慢慢长出真实边界。</p></header>
            <div className="vibe-phase2-before-after"><article><span>模糊</span><p>做一个帮人吃饭的 AI。</p></article><b>→</b><article><span>具体</span><p>帮中午没时间纠结的同学，根据预算和忌口，在 3 秒内推荐一个食堂窗口。</p></article></div>
            <form className="vibe-phase2-form">
              <label><b>① 你的模糊想法</b><textarea placeholder="例：做一个帮人选课的 AI" rows={3} /></label>
              <label><b>② 改写成具体场景</b><textarea placeholder="帮谁 · 什么时候 · 解决哪一步" rows={4} /></label>
              <button type="button">让狗蛋挑挑刺 ↗</button>
            </form>
            <aside className="vibe-lesson-memory"><b>🎯 判断标准 · 2 / 4</b><strong>一个场景，必须能在脑海里演出来。</strong><span>谁出现了 · 什么时候发生 · 卡在哪一步</span></aside>
            <a className="vibe-lesson-next" href="#stage-3">去问问真人 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-3">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>3</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>关键 · 约 30 分钟</span><h2>🎤 学会问问题，不诱导</h2><p>别问“你会不会用”。去问上一次真实发生了什么，因为礼貌的赞同不是需求证据。</p></header>
            <div className="vibe-phase2-interview"><b>✅ 该问的 5 个问题</b><ol><li>你上次遇到这个麻烦是什么时候？</li><li>当时你具体在做什么？</li><li>哪一步最麻烦？</li><li>你最后怎么解决的？</li><li>如果工具只帮一步，你希望是哪一步？</li></ol></div>
            <div className="vibe-phase2-quiz compact">
              <h3>这句访谈问题，是好问题还是在诱导？</h3>
              {interviewQuiz.map(([question, answer], index) => (
                <fieldset key={question}><legend>{question}</legend><label><input name={`interview-${index}`} type="radio" />好问题</label><label><input name={`interview-${index}`} type="radio" />在诱导</label><small>狗蛋答案：{answer}</small></fieldset>
              ))}
            </div>
            <a className="vibe-lesson-next" href="#stage-4">填写问题卡 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-4">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>4</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>核心 · 约 35 分钟</span><h2>🧾 填满“六个一”问题卡</h2><p>填不出来的格子，就是还没想清楚的地方。别硬编答案，回去继续找人、找材料。</p></header>
            <form className="vibe-phase2-six-grid">
              {sixOnes.map(([label, placeholder, example]) => <label key={label}><span>{label}</span><b>{placeholder}</b><textarea rows={3} /><small>{example}</small></label>)}
            </form>
            <button className="vibe-phase2-coach" type="button">让狗蛋逐格挑刺 ↗</button>
            <aside className="vibe-lesson-memory"><b>🎯 判断标准 · 3 / 4</b><strong>证据不是“我觉得”，而是真人、原话和材料。</strong><span>见过 · 听过 · 留下过痕迹</span></aside>
            <a className="vibe-lesson-next" href="#stage-5">检查做不做得动 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-5">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>5</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>收口 · 约 25 分钟</span><h2>🧪 通过“做得动”过滤器</h2><p>问题是真的还不够，它还得小到你一个下午能够做出第一版。勾不上的，就继续缩小。</p></header>
            <div className="vibe-lesson-checklist vibe-phase2-filter">
              {[
                "它只帮一步，不包办一整件大事。",
                "用户会输入什么，我能说清楚。",
                "用户想要什么结果，我能描述出来。",
                "我能找到至少 5 个真实例子测试它。",
                "它不需要登录、海量数据或多人发布内容。",
              ].map((item, index) => <label key={item}><input type="checkbox" /><span><b>{index + 1}</b><strong>{item}</strong><small>勾不上没关系，把问题再缩小一点。</small></span></label>)}
            </div>
            <aside className="vibe-lesson-warning"><b>✂️ 狗蛋缩小术</b><p>“帮同学选课”太大，可以缩成“只比较 3 门候选课的作业量”。缩小不是退步，是把一个下午还给自己。</p></aside>
            <a className="vibe-lesson-next" href="#stage-6">制定这一周的计划 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-lesson-stage" id="stage-6">
          <div className="vibe-lesson-stage-no"><span>STEP</span><b>6</b></div>
          <div className="vibe-lesson-stage-body">
            <header><span>课后 · 约 20 分钟</span><h2>📅 这一周的孵化任务</h2><p>真正的功课发生在接下来一周：不写代码，带着问题去找真人、找原话、找真材料。</p></header>
            <div className="vibe-phase2-missions"><article><span>最低完成版</span><h3>一定要做到</h3><ul><li>访谈 2 个人，记下他们的原话</li><li>收集 3 条真实材料</li><li>带回 3 条测试样本</li></ul></article><article><span>完整挑战版</span><h3>有余力再加码</h3><ul><li>访谈 5 个人，收集 10 条材料</li><li>准备 5 条测试样本</li><li>写 3 篇问题小日记</li></ul></article></div>
            <form className="vibe-phase2-form"><label><b>我打算先访谈这些人</b><textarea placeholder="例：写过推文的张学姐、社团会长、隔壁宿舍的小李……" rows={4} /></label></form>
            <aside className="vibe-lesson-memory"><b>🎯 判断标准 · 4 / 4</b><strong>发现问题不对，就大胆换。</strong><span>换问题不丢人，带着假问题往下做才浪费时间。</span></aside>
            <a className="vibe-lesson-next" href="#problem-card">生成我的问题卡 <span>→</span></a>
          </div>
        </section>

        <section className="vibe-phase2-card" id="problem-card">
          <div className="vibe-phase2-card-top"><Image alt="狗蛋举起问题卡" height={220} src={`${basePath}/mascot/goudan-agent.png`} unoptimized width={220} /><div><span>🎉 第二课通关</span><h2>这是你的问题卡。</h2><p>完成上面的六个一后，把答案写进这张卡并截图保存。以后做任何项目，都先从它开始。</p></div></div>
          <dl>{sixOnes.map(([label]) => <div key={label}><dt>{label}</dt><dd>把你的答案写在这里</dd></div>)}</dl>
          <blockquote><b>记住这句</b>先找到一个具体的人、一个真实的痛。<br />问题对了，后面才值得做。</blockquote>
          <div className="vibe-phase2-card-actions"><a href={courseHref}>返回课程地图 →</a><a href="#stage-1">↺ 重新检查一遍</a></div>
        </section>
      </div>

      <footer className="vibe-lesson-footer"><strong>🐶 Minimum Agent Lab · Vibe Coding教程</strong><span>问题对了，做出来才有人要。</span></footer>
    </main>
  );
}
