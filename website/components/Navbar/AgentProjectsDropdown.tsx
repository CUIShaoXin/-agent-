"use client";

import { useEffect, useRef, useState } from "react";

interface AgentProject {
  icon: string;
  title: string;
  description: string;
  status: "已上线" | "开发中" | "规划中";
  href?: string;
}

const agentProjects: AgentProject[] = [
  {
    icon: "🦞",
    title: "智能客服 Agent",
    description: "基于知识库和大模型的企业智能客服系统",
    status: "已上线",
    href: "#customer-service",
  },
  {
    icon: "📢",
    title: "营销内容 Agent",
    description: "辅助企业营销内容生成、策划和用户触达",
    status: "开发中",
  },
  {
    icon: "👥",
    title: "Agent Teams 开发团队",
    description: "探索多 Agent 协作和复杂任务处理",
    status: "规划中",
  },
];

export function AgentProjectsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="agent-projects-dropdown"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="agent-projects-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        Agent实战项目 <span aria-hidden="true">▾</span>
      </button>

      <div
        className={`agent-projects-menu-wrap${isOpen ? " is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="agent-projects-menu" role="menu" aria-label="Agent 实战项目">
          {agentProjects.map((project) => {
            const content = (
              <>
                <span className="agent-project-icon" aria-hidden="true">{project.icon}</span>
                <span className="agent-project-copy">
                  <strong>{project.title}</strong>
                  <small>{project.description}</small>
                  <em data-status={project.status}>{project.status}</em>
                </span>
              </>
            );

            return project.href ? (
              <a
                className="agent-project-item is-active"
                href={project.href}
                role="menuitem"
                tabIndex={isOpen ? 0 : -1}
                key={project.title}
                onClick={() => setIsOpen(false)}
              >
                {content}
              </a>
            ) : (
              <div className="agent-project-item" role="menuitem" aria-disabled="true" key={project.title}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
