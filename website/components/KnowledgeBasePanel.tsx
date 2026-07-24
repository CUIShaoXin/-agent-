"use client";

import { useRef, useState } from "react";
import type { KnowledgeSource } from "../types/agent";

export function KnowledgeBasePanel({ sources }: { sources: KnowledgeSource[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [stage, setStage] = useState<"idle" | "parsing" | "ready">("idle");

  function chooseFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setStage("parsing");
    window.setTimeout(() => setStage("ready"), 900);
  }

  return (
    <div className="console-panel knowledge-panel">
      <div className="kb-title"><span>企业知识库</span><b>257 docs</b></div>
      <div className="kb-tree">
        {sources.map((source) => (
          <div key={source.id}><i>{source.type === "folder" ? "▸" : "·"}</i><span>{source.name}</span><small>{source.count}</small></div>
        ))}
      </div>
      <input ref={inputRef} type="file" hidden onChange={(event) => chooseFile(event.target.files?.[0])} />
      <button className="upload-zone" onClick={() => inputRef.current?.click()}>
        <b>＋</b><span>{fileName || "上传企业文档"}</span><small>{stage === "parsing" ? "Parsing & Chunking…" : stage === "ready" ? "Document → Chunk → Embedding 完成" : "PDF · DOCX · TXT"}</small>
      </button>
      <div className="embedding-pipeline">
        {["Document", "Chunk", "Embedding", "Vector Search"].map((item, index) => (
          <span className={stage === "ready" || (stage === "parsing" && index < 2) ? "active" : ""} key={item}>{item}{index < 3 && <i>→</i>}</span>
        ))}
      </div>
    </div>
  );
}
