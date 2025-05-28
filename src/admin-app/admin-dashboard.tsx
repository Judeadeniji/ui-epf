import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTextIcon, ListIcon, UsersIcon, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { useLoaderData, Link } from "react-router";
import { dashboardLoader } from "./loaders";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function AdminDashboardPage() {
    const { stats, applications, users } = useLoaderData<typeof dashboardLoader>();

    const applicationsData = "data" in applications ? applications.data : [];
    const usersData = "data" in users ? users.data : [];
    const usersMeta = "meta" in users ? users.meta : null;

    return (
        <div className="flex flex-col min-h-screen bg-muted/40 p-4 sm:p-6 gap-y-4">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
                <p className="mt-1 text-muted-foreground">
                    Oversee system activity, users, and applications.
                </p>
            </header>

            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                <div className="p-6 rounded-lg bg-card border shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-semibold tracking-tight">Total Users</h3>
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {usersMeta ? (
                                Intl.NumberFormat("en-GB", {
                                    notation: "compact",
                                    compactDisplay: "short",
                                }).format(usersMeta.total)
                            ) : (
                                <span className="text-base text-red-500">
                                    {users.status === false ? users.error : "Data unavailable"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Users Section */}
                <Card className="w-full flex flex-col justify-between">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Users</CardTitle>
                                <CardDescription>Latest users in the system</CardDescription>
                            </div>
                            <UsersIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {users.status === false ? (
                            <div className="text-center py-4">
                                <p className="text-red-600 dark:text-red-400">{users.error}</p>
                            </div>
                        ) : usersData.length > 0 ? (<div className="space-y-4">
                            {usersData.slice(0, 5).map((user: any) => (
                                <div key={user.id} className="flex items-center space-x-4">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.image || ""} alt={user.name} />
                                        <AvatarFallback className="text-primary">
                                            {user.name?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user.name || 'N/A'}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={cn(
                                                "px-2 py-1 text-xs font-semibold rounded-full",
                                                user.emailVerified
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                            )}
                                        >
                                            {user.emailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        ) : (
                            <div className="text-center py-4">
                                <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">No users found</p>
                            </div>
                        )}
                    </CardContent>

                    {usersData.length > 0 && (
                        <CardFooter>
                            <Button variant="outline" asChild className="w-full">
                                <Link to="/dashboard/officers">View All Users</Link>
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Recent Applications Section */}
                <Card className="w-full flex flex-col justify-between">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Applications</CardTitle>
                                <CardDescription>Latest application submissions</CardDescription>
                            </div>
                            <FileTextIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {applications.status === false ? (
                            <div className="text-center py-4">
                                <p className="text-red-600 dark:text-red-400">{applications.error}</p>
                            </div>
                        ) : applicationsData.length > 0 ? (<div className="space-y-4">
                            {applicationsData.slice(0, 5).map(({ application, application_hash }) => (
                                <div key={application._id} className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {application_hash.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                                        {application_hash.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        {application_hash.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {`${application.surname} ${application.firstname}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={cn(
                                                "px-2 py-1 text-xs font-semibold rounded-full",
                                                application_hash.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                                                application_hash.status === 'approved' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                                                application_hash.status === 'rejected' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            )}
                                        >
                                            {application_hash.status}
                                        </span>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link to={`/dashboard/applications/${application._id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        ) : (
                            <div className="text-center py-4">
                                <FileTextIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">No applications found</p>
                            </div>
                        )}
                    </CardContent>

                    {applicationsData.length > 0 && (
                        <CardFooter>
                            <Button variant="outline" asChild className="w-full">
                                <Link to="/dashboard/applications">View All Applications</Link>
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}