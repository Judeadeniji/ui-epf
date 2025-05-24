import { Loader2, AlertTriangle, Clock } from "lucide-react";
import type { DynamicOptionsLoadingProps } from "next/dynamic";
import { Button } from "@/components/ui/button";

export function DashboardLoadingSkeleton({ error, pastDelay, retry, timedOut }: DynamicOptionsLoadingProps) {
  let statusContent;

  if (error) {
    statusContent = (
      <>
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium text-destructive">Error Loading Dashboard</p>
        <p className="text-sm text-muted-foreground mb-4">
          Sorry, we encountered an issue while loading the dashboard. Please try again.
        </p>
        <Button onClick={retry} variant="destructive">Retry</Button>
      </>
    );
  } else if (timedOut) {
    statusContent = (
      <>
        <Clock className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg font-medium text-foreground">Loading is taking longer than usual</p>
        <p className="text-sm text-muted-foreground mb-4">
          The dashboard is still loading. You can wait or try reloading.
        </p>
        <Button onClick={retry} variant="outline">Retry</Button>
      </>
    );
  } else {
    statusContent = (
      <>
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-foreground">
          {!pastDelay ? "Still loading Admin Dashboard..." : "Loading Admin Dashboard..."}
        </p>
        <p className="text-sm text-muted-foreground">
          {!pastDelay ? "Almost there, assembling the final pieces." : "Assembling your dashboard overview."}
        </p>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8 text-center">
      {statusContent}
    </div>
  );
}
