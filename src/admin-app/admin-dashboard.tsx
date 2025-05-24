import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTextIcon, ListIcon, UsersIcon } from "lucide-react";
import { useLoaderData } from "react-router";
import { dashboardLoader } from "./loaders";

export function AdminDashboardPage() {
    const { stats } = useLoaderData<typeof dashboardLoader>()
    const officers: string | any[] = [];
    return (
        <div className="flex flex-col min-h-screen bg-muted/40 p-4 sm:p-6 gap-y-4">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
                <p className="mt-1 text-muted-foreground">
                    Oversee officer performance and overall system activity.
                </p>
            </header>

            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="p-6 rounded-lg bg-card border shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-semibold tracking-tight">Total Applications</h3>
                        <ListIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {"data" in stats && stats.data && typeof stats.data.total === 'number' ? (
                                Intl.NumberFormat("en-GB", {
                                    notation: "compact",
                                    compactDisplay: "short",
                                }).format(stats.data.total)
                            ) : (
                                <span className="text-base text-red-500">
                                    {"error" in stats && stats.error ? stats.error : "Data unavailable"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-lg bg-card border shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-semibold tracking-tight">Pending Review</h3>
                        <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {"data" in stats && stats.data && typeof stats.data.pending === 'number' ? (
                                Intl.NumberFormat("en-GB", {
                                    notation: "compact",
                                    compactDisplay: "short",
                                }).format(stats.data.pending)
                            ) : (
                                <span className="text-base text-red-500">
                                    {"error" in stats && stats.error ? stats.error : "Data unavailable"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-lg bg-card border shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-semibold tracking-tight">Approved Applications</h3>
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {"data" in stats && stats.data && typeof stats.data.approved === 'number' ? (
                                Intl.NumberFormat("en-GB", {
                                    notation: "compact",
                                    compactDisplay: "short",
                                }).format(stats.data.approved)
                            ) : (
                                <span className="text-base text-red-500">
                                    {"error" in stats && stats.error ? stats.error : "Data unavailable"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                <Card className="w-full h-full">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>Officer Performance</CardTitle>
                                <CardDescription>Overview of officer activity and assignments.</CardDescription>
                            </div>
                            <UsersIcon className="h-6 w-6 text-muted-foreground ml-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {officers && Array.isArray(officers) && officers.length > 0 ? (
                            <p>Officer data is available. An 'OfficersTable' component should be implemented here to display {officers.length} officer(s).</p>
                        ) : officers ? (
                            <p>No officers to display or officer data is not in the expected format.</p>
                        ) : (
                            <p>Officer data is currently unavailable. Ensure the data loader provides an 'officers' array.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}