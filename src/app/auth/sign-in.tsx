"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2, Key } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        await signIn.email(
            {
                email,
                password,
                rememberMe,
                callbackURL: "/dashboard",
            },
            {
                onRequest: (ctx) => {
                    setLoading(true);
                },
                onResponse: (ctx) => {
                    setLoading(false);
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || "An unexpected error occurred during sign-in.");
                },
                onSuccess: () => {
                    toast.success("Successfully signed in!");
                },
            },
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleEmailSignIn}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            value={email}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="#"
                                className="ml-auto inline-block text-sm underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            placeholder="password"
                            autoComplete="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            onClick={() => {
                                setRememberMe(!rememberMe);
                            }}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <p> Login </p>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        disabled={loading}
                        className="gap-2"
                        onClick={async () => {
                            await signIn.passkey(
                                {
                                    email,
                                },
                                {
                                    onRequest: (ctx) => {
                                        setLoading(true);
                                    },
                                    onResponse: (ctx) => {
                                        setLoading(false);
                                    },
                                    onError: (ctx) => {
                                        toast.error(ctx.error.message || "An unexpected error occurred during passkey sign-in.");
                                    },
                                    onSuccess: (ctx) => { // Changed to arrow function for consistency
                                        toast.success("Successfully signed in with passkey!");
                                        router.refresh();
                                    }
                                },
                            )
                        }}
                    >
                        <Key size={16} />
                        Sign-in with Passkey
                    </Button>
                </form>
            </CardContent>

        </Card>
    );
}