"use client";

import { useEffect, useState } from "react";
import { CourseMapPage } from "../components/course/CourseMapPage";
import { SessionPage } from "../components/course/SessionPage";
import { CustomerServiceDemo } from "../components/CustomerServiceDemo";
import { MinimalLearningEntry } from "../components/MinimalLearningEntry";
import { parseHashRoute, type AppRoute } from "../lib/hashRouter";

export default function Home() {
  const [route, setRoute] = useState<AppRoute>({ page: "course" });

  useEffect(() => {
    const syncRoute = () => setRoute(parseHashRoute(window.location.hash));
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  if (route.page === "customer-service") return <CustomerServiceDemo />;
  if (route.page === "session") return <SessionPage sessionNumber={route.sessionNumber} />;
  if (route.page === "landing") return <MinimalLearningEntry />;
  return <CourseMapPage />;
}
