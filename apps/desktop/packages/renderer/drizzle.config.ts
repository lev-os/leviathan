import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // driver: "sqlite3",
  // dbCredentials: {
  //   url: "sqlite.db",
  // },
} satisfies Config;
