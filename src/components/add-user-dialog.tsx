"use client"

import { FormEventHandler, useState } from "react";
import { PlusCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRevalidator } from "react-router";


export interface NewUserFormData {
    name: string;
    email: string;
    role: "officer" | "admin";
    password: string;
}

export function AddUserDialog() {
    const { revalidate } = useRevalidator();
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [formData, setFormData] = useState<NewUserFormData>({
        name: "",
        email: "",
        role: "officer",
        password: ""
    });

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            role: "officer",
            password: ""
        });
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setIsPending(true)
        const res = await authClient.admin.createUser({
            email: formData.email,
            name: formData.name,
            password: formData.password,
            role: formData.role
        });

        if (res.error) {
            toast.error("Unable to create user", {
                description: res.error.message
            })
        } else {
            toast.success("User created succesfully", {
                description: `Email: ${res.data.user.email}`
            })
            setOpen(false);
            resetForm();
        }
        await revalidate();
        setIsPending(false);
    };


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New User
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account. The user will receive a welcome email if enabled.
                    </DialogDescription>
                </DialogHeader>
                <form id='add-user' className="grid gap-4 py-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="col-span-3"
                            placeholder="Enter full name"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="col-span-3"
                            placeholder="Enter email address"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) =>
                                setFormData({ ...formData, role: value as "officer" | "admin" })
                            }
                            name="role"
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="officer">Officer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className="col-span-3"
                            placeholder="Enter password"
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" form="add-user" disabled={isPending}>
                        {isPending ? "Processing..." : "Create User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
