import { hc } from "hono/client";
import type { Server } from "@/server";

console.log("Client URL:", "/api/v1", );

const client = hc<Server>(new URL(location.origin).toString());

export { client };