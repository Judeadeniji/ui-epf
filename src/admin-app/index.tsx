"use client";

import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useNavigation,
} from "react-router";
import { DashboardPage } from "./dashboard";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppErrorBoundary } from "./error-boundary";
import { dashboardLoader, singleApplicationLoader } from "./loaders";
import { ApplicationsPage } from "./applications-page";
import { LinearProgressIndicator } from "@/components/ui/linear-progress-indicator";
import { cn } from "@/lib/utils";
import { SingleApplicationPage } from "./application-page";
import { SettingsPage } from "./settings-page";
import { SingleApplicationAction } from "./actions";

const router = () => createBrowserRouter([
    {
        path: "/dashboard",
        Component: () => {
            const navigation = useNavigation();
            const isNavigating = Boolean(navigation.location);

            return (
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset className="relative">
                            <SiteHeader />
                            {isNavigating && <LinearProgressIndicator isLoading={isNavigating} />}
                            <section className={cn(isNavigating && "absolute inset-0 z-10 bg-white/70")} />
                            <Outlet />
                        </SidebarInset>
                    </SidebarProvider>
            )
        },
        ErrorBoundary: AppErrorBoundary,
        HydrateFallback: () => (
            <div className="min-h-screen">
                <LinearProgressIndicator isLoading={true} />
            </div>
        ),
        children: [
            {
                Component: DashboardPage,
                index: true,
                loader: dashboardLoader,
            },
            {
                path: "applications",
                Component: ApplicationsPage,
                loader: dashboardLoader,
            },
            {
                path: "applications/:id",
                Component: SingleApplicationPage,
                loader: singleApplicationLoader,
                action: SingleApplicationAction,
            },
            {
                path: "settings",
                Component: SettingsPage
            }
        ]
    },
]);

export default function AppShell() {
    return (
        <RouterProvider router={router()}  />
    );
}