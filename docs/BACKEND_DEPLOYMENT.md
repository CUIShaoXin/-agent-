# FastAPI 公网部署

## 部署前检查

生产镜像包含 `knowledge_base/docs` 和已经生成的
`knowledge_base/chroma_db`。部署前必须确认这些目录已提交到部署所使用的
Git 仓库。GitHub 仓库是公开的，因此不要把敏感企业资料提交到仓库；敏感资料
应改用云平台持久卷或私有对象存储。

后端运行时必须配置：

```text
DASHSCOPE_API_KEY=你的 DashScope Key
MODEL_NAME=qwen-plus
DASHSCOPE_EMBEDDING_MODEL=text-embedding-v3
KNOWLEDGE_SOURCE_DIR=/app/knowledge_base/docs
KNOWLEDGE_DOCS_DIR=/app/knowledge_base/docs
CHROMA_PERSIST_DIR=/app/knowledge_base/chroma_db
CHROMA_COLLECTION_NAME=huachen_enterprise
KNOWLEDGE_AUTO_BUILD=true
CORS_ORIGINS=https://cuishaoxin.github.io
```

不要把 `DASHSCOPE_API_KEY` 写入 Dockerfile、GitHub 仓库或前端环境变量。

## Docker 本地验证

```powershell
docker build -t minimum-agent-api .
docker run --rm -p 8000:8000 `
  -e DASHSCOPE_API_KEY="$env:DASHSCOPE_API_KEY" `
  -e CORS_ORIGINS="https://cuishaoxin.github.io,http://localhost:3000" `
  minimum-agent-api
```

启动命令：

```text
python -m uvicorn min_agent.api:app --host 0.0.0.0 --port $PORT
```

验证：

```powershell
Invoke-RestMethod https://你的后端域名/health
$body = @{
  message = "华辰服饰有限公司是一家什么样的企业？"
  session_id = "deploy-check"
} | ConvertTo-Json
Invoke-RestMethod https://你的后端域名/chat `
  -Method Post -ContentType "application/json" -Body $body
```

## 部署到容器平台

Render、Railway、Fly.io 或任意支持 Docker 的云平台均可：

1. 新建 Web Service，并连接该 GitHub 仓库。
2. 选择仓库根目录的 `Dockerfile`。
3. 添加上述运行时环境变量，把 `DASHSCOPE_API_KEY` 标记为 Secret。
4. 健康检查路径设置为 `/health`。
5. 部署成功后复制平台提供的 HTTPS 地址，例如
   `https://minimum-agent-api.example.com`。

## 连接 GitHub Pages

进入 GitHub 仓库：

`Settings → Secrets and variables → Actions → Variables`

新增变量：

```text
VITE_API_BASE_URL=https://你的公网FastAPI地址
```

变量值不要带末尾 `/`。然后重新运行 `Deploy website to GitHub Pages`
工作流。前端构建会把该地址写入静态页面，所有 `/health`、`/chat` 和
`/knowledge/upload` 请求都会使用这个公网 HTTPS 后端。

`POST /chat` 至少包含以下字段，当前接口还会返回 `session_id`、`intent`
和 `database_used`：

```json
{
  "answer": "基于企业知识库生成的回答",
  "sources": [
    {
      "filename": "华辰服饰有限公司_公司介绍.md"
    }
  ]
}
```
