export type AppRoute =
  | { page: "home" }
  | { page: "landing" }
  | { page: "customer-service" }
  | { page: "course" }
  | { page: "session"; sessionNumber: number };

export function parseHashRoute(hash: string): AppRoute {
  if (hash === "#customer-service") return { page: "customer-service" };
  if (hash === "#landing") return { page: "landing" };
  if (hash === "" || hash === "#home" || hash === "#agent-course" || hash === "#/course" || hash === "#course") return { page: "course" };

  const canonical = hash.match(/^#\/learn\/session-([1-6])$/);
  if (canonical) return { page: "session", sessionNumber: Number(canonical[1]) };

  const legacy = hash.match(/^#session-([1-6])$/);
  if (legacy) return { page: "session", sessionNumber: Number(legacy[1]) };

  return { page: "course" };
}

export function courseHref() {
  return "#home";
}

export function sessionHref(sessionNumber: number) {
  return `#session-${sessionNumber}`;
}
