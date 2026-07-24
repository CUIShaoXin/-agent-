import type {
  AgentDefinition,
  AgentScenario,
  GuardRule,
  KnowledgeSource,
  MemoryState,
  SkillPreset,
} from "../types/agent";

export const agentDefinitions: AgentDefinition[] = [
  { id: "router", name: "Router Agent", role: "意图识别与任务路由", icon: "⌘", enabled: true, status: "online" },
  { id: "retriever", name: "Retriever Agent", role: "企业知识与向量检索", icon: "⌕", enabled: true, status: "online" },
  { id: "memory", name: "Memory Agent", role: "短期与长期上下文管理", icon: "◫", enabled: true, status: "online" },
  { id: "tool", name: "Tool Agent", role: "SQL、计算器与外部工具", icon: "⌁", enabled: true, status: "online" },
  { id: "guard", name: "Guard Agent", role: "安全策略与风险拦截", icon: "◇", enabled: true, status: "online" },
  { id: "response", name: "Response Agent", role: "结果生成与可视化表达", icon: "✦", enabled: true, status: "online" },
];

export const skillPresets: SkillPreset[] = [
  { id: "analysis", label: "数据分析", icon: "▥", prompt: "最近三个月利润为什么下降？" },
  { id: "knowledge", label: "知识问答", icon: "◧", prompt: "公司的售后政策是什么？" },
  { id: "planning", label: "复杂任务规划", icon: "⌘", prompt: "帮我制定一个销售分析方案" },
  { id: "memory", label: "多轮记忆", icon: "◫", prompt: "刚才提到的方案适合1000人企业吗？" },
  { id: "error", label: "异常处理", icon: "!", prompt: "执行SQL失败怎么办？" },
];

export const knowledgeSources: KnowledgeSource[] = [
  { id: "products", name: "产品文档", type: "folder", count: 126 },
  { id: "faq", name: "FAQ", type: "document", count: 84 },
  { id: "metrics", name: "数据指标", type: "metric", count: 42 },
  { id: "rules", name: "业务规则", type: "rule", count: 31 },
];

export const memoryState: MemoryState = {
  sessionId: "sess_ent_2026_0724",
  checkpoint: "redis://checkpoint/8f31",
  shortMemory: [
    "用户关注欧洲市场销售表现",
    "分析口径：按自然季度",
    "输出偏好：结论优先 + 数据证据",
    "已确认利润 = 销售额 - 总成本",
    "上一轮生成了区域分析方案",
  ],
  longMemory: ["所属行业：企业软件", "组织规模：1000+ 人", "默认币种：CNY", "偏好可执行建议"],
};

export const guardRules: GuardRule[] = [
  { id: "sql", name: "SQL 安全检查", description: "拦截 DROP / DELETE / UPDATE 等写操作", status: "blocked", lastCheck: "危险 SQL 已阻止" },
  { id: "pii", name: "敏感信息过滤", description: "检测手机号、身份证、密钥与客户隐私", status: "active", lastCheck: "本轮通过" },
  { id: "injection", name: "Prompt Injection 检测", description: "识别越权指令与系统提示词窃取", status: "active", lastCheck: "风险 0.02" },
];

const analysisScenario: AgentScenario = {
  id: "analysis",
  question: "最近三个月利润为什么下降？",
  plan: [
    { id: "p1", title: "确认分析口径", description: "利润、时间范围与对比基线" },
    {
      id: "p2",
      title: "拆解利润驱动因素",
      description: "收入端与成本端并行分析",
      children: [
        { id: "p2a", title: "销售额", description: "地区、产品、客户维度" },
        { id: "p2b", title: "成本", description: "采购、营销、履约维度" },
      ],
    },
    { id: "p3", title: "定位主要原因", description: "计算贡献度并验证异常" },
    { id: "p4", title: "生成经营建议", description: "按影响和紧迫度排序" },
  ],
  trace: [
    { id: "understand", name: "Query Understanding Agent", icon: "🧠", status: "success", input: "最近三个月利润为什么下降？", output: "识别为经营归因分析；时间窗口 2026-04 至 2026-06", duration: 126, meta: ["intent: analytics", "confidence: 0.98"] },
    { id: "retrieval", name: "Knowledge Retrieval Agent", icon: "📚", status: "success", input: "利润分析口径 + 企业数据目录", output: "召回利润指标定义、销售数据表、成本数据表", duration: 318, meta: ["top_k: 5", "score: 0.93"] },
    { id: "schema", name: "Schema Linking Agent", icon: "🗂", status: "success", input: "指标定义与召回文档", output: "匹配 sales_table、cost_table、profit_table", duration: 205, meta: ["tables: 3", "columns: 14"] },
    { id: "sql", name: "SQL Agent", icon: "📝", status: "success", input: "按月聚合销售额、成本与利润", output: "生成 3 条只读 SQL，并加入组织与时间过滤", duration: 442, meta: ["queries: 3", "rows: 100"] },
    { id: "guard", name: "Guard Agent", icon: "🛡", status: "success", input: "SQL + 数据访问上下文", output: "只读检查通过；未发现敏感字段与越权表", duration: 79, meta: ["risk: low", "policy: enterprise-v3"] },
    { id: "analysis", name: "Analysis Agent", icon: "📊", status: "success", input: "销售、成本与利润聚合结果", output: "利润下降 18.4%，主因是欧洲区折扣扩大与云资源成本上升", duration: 684, meta: ["evidence: 6", "confidence: 0.91"] },
  ],
  tools: [
    { id: "sql-1", tool: "SQL Tool", icon: "▤", status: "success", input: "SELECT month, SUM(revenue), SUM(cost)…", result: "返回 100 条聚合数据", duration: 392 },
    { id: "ret-1", tool: "Retriever Tool", icon: "⌕", status: "success", input: "query: 利润指标定义；top_k: 5", result: "返回 Top 5 documents", duration: 217 },
    { id: "calc-1", tool: "Calculator Tool", icon: "±", status: "success", input: "(current_profit - baseline) / baseline", result: "-18.4%", duration: 18 },
  ],
  answer: "最近三个月利润下降 18.4%。其中约 10.2 个百分点来自欧洲区平均折扣率上升，5.6 个百分点来自云资源与履约成本增加，其余来自产品组合变化。建议优先收紧高折扣审批，并对云资源异常租户做专项优化。",
};

function cloneScenario(id: string, question: string, answer: string): AgentScenario {
  return {
    ...analysisScenario,
    id,
    question,
    answer,
    trace: analysisScenario.trace.map((node, index) => ({
      ...node,
      id: `${id}-${node.id}`,
      input: index === 0 ? question : node.input,
      ...(id === "error" && index === 3
        ? { status: "failed" as const, output: "执行失败：字段 gross_margin 不存在，已交给 Recovery Agent 重试", duration: 236 }
        : {}),
    })),
    tools: analysisScenario.tools.map((tool) => ({
      ...tool,
      id: `${id}-${tool.id}`,
      ...(id === "error" && tool.tool === "SQL Tool"
        ? { status: "failed" as const, result: "column gross_margin not found" }
        : {}),
    })),
  };
}

export const scenarios: Record<string, AgentScenario> = {
  analysis: analysisScenario,
  knowledge: cloneScenario("knowledge", "公司的售后政策是什么？", "企业版支持 7×24 小时工单服务，标准严重等级问题 30 分钟内响应；合同生效后 30 天内可申请一次部署方案调整。答案来自《企业版售后服务政策 v4.2》。"),
  planning: cloneScenario("planning", "帮我制定一个销售分析方案", "方案分为目标确认、指标体系、数据准备、归因分析和经营复盘五个阶段。建议先以区域×产品为主分析轴，再加入客户规模与渠道维度。"),
  memory: cloneScenario("memory", "刚才提到的方案适合1000人企业吗？", "适合。结合长期记忆中的组织规模，建议增加事业部权限隔离、统一指标中心和 Redis checkpoint，并把单团队版本的周复盘升级为事业部月度复盘。"),
  error: cloneScenario("error", "执行SQL失败怎么办？", "SQL Agent 首次引用了不存在的 gross_margin 字段。系统保留失败 Trace，Schema Linking Agent 已重新匹配 profit_amount / revenue 字段并生成修复后的只读 SQL；不会静默丢失错误。"),
};
