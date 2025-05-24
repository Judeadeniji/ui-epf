import { SessionProvider } from "@/contexts/session";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/auth");
    }

    return (
        <SessionProvider ctx={session}>
            <main>
                {children}
            </main>
        </SessionProvider>
    );
}