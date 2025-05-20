import { hc } from "hono/client";
import type { Server } from "@/server";

console.log("Client URL:", "/api/v1", );

const origin = process.env.NEXT_PUBLIC_URL!;

const client = hc<Server>(new URL(origin).toString());

export { client };