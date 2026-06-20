import { Router } from "express";
import { db } from "@workspace/db";
import { botsTable, botEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateBotBody,
  UpdateBotBody,
  PingBotBody,
  GetBotParams,
  UpdateBotParams,
  DeleteBotParams,
  PingBotParams,
  ListBotEventsParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/bots", async (req, res) => {
  const bots = await db.select().from(botsTable).orderBy(botsTable.createdAt);
  const result = bots.map((b) => ({
    ...b,
    lastSeenAt: b.lastSeenAt ? b.lastSeenAt.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/bots", async (req, res) => {
  const parsed = CreateBotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, description } = parsed.data;
  const [bot] = await db
    .insert(botsTable)
    .values({ name, description: description ?? null })
    .returning();
  await db.insert(botEventsTable).values({ botId: bot.id, type: "info", message: `Bot "${name}" registered.` });
  res.status(201).json({
    ...bot,
    lastSeenAt: bot.lastSeenAt ? bot.lastSeenAt.toISOString() : null,
    createdAt: bot.createdAt.toISOString(),
  });
});

router.get("/bots/:id", async (req, res) => {
  const parsed = GetBotParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, parsed.data.id));
  if (!bot) {
    res.status(404).json({ error: "Bot not found" });
    return;
  }
  res.json({
    ...bot,
    lastSeenAt: bot.lastSeenAt ? bot.lastSeenAt.toISOString() : null,
    createdAt: bot.createdAt.toISOString(),
  });
});

router.patch("/bots/:id", async (req, res) => {
  const paramsParsed = UpdateBotParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateBotBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const update: Partial<typeof botsTable.$inferInsert> = {};
  const { name, description, status } = bodyParsed.data;
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (status !== undefined) update.status = status;

  const [bot] = await db
    .update(botsTable)
    .set(update)
    .where(eq(botsTable.id, paramsParsed.data.id))
    .returning();
  if (!bot) {
    res.status(404).json({ error: "Bot not found" });
    return;
  }
  res.json({
    ...bot,
    lastSeenAt: bot.lastSeenAt ? bot.lastSeenAt.toISOString() : null,
    createdAt: bot.createdAt.toISOString(),
  });
});

router.delete("/bots/:id", async (req, res) => {
  const parsed = DeleteBotParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(botsTable).where(eq(botsTable.id, parsed.data.id));
  res.status(204).send();
});

router.post("/bots/:id/ping", async (req, res) => {
  const paramsParsed = PingBotParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = PingBotBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { status, messagesProcessed, commandsHandled, errorsToday } = bodyParsed.data;
  const update: Partial<typeof botsTable.$inferInsert> = {
    status,
    lastSeenAt: new Date(),
  };
  if (messagesProcessed !== undefined) update.messagesProcessed = messagesProcessed;
  if (commandsHandled !== undefined) update.commandsHandled = commandsHandled;
  if (errorsToday !== undefined) update.errorsToday = errorsToday;

  const [bot] = await db
    .update(botsTable)
    .set(update)
    .where(eq(botsTable.id, paramsParsed.data.id))
    .returning();
  if (!bot) {
    res.status(404).json({ error: "Bot not found" });
    return;
  }
  if (status === "error") {
    await db.insert(botEventsTable).values({ botId: bot.id, type: "error", message: "Bot reported error status." });
  }
  res.json({
    ...bot,
    lastSeenAt: bot.lastSeenAt ? bot.lastSeenAt.toISOString() : null,
    createdAt: bot.createdAt.toISOString(),
  });
});

router.get("/bots/:id/events", async (req, res) => {
  const parsed = ListBotEventsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const events = await db
    .select()
    .from(botEventsTable)
    .where(eq(botEventsTable.botId, parsed.data.id))
    .orderBy(desc(botEventsTable.createdAt))
    .limit(50);
  res.json(
    events.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    }))
  );
});

export default router;
