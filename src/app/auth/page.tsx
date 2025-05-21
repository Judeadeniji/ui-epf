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
        <main className="p-4">
            <figure className="mb-4 flex items-center gap-x-2">
                <Image
                    src="/UI_logo.png"
                    alt="Logo"
                    width={100} 
                    height={100} 
                    className="object-cover sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px]"
                    priority
                />
                <figcaption className="text-center text-xl font-bold font-mono text-primary leading-snug">
                    University of Ibadan
                </figcaption>
            </figure>
            <Tabs defaultValue="sign-in" className="mx-auto sm:w-fit">
                <TabsList className="mx-auto w-full">
                    <TabsTrigger value="sign-in">
                        Sign In
                    </TabsTrigger>
                    <TabsTrigger value="sign-up">
                        Sign Up
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="sign-in" className="w-full sm:w-md">
                    <SignIn />
                </TabsContent>
                <TabsContent value="sign-up" className="w-full sm:w-lg">
                    <SignUp />
                </TabsContent>
            </Tabs>
        </main>
    );
}