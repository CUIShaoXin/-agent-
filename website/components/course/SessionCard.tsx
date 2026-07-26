import type { CourseSession } from "../../data/sessions";
import { sessionHref } from "../../lib/hashRouter";

interface SessionCardProps {
  session: CourseSession;
  completed: boolean;
}

export function SessionCard({ session, completed }: SessionCardProps) {
  return (
    <a className={`course-map-card ${session.accent}`} href={sessionHref(session.number)}>
      <div className="course-map-card-top">
        <span>SESSION {String(session.number).padStart(2, "0")}</span>
        <b>{completed ? "COMPLETED ✓" : session.eyebrow}</b>
      </div>
      <div className="course-map-symbol"><i /><i /><i /><strong>{String(session.number).padStart(2, "0")}</strong></div>
      <div className="course-map-card-copy">
        <h2>{session.title}</h2>
        <p>{session.description}</p>
        <div>{session.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
      <footer><span>{completed ? "再次学习" : "开始学习"}</span><b>→</b></footer>
    </a>
  );
}
