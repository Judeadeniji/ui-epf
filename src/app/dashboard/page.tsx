"use client";

import dynamic from "next/dynamic";
import { DashboardLoadingSkeleton } from "@/components/dashboard-loading-skeleton";

export default dynamic(() => import("@/admin-app"), {
  ssr: false,
  loading: (props) => <DashboardLoadingSkeleton {...props} />,
})