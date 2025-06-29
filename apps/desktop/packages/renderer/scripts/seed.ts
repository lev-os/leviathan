import { db } from "@/db";
import { users, channels, watchlistItems } from "@/db/schema";

// async function seed() {
//   console.log("Seeding database...")

//   // Clear existing data
//   await db.delete(watchlistItems)
//   await db.delete(channels)
//   await db.delete(users)

//   // Reset auto-increment
//   await db.execute(sql`DELETE FROM sqlite_sequence WHERE name IN ('users', 'channels', 'watchlist_items')`)

//   // Seed users
//   const [user1, user2] = await db
//     .insert(users)
//     .values([
//       { name: "John Doe", email: "john@example.com", password: "password123" },
//       { name: "Jane Smith", email: "jane@example.com", password: "password456" },
//     ])
//     .returning()

//   console.log("Users seeded")

//   // Seed channels
//   const [channel1, channel2, channel3, channel4, channel5] = await db
//     .insert(channels)
//     .values([
//       { name: "Stock Analysis", description: "Discuss stock market trends and analysis" },
//       { name: "Crypto Discussion", description: "All things cryptocurrency" },
//       { name: "Forex Trading", description: "Foreign exchange market discussions" },
//       { name: "Options Strategies", description: "Learn and share options trading strategies" },
//       { name: "Market News", description: "Latest updates on financial markets" },
//     ])
//     .returning()

//   console.log("Channels seeded")

//   // Seed watchlist items
//   await db.insert(watchlistItems).values([
//     {
//       userId: user1.id,
//       channelId: channel1.id,
//       takeProfit: "10",
//       stopLoss: "5",
//       buyAmount: "1000",
//     },
//     {
//       userId: user1.id,
//       channelId: channel2.id,
//       takeProfit: "15",
//       stopLoss: "7",
//       buyAmount: "500",
//     },
//     {
//       userId: user2.id,
//       channelId: channel3.id,
//       takeProfit: "8",
//       stopLoss: "4",
//       buyAmount: "2000",
//     },
//     {
//       userId: user2.id,
//       channelId: channel4.id,
//       takeProfit: "20",
//       stopLoss: "10",
//       buyAmount: "750",
//     },
//   ])

//   console.log("Watchlist items seeded")

//   console.log("Database seeded successfully")
// }

// seed().catch(console.error)
