import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const channels = sqliteTable("channels", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const watchlistItems = sqliteTable("watchlist_items", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  channelId: integer("channel_id")
    .notNull()
    .references(() => channels.id),
  takeProfit: text("take_profit"),
  stopLoss: text("stop_loss"),
  buyAmount: text("buy_amount"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
