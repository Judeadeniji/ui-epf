import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { singleOfficerLoader } from "./loaders";
import { ApplicationsTable } from "./applications-table"; // Added import
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SingleOfficerPage() {
    const { revalidate } = useRevalidator();
    const loaderResult = useLoaderData<typeof singleOfficerLoader>();

    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
    const [banReasonInput, setBanReasonInput] = useState("");

    if ('error' in loaderResult) {
        return (
            <div className="p-4 md:p-8 text-center">
                <p className="text-red-500 dark:text-red-400">Error: {loaderResult.error}.</p>
            </div>
        );
    }

    const { approvedApplications, ...officer } = loaderResult.data;


    const handleOpenBanDialog = async () => {
        setBanReasonInput(officer.banReason || "");
        setIsBanDialogOpen(true);
    };

    const handleConfirmBan = () => {
        toast.promise(
            authClient.admin.banUser({
                userId: officer.id,
                banReason: banReasonInput || undefined, // Use the input value or undefined if empty
            }),
            {
                loading: 'Banning user...',
                success: async ({ error }) => {
                    if (error) {
                        throw new Error(error.message || 'Unknown error');
                    }
                    return `User ${officer.name} has been banned successfully.`;
                },
                error: async (error) => {
                    return `Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}`;
                },
                finally: async () => {
                    setIsBanDialogOpen(false);
                    setBanReasonInput(""); // Clear the input after closing the dialog
                    revalidate(); // Revalidate to refresh the officer data
                }
            }
        )
    }

    const handleUnbanUser = () => {
        toast.promise(
            authClient.admin.unbanUser({ userId: officer.id }),
            {
                loading: 'Unbanning user...',
                success: async ({ data, error }) => {
                    if (error) {
                        throw new Error(error.message || 'Unknown error');
                    }
                    return `User ${officer.name} has been unbanned successfully.`;
                },
                error: async (error) => {
                    return `Failed to unban user: ${error instanceof Error ? error.message : 'Unknown error'}`;
                },
                finally: async () => {
                    setIsBanDialogOpen(false);
                    revalidate(); // Revalidate to refresh the officer data
                }
            }
        );
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Officer Details</h1>
                    <p className="text-muted-foreground">View and manage officer information.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        {/* officer.image && <UserAvatar user={{ name: officer.name, image: officer.image }} className="h-12 w-12" /> */}
                        <div>
                            <CardTitle className="text-xl">{officer.name}</CardTitle>
                            <CardDescription>{officer.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">User ID</p>
                            <p>{officer.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <p className="capitalize">{officer.role || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant={officer.banned ? "destructive" : "default"} className={officer.banned ? "" : "bg-green-500 text-green-50"}>
                                {officer.banned ? "Banned" : "Active"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                            <Badge variant={officer.emailVerified ? "default" : "outline"} className={officer.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                {officer.emailVerified ? "Verified" : "Not Verified"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Joined At</p>
                            <p>{new Date(officer.createdAt).toLocaleDateString()} {new Date(officer.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                            <p>{new Date(officer.updatedAt).toLocaleDateString()} {new Date(officer.updatedAt).toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {officer.banned && (
                        <div className="pt-4 mt-4 border-t">
                            <h3 className="text-md font-semibold mb-2 text-destructive">Ban Information</h3>
                            {officer.banReason && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ban Reason</p>
                                    <p className="text-sm p-2 bg-muted rounded-md">{officer.banReason}</p>
                                </div>
                            )}
                            {officer.banExpires && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-muted-foreground">Ban Expires On</p>
                                    <p>{new Date(officer.banExpires).toLocaleDateString()} {new Date(officer.banExpires).toLocaleTimeString()}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                    {officer.banned ? (
                        <Button variant="outline" onClick={handleUnbanUser}>
                            Unban User
                        </Button>
                    ) : (
                        <Button variant="destructive" onClick={handleOpenBanDialog}>
                            Ban User
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Approved Applications Table Card */}
            {approvedApplications && approvedApplications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Approved Applications</CardTitle>
                        <CardDescription>
                            A list of applications approved by this officer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ApplicationsTable applications={{
                            data: approvedApplications.map(a => ({ ...a, application_hash: a.applicationHash })),
                            status: true,
                            meta: {
                                currentPage: 1,
                                totalPages: 1,
                                totalItems: approvedApplications.length,
                                pageSize: approvedApplications.length,
                            }
                        }} />
                    </CardContent>
                </Card>
            )}
            {approvedApplications && approvedApplications.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Approved Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="font-medium">No applications approved by this officer yet.</p>
                        </div>
                    </CardContent>
                </Card>
            )}


            <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Ban</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to ban <span className="font-medium">{officer.name}</span>. If you continue, they will lose access.
                            Please provide a reason for the ban (optional).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="ban-reason">Ban Reason</Label>
                        <Textarea
                            id="ban-reason"
                            placeholder="Enter reason for ban..."
                            value={banReasonInput}
                            onChange={(e) => setBanReasonInput(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmBan} className="bg-destructive hover:bg-destructive/90">
                            Confirm Ban
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}