import { server } from "@/server";
import { handle } from "hono/vercel";

export const GET = handle(server);
export const POST = handle(server);
export const PUT = handle(server);
export const DELETE = handle(server);