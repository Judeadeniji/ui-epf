import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignIn from "./sign-in";
import SignUp from "./sign-up";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AuthPage() {
    const h = await headers();
    const session = await auth.api.getSession({
        headers: h
    });
    if (session) {
        redirect("/dashboard");
    }
    return (
        <main className="flex flex-col min-h-screen items-center justify-center bg-background p-4 sm:p-6 md:p-8 lg:py-24 relative">
            <figure className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8">
                <Image
                    src="/UI_logo.png"
                    alt="Logo"
                    width={80} 
                    height={80} 
                    className="object-cover sm:w-[100px] sm:h-[100px]"
                />
            </figure>
            <Tabs defaultValue="sign-in" className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <TabsList className="min-w-[400px] mx-auto">
                    <TabsTrigger value="sign-in">
                        Sign In
                    </TabsTrigger>
                    <TabsTrigger value="sign-up">
                        Sign Up
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="sign-in">
                    <SignIn />
                </TabsContent>
                <TabsContent value="sign-up">
                    <SignUp />
                </TabsContent>
            </Tabs>

        </main>
    );
}