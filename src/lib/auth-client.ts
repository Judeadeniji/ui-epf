import { passkeyClient, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { accessControl, admin, officer } from "./permissions";


export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    plugins: [adminClient({
        ac: accessControl,
        roles: {
            officer,
            admin
        }
    }), passkeyClient()]
})

export const {
    signIn,
    signOut,
    signUp,
    useSession,
    useListPasskeys,
} = authClient;