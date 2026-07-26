"use client";

import { useRef } from "react";

export type EmbeddingStatus = "waiting" | "processing" | "ready" | "failed";

export interface KnowledgeBasePanelProps {
  documentCount: number | null;
  embeddingStatus: EmbeddingStatus;
  retrieverOnline: boolean;
  sourceLabel: string;
  uploadStatus: string;
  disabled: boolean;
  onUpload: (file: File) => void;
}

const embeddingLabels: Record<EmbeddingStatus, string> = {
  waiting: "等待文档",
  processing: "Embedding 中",
  ready: "Ready",
  failed: "处理失败",
};

export function KnowledgeBasePanel({
  documentCount,
  embeddingStatus,
  retrieverOnline,
  sourceLabel,
  uploadStatus,
  disabled,
  onUpload,
}: KnowledgeBasePanelProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <section className="cs-panel cs-product cs-kb-panel">
      <div className="cs-panel-title"><span>知识库状态</span><b>{retrieverOnline ? "已连接" : "等待连接"}</b></div>
      <div className="cs-product-visual"><span>RAG</span><i>Knowledge Base</i></div>
      <dl className="cs-kb-facts">
        <div><dt>文档数量</dt><dd>{documentCount === null ? "—" : `${documentCount} 份`}</dd></div>
        <div><dt>文件类型</dt><dd>PDF · Markdown</dd></div>
        <div><dt>Embedding</dt><dd className={embeddingStatus}>{embeddingLabels[embeddingStatus]}</dd></div>
        <div><dt>Retriever</dt><dd className={retrieverOnline ? "ready" : "waiting"}>{retrieverOnline ? "Online" : "Offline"}</dd></div>
      </dl>
      <p className="cs-kb-source" title={sourceLabel}>当前来源：{sourceLabel}</p>
      <div className="cs-kb-upload">
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.md,application/pdf,text/markdown"
          aria-label="上传 PDF 或 Markdown 知识库文件"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = "";
          }}
        />
        <button type="button" disabled={disabled} onClick={() => fileInput.current?.click()}>
          {embeddingStatus === "processing" ? "正在构建索引…" : "上传知识库"}
        </button>
        <small>{uploadStatus}</small>
      </div>
    </section>
  );
}
