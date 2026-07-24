export type AgentStatus = "pending" | "running" | "success" | "failed";

export interface AgentNode {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  input: string;
  output: string;
  duration: number;
  meta?: string[];
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  icon: string;
  enabled: boolean;
  status: "online" | "standby";
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  children?: PlanStep[];
}

export interface ToolCallRecord {
  id: string;
  tool: string;
  icon: string;
  status: AgentStatus;
  input: string;
  result: string;
  duration: number;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: "folder" | "document" | "metric" | "rule";
  count: number;
}

export interface MemoryState {
  sessionId: string;
  checkpoint: string;
  shortMemory: string[];
  longMemory: string[];
}

export interface GuardRule {
  id: string;
  name: string;
  description: string;
  status: "active" | "blocked";
  lastCheck: string;
}

export interface SkillPreset {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export interface AgentScenario {
  id: string;
  question: string;
  trace: AgentNode[];
  plan: PlanStep[];
  tools: ToolCallRecord[];
  answer: string;
}
