import { hc } from "hono/client";

const origin = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_URL)!;

const client = hc<import("@/server").Server>(new URL(origin).toString());

export { client };