import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botsTable = pgTable("bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("offline"),
  uptimeSeconds: integer("uptime_seconds").notNull().default(0),
  messagesProcessed: integer("messages_processed").notNull().default(0),
  commandsHandled: integer("commands_handled").notNull().default(0),
  errorsToday: integer("errors_today").notNull().default(0),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const botEventsTable = pgTable("bot_events", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull().references(() => botsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const botApiKeysTable = pgTable("bot_api_keys", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull().unique().references(() => botsTable.id, { onDelete: "cascade" }),
  apiKey: text("api_key").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBotSchema = createInsertSchema(botsTable).omit({ id: true, createdAt: true });
export const insertBotEventSchema = createInsertSchema(botEventsTable).omit({ id: true, createdAt: true });
export const insertBotApiKeySchema = createInsertSchema(botApiKeysTable).omit({ id: true, createdAt: true });

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof botsTable.$inferSelect;
export type InsertBotEvent = z.infer<typeof insertBotEventSchema>;
export type BotEvent = typeof botEventsTable.$inferSelect;
export type BotApiKey = typeof botApiKeysTable.$inferSelect;
