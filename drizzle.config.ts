import "dotenv/config";
import { readdirSync } from "fs";
import path from "path";
import { defineConfig } from "drizzle-kit";

function getLocalDb() {
  try {
    const basePath = path.resolve("src");
    const dbFile = readdirSync(basePath, { encoding: "utf-8", recursive: true }).find((file) => file.endsWith(".db"));
    if (!dbFile) {
      throw new Error("No database file found");
    }

    const url = path.resolve(basePath, dbFile);
    // replace C with file and \ with /
    const fileUrl = url.replace("C:", "file:///C:").replace(/\\/g, "/");
    return fileUrl;
  } catch (error) {
   throw new Error("No database file found", { cause: error });
  }
}

const isProduction = process.env.NODE_ENV === "production";

console.log("Client URL:", isProduction ? process.env.TURSO_DATABASE_URL : getLocalDb());

export default defineConfig({
  dialect: isProduction ? "turso" : "sqlite",
  schema: "./src/drizzle/schema.ts",
  out: "./.drizzle/migrations",
  dbCredentials: isProduction ? {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  } : {
    url: getLocalDb(),
  },
});