"use client";

import { getCourseSession } from "../../data/sessions";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { InteractiveSessionPage } from "./InteractiveSessionPage";
import { SessionOnePage } from "./SessionOnePage";

interface SessionPageProps {
  sessionNumber: number;
}

export function SessionPage({ sessionNumber }: SessionPageProps) {
  const session = getCourseSession(sessionNumber);
  const { completeSession, isCompleted } = useCourseProgress();
  const completed = isCompleted(session.number);

  if (session.number === 1) {
    return <SessionOnePage completed={completed} completeSession={completeSession} session={session} />;
  }

  return <InteractiveSessionPage completed={completed} completeSession={completeSession} session={session} />;
}
