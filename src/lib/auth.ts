import { db } from "@/drizzle/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    ...(process.env.NODE_ENV === "development" ? {
        trustedOrigins(request) {
        const host = request.headers.get("host");
        if (!host) {
            return [];
        }

        return [process.env.BETTER_AUTH_URL!, `http://${host}`];
    }
    } : {}),
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(data, request) {
            // TODO:Configure resend
            console.log("sendResetPassword", data, request);
        },
    },
    plugins: [passkey(), nextCookies()]

})