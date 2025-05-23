import { hc } from "hono/client";
import type { Server } from "@/server";

const origin = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_URL)!;

const client = hc<Server>(new URL(origin).toString());

export { client };