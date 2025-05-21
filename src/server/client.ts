import { hc } from "hono/client";
import type { Server } from "@/server";

const origin = () => location.origin;
console.log({
    origin: origin(),
});
const client = hc<Server>(new URL(origin()).toString());

export { client };