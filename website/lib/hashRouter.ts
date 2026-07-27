export type AppRoute =
  | { page: "home" }
  | { page: "customer-service" }
  | { page: "course" }
  | { page: "session"; sessionNumber: number };

export function parseHashRoute(hash: string): AppRoute {
  if (hash === "#customer-service") return { page: "customer-service" };
  if (hash === "#agent-course" || hash === "#/course" || hash === "#course") return { page: "course" };

  const canonical = hash.match(/^#\/learn\/session-([1-6])$/);
  if (canonical) return { page: "session", sessionNumber: Number(canonical[1]) };

  const legacy = hash.match(/^#session-([1-6])$/);
  if (legacy) return { page: "session", sessionNumber: Number(legacy[1]) };

  return { page: "home" };
}

export function courseHref() {
  return "#agent-course";
}

export function sessionHref(sessionNumber: number) {
  return `#session-${sessionNumber}`;
}
