"use client";

import { useMemo, useSyncExternalStore } from "react";

export interface CourseProgress {
  session1: boolean;
  session2: boolean;
  session3: boolean;
  session4: boolean;
  session5: boolean;
  session6: boolean;
}

const STORAGE_KEY = "agent_progress";
const emptyProgress: CourseProgress = {
  session1: false,
  session2: false,
  session3: false,
  session4: false,
  session5: false,
  session6: false,
};

function parseProgress(saved: string): CourseProgress {
  try {
    if (!saved) return emptyProgress;
    const parsed = JSON.parse(saved) as Partial<CourseProgress>;
    return {
      session1: parsed.session1 === true,
      session2: parsed.session2 === true,
      session3: parsed.session3 === true,
      session4: parsed.session4 === true,
      session5: parsed.session5 === true,
      session6: parsed.session6 === true,
    };
  } catch {
    return emptyProgress;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("agent-progress", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("agent-progress", callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

export function useCourseProgress() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const progress = useMemo(() => parseProgress(saved), [saved]);

  const completedCount = useMemo(
    () => Object.values(progress).filter(Boolean).length,
    [progress],
  );

  function completeSession(sessionNumber: number) {
    const key = `session${sessionNumber}` as keyof CourseProgress;
    const next = { ...progress, [key]: true };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("agent-progress"));
  }

  function isCompleted(sessionNumber: number) {
    return progress[`session${sessionNumber}` as keyof CourseProgress];
  }

  return { progress, completedCount, completeSession, isCompleted };
}
