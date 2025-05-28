"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteIcon, Eye, PenLine } from "lucide-react";
import { Link, useRevalidator } from "react-router";
import { UserAvatar } from "./user-avatar";
import { StatusBadge } from "./status-badge";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/contexts/session";

interface UserTableProps {
    users: User[];
    caption?: string;
    className?: string;
}

export function UserTable({
    users,
    caption = "A list of all registered users.",
    className
}: UserTableProps) {
    const session = useSession()
    const { revalidate } = useRevalidator();

    const handleUserDelete = (userId: string) => {
        if (session.session.userId === userId) {
            return toast.error("You cannot delete yourself.")
        }
        toast.promise(authClient.admin.removeUser({ userId }), {
            loading: "Deleting user, Please wait...",
            success: async ({ error }) => {
                if (error) {
                    throw Error(error.message, {
                        cause: error
                    })
                }

                return "User deleted succesfully"
            },
            error: async (err) => err.message || "Something went wrong.",
            finally() {
                revalidate();
            },
        })
    };

    return (
        <div className={className}>
            <Table>
                <TableCaption className="mt-4">{caption}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium space-x-2 flex items-center">
                                <UserAvatar
                                    src={user.image}
                                    name={user.name || 'Unknown User'}
                                    className="h-8 w-8 rounded-lg grayscale"
                                    fallbackClassName="rounded-full text-primary"
                                />
                                <span>
                                    {user.name || 'N/A'}
                                </span>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="capitalize">{user.role || "N/A"}</TableCell>
                            <TableCell>
                                <StatusBadge status={user.banned ? 'banned' : 'active'}>
                                    {user.banned ? 'Banned' : 'Active'}
                                </StatusBadge>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={user.emailVerified ? 'verified' : 'pending'}>
                                    {user.emailVerified ? 'Verified' : 'Pending'}
                                </StatusBadge>
                            </TableCell>
                            <TableCell className="space-x-2">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full"
                                    asChild
                                >
                                    <Link to={user.id}>
                                        <Eye />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => handleUserDelete(user.id)}
                                >
                                    <DeleteIcon className="text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
