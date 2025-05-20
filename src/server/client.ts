import { hc } from "hono/client";
import type { Server } from "@/server";

console.log("Client URL:", "/api/v1", );

const origin = process.env.NEXT_PUBLIC_URL || process.env.NODE_ENV === "production"
    ? "https://ui-epf.onrender.com"
    : "http://localhost:3000";

const client = hc<Server>(new URL(origin).toString());

export { client };