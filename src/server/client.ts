import { hc } from "hono/client";
import type { Server } from "@/server";

const origin = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";


const client = hc<Server>(new URL(origin).toString());

export { client };