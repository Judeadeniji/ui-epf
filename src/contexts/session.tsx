"use client";

import { Session, User } from "better-auth";
import { redirect } from "next/navigation";
import { createContext, use } from "react";

export type SessionContext = {
    session: Session;
    user: User
};

const sessionContext = createContext<SessionContext | null>(null);

export function SessionProvider({ children, ctx }: { children: React.ReactNode; ctx: SessionContext }) {
    return (
        <sessionContext.Provider value={ctx}>
            {children}
        </sessionContext.Provider>
    );
}


export function useSession() {
    const ctx = use(sessionContext);

    if (!ctx) {
        redirect("/auth")
    }
    return ctx;
}