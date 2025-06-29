import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tgMessages = sqliteTable('tg_msg', {
  id: int().primaryKey({ autoIncrement: true }),
  msg_id: int(),
  chat_id: int(),
  ca: text(),
  sender_id: int(),
  text: text().notNull(),
  type: text().notNull(),
  data: text().notNull(),
  timestamp: int(),
})

export const caScanner = sqliteTable('ca_scanner', {
  id: int().primaryKey({ autoIncrement: true }),
  ca: text().notNull(),
  chat_id: int(),
  sender_id: int(),
  timestamp: int().notNull(),
})

export const trade = sqliteTable('trade', {
  id: int().primaryKey({ autoIncrement: true }),
  mint: text().notNull(),
  startingPrice: int().notNull(),
  price: int().notNull(),
  created: int().notNull(),
  updated: int().notNull(),
})
