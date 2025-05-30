import { db } from "@/drizzle/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { haveIBeenPwned, admin as pluginAdmin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { accessControl, admin, officer } from "./permissions";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
    appName: "University of Ibadan",
    logger: {
        disabled: false,
        level: "debug",
        log(level, message, ...args) {
            console[level]("[AUTH]", message, ...args);
        },
    },
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
        disableSignUp: process.env.NODE_ENV === "production",
        enabled: true,
        async sendResetPassword(data) {
            // TODO:Configure resend
            console.log("sendResetPassword", data);
        },
    },
    plugins: [pluginAdmin({
        ac: accessControl,
        defaultRole: "officer",
        adminRoles: ["admin"],
        roles: {
            officer,
            admin,
        }
    }),  passkey(), nextCookies()],
})