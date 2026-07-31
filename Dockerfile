FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    KNOWLEDGE_SOURCE_DIR=/app/knowledge_base/docs \
    KNOWLEDGE_DOCS_DIR=/app/knowledge_base/docs \
    CHROMA_PERSIST_DIR=/app/knowledge_base/chroma_db \
    CHROMA_COLLECTION_NAME=huachen_enterprise \
    KNOWLEDGE_AUTO_BUILD=true \
    AGENT_DB_PATH=/app/data/agent.db

WORKDIR /app

COPY requirements.txt pyproject.toml README.md ./
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt

COPY src ./src
RUN python -m pip install --no-cache-dir --no-deps .

COPY knowledge_base/docs ./knowledge_base/docs
COPY knowledge_base/chroma_db ./knowledge_base/chroma_db

RUN useradd --create-home --uid 10001 agent \
    && mkdir -p /app/data \
    && chown -R agent:agent /app
USER agent

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:' + __import__('os').getenv('PORT', '8000') + '/health', timeout=4)"

CMD ["sh", "-c", "python -m uvicorn min_agent.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
