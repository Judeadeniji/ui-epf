import { Loader2 } from "lucide-react";

export function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium text-foreground">Loading Admin Dashboard...</p>
      <p className="text-sm text-muted-foreground">Assembling your dashboard overview.</p>
    </div>
  );
}
