export interface CourseQuiz {
  question: string;
  options: Array<{ id: "a" | "b"; label: string }>;
  answer: "a" | "b";
  explanation: string;
}

export interface CourseFlow {
  title: string;
  steps: string[];
  caption: string;
}

export interface CourseSession {
  number: number;
  slug: `session-${number}`;
  title: string;
  eyebrow: string;
  description: string;
  goudanTip: string;
  objective: string;
  lessons: string[];
  tags: string[];
  accent: string;
  flows: CourseFlow[];
  quiz: CourseQuiz;
  code: string;
  codeResult: string[];
  trace: string[];
}

export const courseSessions: CourseSession[] = [
  {
    number: 1,
    slug: "session-1",
    title: "Agent基础认知",
    eyebrow: "FOUNDATION",
    description: "理解 LLM 和 Agent 区别，掌握 Agent 核心组成。",
    goudanTip: "开始写代码之前，我们先理解：为什么普通 LLM 还不能称为 Agent？",
    objective: "理解为什么普通 LLM 难以独立完成复杂任务，以及 Agent 如何通过规划、行动和反馈持续推进目标。",
    lessons: ["LLM是什么", "Agent是什么", "LLM和Agent区别", "Agent基本组成"],
    tags: ["LLM", "Agent", "Reasoning", "Action"],
    accent: "violet",
    flows: [
      { title: "普通 LLM", steps: ["User", "Prompt", "LLM", "Answer"], caption: "一次输入，一次生成" },
      { title: "Agent", steps: ["Goal", "Think", "Act", "Observe", "Answer"], caption: "根据环境反馈循环执行" },
    ],
    quiz: {
      question: "以下哪个属于 Agent？",
      options: [
        { id: "a", label: "输入 Prompt，直接生成文本。" },
        { id: "b", label: "根据目标规划步骤，并调用工具完成任务。" },
      ],
      answer: "b",
      explanation: "Agent 不仅生成文本，还具备规划、行动、观察和根据反馈继续执行的能力。",
    },
    code: `goal = "查询天气并创建提醒"\n\nwhile not task_done:\n    action = agent.think(goal, observations)\n    observation = tools.execute(action)\n    observations.append(observation)`,
    codeResult: ["Goal: 查询天气并创建提醒", "Think: 需要天气与待办工具", "Act: weather → todo", "Answer: 任务已完成"],
    trace: ["User Input", "Reasoning", "Action", "Observation", "Final Answer"],
  },
  {
    number: 2,
    slug: "session-2",
    title: "Agent Loop",
    eyebrow: "THE LOOP",
    description: "学习 Agent 核心循环，理解 Thought、Action、Observation。",
    goudanTip: "真正的 Agent 不会只回答一次。它会思考、行动、观察，然后继续循环。",
    objective: "掌握 ReAct 思想以及 Agent 如何在最大轮次限制内持续决策，直到得到最终答案。",
    lessons: ["ReAct思想", "Thought", "Action", "Observation", "Agent执行循环"],
    tags: ["ReAct", "Thought", "Observation", "Max Steps"],
    accent: "orange",
    flows: [
      { title: "Agent Loop", steps: ["Input", "Thought", "Action", "Observation", "Decision"], caption: "未完成则进入下一轮" },
      { title: "Stop Condition", steps: ["Answer Ready", "Save Memory", "Return"], caption: "完成后安全退出循环" },
    ],
    quiz: {
      question: "工具返回结果后，Runtime 下一步应该做什么？",
      options: [
        { id: "a", label: "直接把原始工具结果返回给用户。" },
        { id: "b", label: "把 Observation 回填给模型，让模型继续决策。" },
      ],
      answer: "b",
      explanation: "工具结果是新的 Observation，需要重新交给模型判断继续调用工具还是生成最终答案。",
    },
    code: `for step in range(max_steps):\n    decision = llm.complete(context, tools=schemas)\n    if decision.tool_calls:\n        context += execute(decision.tool_calls)\n        continue\n    return decision.final_answer`,
    codeResult: ["Step 1: Thinking", "Step 2: Tool Call", "Step 3: Observation", "Step 4: Final Answer"],
    trace: ["Run Start", "LLM Decision", "Tool Call", "Observation", "Run End"],
  },
  {
    number: 3,
    slug: "session-3",
    title: "Tool Calling",
    eyebrow: "TOOLS",
    description: "学习 Function Calling、Tool Schema、工具注册。",
    goudanTip: "Agent 最大的能力之一，就是通过工具连接外部世界。",
    objective: "理解工具名称、描述、参数 Schema 与执行函数如何组成可被模型自主选择的能力。",
    lessons: ["Function Calling", "MCP", "外部工具调用", "Schema设计"],
    tags: ["Function Calling", "MCP", "JSON Schema", "Registry"],
    accent: "blue",
    flows: [
      { title: "工具注册", steps: ["Name", "Description", "Schema", "Handler"], caption: "注册后形成模型可见的能力清单" },
      { title: "工具执行", steps: ["Select", "Validate", "Execute", "Result"], caption: "Runtime 校验参数并捕获异常" },
    ],
    quiz: {
      question: "Tool Schema 最重要的作用是什么？",
      options: [
        { id: "a", label: "让按钮看起来更漂亮。" },
        { id: "b", label: "告诉模型工具能力和参数结构，并支持运行时校验。" },
      ],
      answer: "b",
      explanation: "Schema 是工具的能力说明书，也是 Runtime 校验模型参数的契约。",
    },
    code: `registry.register(Tool(\n    name="weather",\n    description="查询城市天气",\n    parameters={\n        "type": "object",\n        "properties": {"city": {"type": "string"}},\n        "required": ["city"]\n    },\n    handler=weather_tool,\n))`,
    codeResult: ["User: 查询北京天气", "Thought: 需要天气信息", "Action: weather_tool(city=北京)", "Observation: 北京 25℃ 晴", "Answer: 今天北京天气晴朗"],
    trace: ["User Input", "Tool Selection", "Arguments Check", "Tool Execute", "Observation", "Answer"],
  },
  {
    number: 4,
    slug: "session-4",
    title: "Memory",
    eyebrow: "MEMORY",
    description: "学习 Session Memory、长期记忆、Checkpoint。",
    goudanTip: "没有记忆的 Agent，无法真正理解用户，也无法延续任务。",
    objective: "掌握用 user_id 与 session_id 隔离会话，并在合适的时间召回短期与长期记忆。",
    lessons: ["短期记忆", "长期记忆", "Session管理", "Redis Checkpoint"],
    tags: ["Session", "Short Memory", "Long Memory", "Checkpoint"],
    accent: "green",
    flows: [
      { title: "写入记忆", steps: ["Message", "Session Key", "Checkpoint", "Store"], caption: "每个窗口独立保存" },
      { title: "召回记忆", steps: ["User + Session", "Summary", "Recent Messages", "Context"], caption: "只召回当前会话需要的信息" },
    ],
    quiz: {
      question: "同一用户的两个聊天窗口应该如何保存 Memory？",
      options: [
        { id: "a", label: "全部写进同一份历史消息。" },
        { id: "b", label: "使用不同 session_id 隔离，并按窗口独立召回。" },
      ],
      answer: "b",
      explanation: "user_id 表示用户，session_id 表示具体窗口；双键可以避免不同任务互相污染。",
    },
    code: `session = store.load(user_id, session_id)\ncontext = [\n    session.summary,\n    *session.recent_messages,\n    current_message,\n]\nanswer = agent.run(context)\nstore.append(user_id, session_id, answer)`,
    codeResult: ["Load: user-a / window-1", "Recall: summary + 5 recent messages", "Append: current user message", "Checkpoint: saved"],
    trace: ["Session Lookup", "Memory Recall", "Context Build", "Agent Run", "Checkpoint Save"],
  },
  {
    number: 5,
    slug: "session-5",
    title: "Context Compression",
    eyebrow: "CONTEXT",
    description: "学习 Token限制、历史消息压缩。",
    goudanTip: "上下文空间有限，优秀的 Agent 必须知道哪些信息应该保留。",
    objective: "在上下文接近限制时压缩旧消息，同时保留任务状态、用户偏好和关键工具结果。",
    lessons: ["Token限制", "历史压缩", "Summary Memory", "信息筛选"],
    tags: ["Token Limit", "Compression", "Summary", "Recall"],
    accent: "rose",
    flows: [
      { title: "压缩前", steps: ["System", "20 Messages", "Tool Results", "Current Input"], caption: "历史持续增长并占用 Token" },
      { title: "压缩后", steps: ["System", "Summary", "Recent 6", "Current Input"], caption: "保留关键事实与近期原文" },
    ],
    quiz: {
      question: "Context Compression 最不应该丢失什么？",
      options: [
        { id: "a", label: "所有重复寒暄的原始措辞。" },
        { id: "b", label: "用户约束、任务状态和重要工具结果。" },
      ],
      answer: "b",
      explanation: "压缩目标不是简单删消息，而是以更少 Token 保存继续完成任务所需的状态。",
    },
    code: `if estimate_tokens(messages) > context_limit:\n    old, recent = split_history(messages, keep_recent=6)\n    summary = summarize(old, preserve=[\n        "user_preferences", "task_state", "tool_results"\n    ])\n    messages = [summary, *recent]`,
    codeResult: ["Before: 18,420 tokens", "Select: old 24 / recent 6", "Summary: 1,180 tokens", "After: 5,760 tokens"],
    trace: ["Token Estimate", "Threshold Check", "History Split", "Summary Build", "Context Replace"],
  },
  {
    number: 6,
    slug: "session-6",
    title: "Execution Trace",
    eyebrow: "OBSERVABILITY",
    description: "学习 Agent执行轨迹、Debug、状态观察。",
    goudanTip: "好的 Agent 不只需要运行，还要让我们知道它为什么这样运行。",
    objective: "让每次运行都可以追踪输入、输出、状态、耗时和异常，从而快速定位 Agent 行为问题。",
    lessons: ["Agent运行轨迹", "Debug", "状态观察", "Error Recovery"],
    tags: ["Trace", "Debug", "Status", "Recovery"],
    accent: "indigo",
    flows: [
      { title: "执行轨迹", steps: ["User Input", "Planner", "Tool Selection", "Execute", "Answer"], caption: "记录每个节点状态和耗时" },
      { title: "异常恢复", steps: ["Error", "Capture", "Observation", "Retry / Fallback"], caption: "错误必须成为可处理的结构化信息" },
    ],
    quiz: {
      question: "工具执行失败时，最合适的处理方式是什么？",
      options: [
        { id: "a", label: "隐藏错误并假装工具执行成功。" },
        { id: "b", label: "记录错误 Trace，并作为 Observation 交给 Agent 决定重试或降级。" },
      ],
      answer: "b",
      explanation: "可观测的错误才能被调试和恢复，Agent 也需要明确的失败信息来调整下一步。",
    },
    code: `try:\n    result = registry.execute(call)\n    trace.write("tool_result", status="success", output=result)\nexcept ToolError as error:\n    trace.write("tool_result", status="failed", error=str(error))\n    result = {"ok": False, "error": str(error)}`,
    codeResult: ["run_start · 2ms", "llm_decision · 428ms", "tool_result · 86ms", "final_answer · 311ms"],
    trace: ["User Input", "Planner", "Tool Selection", "Tool Execute", "Observation", "Final Answer"],
  },
];

export function getCourseSession(number: number) {
  return courseSessions.find((session) => session.number === number) ?? courseSessions[0];
}
