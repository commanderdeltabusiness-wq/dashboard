import { Router } from "express";
import { db } from "@workspace/db";
import { botsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const rows = await db
    .select({
      totalBots: sql<number>`count(*)::int`,
      onlineBots: sql<number>`count(*) filter (where status = 'online')::int`,
      offlineBots: sql<number>`count(*) filter (where status = 'offline')::int`,
      errorBots: sql<number>`count(*) filter (where status = 'error')::int`,
      totalMessages: sql<number>`coalesce(sum(messages_processed), 0)::int`,
      totalCommands: sql<number>`coalesce(sum(commands_handled), 0)::int`,
      totalErrors: sql<number>`coalesce(sum(errors_today), 0)::int`,
    })
    .from(botsTable);

  const summary = rows[0] ?? {
    totalBots: 0,
    onlineBots: 0,
    offlineBots: 0,
    errorBots: 0,
    totalMessages: 0,
    totalCommands: 0,
    totalErrors: 0,
  };
  res.json(summary);
});

export default router;
