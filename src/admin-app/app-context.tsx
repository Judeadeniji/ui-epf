import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { createContext, use } from "react";
import { Navigate } from "react-router";

export type AppContextType = ReturnType<typeof useSession> & {}

const appContext = createContext<AppContextType | null>(null)

export function useAppContext() {
    const context = use(appContext);
    if (!context) {
        redirect("/auth");
    }
    return context;
}

export function AppContext({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = useSession();

    if (!session.isPending && !session.data) {
        return <Navigate to="/auth" />
    }
    return (
        <appContext.Provider value={{...session}}>
            {children}
        </appContext.Provider>
    )
}
