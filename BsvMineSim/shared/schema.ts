import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const miningStats = pgTable("mining_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  hashrate: real("hashrate").notNull().default(0),
  sharesSubmitted: integer("shares_submitted").notNull().default(0),
  sharesAccepted: integer("shares_accepted").notNull().default(0),
  sharesRejected: integer("shares_rejected").notNull().default(0),
  bsvBalance: real("bsv_balance").notNull().default(0),
  earningsToday: real("earnings_today").notNull().default(0),
  networkDifficulty: text("network_difficulty").notNull().default("0"),
  poolLatency: integer("pool_latency").notNull().default(0),
  cpuUsage: integer("cpu_usage").notNull().default(0),
  temperature: integer("temperature").notNull().default(0),
  activeWorkers: integer("active_workers").notNull().default(0),
  connectionStatus: text("connection_status").notNull().default("disconnected"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const miningActivity = pgTable("mining_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // 'share_accepted', 'share_rejected', 'pool_connected', etc.
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const poolSettings = pgTable("pool_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  poolUrl: text("pool_url").notNull().default("pool.bsvmining.com:4334"),
  workerName: text("worker_name").notNull(),
  workerPassword: text("worker_password").notNull(),
  bsvAddress: text("bsv_address").notNull(),
  miningIntensity: text("mining_intensity").notNull().default("high"),
  cpuThreads: integer("cpu_threads").notNull().default(4),
  isActive: boolean("is_active").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMiningStatsSchema = createInsertSchema(miningStats).omit({
  id: true,
  timestamp: true,
});

export const insertMiningActivitySchema = createInsertSchema(miningActivity).omit({
  id: true,
  timestamp: true,
});

export const insertPoolSettingsSchema = createInsertSchema(poolSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MiningStats = typeof miningStats.$inferSelect;
export type InsertMiningStats = z.infer<typeof insertMiningStatsSchema>;
export type MiningActivity = typeof miningActivity.$inferSelect;
export type InsertMiningActivity = z.infer<typeof insertMiningActivitySchema>;
export type PoolSettings = typeof poolSettings.$inferSelect;
export type InsertPoolSettings = z.infer<typeof insertPoolSettingsSchema>;
