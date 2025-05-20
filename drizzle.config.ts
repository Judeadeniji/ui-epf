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

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/drizzle/schema.ts",
  out: "./.drizzle/migrations",
  dbCredentials: process.env.NODE_ENV === "production" ? {
    url: process.env.TURSO_DATABASE_URL!,
    token: process.env.TURSO_AUTH_TOKEN!,
  } : {
    url: getLocalDb(),
  },
});