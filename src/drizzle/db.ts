import { $client } from "@/lib/libsql";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/drizzle/schema";

export const db = drizzle($client, {
    schema
})