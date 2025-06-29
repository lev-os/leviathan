// import { drizzle } from "drizzle-orm/better-sqlite3"
// import Database from "better-sqlite3"
// import * as schema from "./schema"

// const sqlite = new Database("sqlite.db")
// export const db = drizzle(sqlite, { schema })

import { drizzle } from "drizzle-orm/libsql/sqlite3";

export const db = drizzle({
  connection: {
    url: "file:sqlite.db",
  },
});
