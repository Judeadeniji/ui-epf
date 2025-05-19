import { createClient } from "@libsql/client";
import { readdirSync } from "fs";
import path from "path";

function getLocalDb() {
  try {
    const basePath = path.resolve(process.cwd(), "src");
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


export const $client = createClient({
    url: getLocalDb(),
})