"use client";

import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useNavigation,
} from "react-router";
import { OfficerDashboardPage } from "./officer-dashboard";
import { AdminDashboardPage } from "./admin-dashboard";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppErrorBoundary } from "./error-boundary";
import { allUsersLoader, applicationsLoader, dashboardLoader, singleApplicationLoader } from "./loaders";
import { ApplicationsPage } from "./applications-page";
import { LinearProgressIndicator } from "@/components/ui/linear-progress-indicator";
import { SingleApplicationPage } from "./application-page";
import { SettingsPage } from "./settings-page";
import { singleApplicationAction } from "./actions";
import { useSession } from "@/contexts/session";
import { lazy, useMemo } from "react";

const AllOfficersPageLazy = lazy(() => import("./all-officers-page"));
const SingleOfficerPageLazy = lazy(() => import("./single-officer-page"));

const router = (isAdmin: boolean) => createBrowserRouter([
    {
        path: "/dashboard",
        Component: () => {
            const navigation = useNavigation();
            const isNavigating = Boolean(navigation.location);

            return (
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className="relative">
                        <LinearProgressIndicator isLoading={isNavigating} />
                        <SiteHeader />
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
                Component: () => {
                    if (isAdmin) {
                        return <AdminDashboardPage />
                    }

                    return <OfficerDashboardPage />
                },
                index: true,
                loader: dashboardLoader,
            },
            {
                path: "applications",
                Component: ApplicationsPage,
                loader: applicationsLoader,
            },
            {
                path: "applications/:id",
                Component: SingleApplicationPage,
                loader: singleApplicationLoader,
                action: singleApplicationAction,
            },
            ...(
                isAdmin ? [
                    {
                        path: "officers",
                        Component: AllOfficersPageLazy,
                        loader: allUsersLoader,
                    },
                    {
                        path: "officers/:id",
                        Component: SingleOfficerPageLazy,
                    }
                ] : []
            ),
            {
                path: "settings",
                Component: SettingsPage
            }
        ]
    },
]);

export default function AppShell() {
    const { user } = useSession();
    const isAdmin = user.role === "admin";

    const memoizedRouter = useMemo(() => router(isAdmin), [isAdmin]);

    return (
        <RouterProvider router={memoizedRouter} />
    );
}