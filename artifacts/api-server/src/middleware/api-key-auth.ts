import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { botApiKeysTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export async function requireBotApiKey(req: Request, res: Response, next: NextFunction) {
  const rawHeader = req.headers["x-api-key"];
  const apiKey = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  const botId = parseInt(req.params.id ?? "", 10);

  if (!apiKey) {
    res.status(401).json({ error: "Missing X-API-Key header." });
    return;
  }

  if (isNaN(botId)) {
    res.status(400).json({ error: "Invalid bot id." });
    return;
  }

  const [row] = await db
    .select()
    .from(botApiKeysTable)
    .where(and(eq(botApiKeysTable.botId, botId), eq(botApiKeysTable.apiKey, apiKey)));

  if (!row) {
    res.status(401).json({ error: "Invalid API key for this bot." });
    return;
  }

  next();
}
