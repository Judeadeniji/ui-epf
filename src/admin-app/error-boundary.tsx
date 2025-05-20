"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FrownIcon, RefreshCwIcon } from "lucide-react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";

export function AppErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "An unexpected error occurred.";
  let errorStatus = "";
  let errorDetails = "";

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status} ${error.statusText}`;
    if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.status === 404) {
      errorMessage = "Sorry, we couldn't find that page.";
    } else if (error.status === 401) {
      errorMessage = "You are not authorized to see this";
    } else if (error.status === 503) {
      errorMessage = "Looks like our API is down";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = process.env.NODE_ENV === "development" ? error.stack || "" : "";
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-background">
          <FrownIcon className="w-16 h-16 text-destructive mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Oops! Something went wrong.</h1>
          {errorStatus && <p className="text-xl text-muted-foreground mb-1">{errorStatus}</p>}
          <p className="text-lg text-muted-foreground mb-6">{errorMessage}</p>
          
          {errorDetails && (
            <details className="mb-6 p-4 bg-muted rounded-md w-full max-w-2xl text-left">
              <summary className="cursor-pointer font-medium text-foreground/80">Error Details (Development Only)</summary>
              <pre className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap break-all">
                {errorDetails}
              </pre>
            </details>
          )}

          <div className="flex gap-4">
            <Button onClick={handleReload} variant="outline">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={handleGoHome}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
