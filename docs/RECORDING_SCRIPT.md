# 录屏脚本（建议 4～6 分钟）

1. 展示目录，说明 `runtime.py` 是自研循环，`tools.py` 是注册机制，`storage.py` 是 session/memory。
2. 运行 `python -m unittest discover -s tests -v`，展示全部单测通过和真实 API 测试默认跳过。
3. 设置真实 `OPENAI_API_KEY`，打开窗口一：
   `mini-agent --user A --session window-1 --trace`
4. 输入：`查一下深圳天气，并把“下班带伞”加入待办`；展示模型连续调用 weather、todo 后返回。
5. 追问：`刚才天气怎样？我的待办有哪些？`；展示记忆和工具追问。
6. 新终端打开窗口二：
   `mini-agent --user A --session window-2`
7. 输入：`把“周五写周报”加入待办，然后列出来`；再问窗口一的内容，证明窗口互相隔离。
8. 回到窗口一列待办，证明可以继续聊且只看到窗口一的数据。
9. 展示 `--trace` 输出中的 `llm_request`、`llm_response`、`tool_result`、`run_end`。
10. 最后快速展示 README 的架构图、memory 策略和真实 API 说明。

录屏前请隐藏 API Key；只展示环境变量已经配置，不要把值录进去。

