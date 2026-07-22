# AI Prompt 与问题解决记录

## 使用过的核心开发 Prompt

> 从零实现一个最小可用 Agent。不能使用现成 Agent 框架；自行实现 loop、工具注册与 JSON Schema、LLM 输出解析、SQLite session 隔离、context 压缩、异常处理、trace 和测试。接入真实 OpenAI Responses API，并提供 CLI、README 与录屏步骤。

## Runtime System Prompt

见 `src/min_agent/llm.py` 的 `SYSTEM_PROMPT`。设计原则：短、明确、只描述决策边界；工具能力由注册表中的 schema 动态注入，避免在 Prompt 里重复。

## 问题与解决过程

1. **不能使用 Agent 框架**：只使用 Python 标准库；Runtime 的循环、停止条件、工具分发全部位于 `runtime.py`。
2. **如何让模型自主选工具**：把注册表生成的 function schema 发送给 Responses API，设置 `tool_choice=auto`。
3. **如何解析输出**：统一遍历 response `output`，解析 `function_call`、`message/output_text` 和可用的 `reasoning.summary`。
4. **思考过程如何处理**：不保存或展示隐藏 chain-of-thought；只提取 API 提供的安全 reasoning summary，trace 记录决策类型、调用参数和结果。
5. **两个窗口隔离**：所有 message、todo 和 session summary 都以 `(user_id, session_id)` 为隔离键。
6. **工具失败怎么办**：异常转成 `{ok:false,error:...}` observation 送回模型，让模型解释、修正参数或改走其他路径。
7. **context 过长怎么办**：保留最近 N 条原始消息；更早消息做确定性摘要并标为 compacted。该方案可测试、成本低，后续可替换成 LLM 摘要。
8. **无限循环怎么办**：`max_steps` 硬停止，并将停止原因写入消息与 trace。
9. **测试不能依赖网络**：单测使用 `ScriptedLLM` 验证 Runtime；另提供显式启用的真实 API 集成测试。

## AI 辅助范围声明

AI 用于需求拆解、代码生成建议、测试设计和文档整理。项目提交者需要逐文件理解代码、亲自配置 API、运行测试并录制演示。核心 Agent Runtime 没有委托给第三方 Agent 框架。

