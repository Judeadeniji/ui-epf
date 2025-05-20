"use client";

import dynamic from "next/dynamic";
import { DashboardLoadingSkeleton } from "@/components/dashboard-loading-skeleton";

const App = dynamic(() => import("@/admin-app"), {
  ssr: false,
  loading: () => <DashboardLoadingSkeleton />,
})


export default function DashboardPage() {
  return (
      <App />
  );
}