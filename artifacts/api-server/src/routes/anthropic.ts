import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `You are Luna, a warm and calm daily life companion app for a young woman managing her goals independently. Your role is to:
- Listen with genuine empathy and care
- Offer gentle encouragement and grounded perspective
- Help with goal setting, habit building, and daily planning
- Provide mindfulness and self-care guidance when appropriate
- Be calm, thoughtful, and supportive — never preachy or prescriptive

Keep responses concise (2-4 sentences usually), warm, and personal. You are a trusted friend who happens to have wisdom about wellbeing and personal growth. Never use emojis or overly clinical language.`;

router.get("/anthropic/conversations", async (req, res) => {
  const conversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(conversationsTable.createdAt);
  res.json(conversations);
});

router.post("/anthropic/conversations", async (req, res) => {
  const { title } = req.body as { title: string };
  const [conversation] = await db
    .insert(conversationsTable)
    .values({ title: title || "New conversation" })
    .returning();
  res.status(201).json(conversation);
});

router.get("/anthropic/conversations/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, id));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);

  res.json({ ...conversation, messages });
});

router.delete("/anthropic/conversations/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.status(204).end();
});

router.get("/anthropic/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);
  res.json(messages);
});

router.post("/anthropic/conversations/:id/messages", async (req, res) => {
  const conversationId = Number(req.params.id);
  const { content } = req.body as { content: string };

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db
    .insert(messagesTable)
    .values({ conversationId, role: "user", content });

  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(messagesTable.createdAt);

  const chatMessages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: chatMessages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullResponse += event.delta.text;
      res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
    }
  }

  await db
    .insert(messagesTable)
    .values({ conversationId, role: "assistant", content: fullResponse });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
