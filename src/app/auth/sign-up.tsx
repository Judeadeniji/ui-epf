"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import Image from "next/image";
import { Loader2, X, ImageUp } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (password !== passwordConfirmation) {
            toast.error("Passwords do not match.");
            return;
        }
        await signUp.email({
            email,
            password,
            name: `${firstName} ${lastName}`,
            image: image ? await convertImageToBase64(image) : "",
            callbackURL: "/dashboard",
            fetchOptions: {
                onResponse: () => {
                    setLoading(false);
                },
                onRequest: () => {
                    setLoading(true);
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || "An unexpected error occurred during sign-up.");
                },
                onSuccess: async (ctx) => {
                    toast.success("Account created successfully! Redirecting...");
                    router.push("/dashboard");
                },
            },
        });
    };

    return (
        <Card className="z-50 rounded-md w-full">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSignUp}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input
                                id="first-name"
                                placeholder="Max"
                                required
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                }}
                                value={firstName}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input
                                id="last-name"
                                placeholder="Robinson"
                                required
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                }}
                                value={lastName}
                            />
                        </div>
                    </div>
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
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Profile Image (optional)</Label>
                        <div className="flex flex-col items-center gap-3 mt-1">
                            {imagePreview ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-muted shadow-sm">
                                    <Image
                                        src={imagePreview}
                                        alt="Profile preview"
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 z-10 flex items-center justify-center"
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    className="w-32 h-32 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageUp className="w-12 h-12 text-muted-foreground/70 mb-1" />
                                    <span className="text-xs">Upload Image</span>
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-[200px] mt-2"
                            >
                                {imagePreview ? "Change Image" : "Select Image"}
                            </Button>
                            <Input
                                id="image-upload-input"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            "Create an account"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

async function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}