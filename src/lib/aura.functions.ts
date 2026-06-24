import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SYSTEM_PROMPT = `You are AURA - AI, an advanced open-source artificial intelligence assistant created and developed by Nikhil Badal, a BCA Data Science student.

Your personality is confident, professional, intelligent, warm, and exceptionally helpful. You give accurate, detailed, easy-to-understand, human-like responses. You can format using Markdown (headings, bold, code blocks, lists).

If the user asks who created you, who built you, who owns you, or who you are, respond exactly:
"I am AURA - AI, an advanced open-source artificial intelligence assistant created and developed by Nikhil Badal, a BCA Data Science student."

You help with science, programming, mathematics, data science, ML, business, finance, history, geography, literature, languages, education, research, creative writing, general knowledge, and daily problem solving. You can also analyze images the user uploads (photos, screenshots, documents, diagrams, charts) and answer questions about them.

Tagline: "AURA - AI — The Future of Intelligence, Created by Nikhil Badal."`;

const PartSchema = z.union([
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({
    type: z.literal("image"),
    mimeType: z.string(),
    data: z.string(), // base64 (no data: prefix)
  }),
]);

const InputSchema = z.object({
  threadId: z.string().uuid(),
  message: z.object({
    parts: z.array(PartSchema).min(1),
  }),
});

type OpenAIContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export const sendAuraMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI gateway is not configured.");
    }

    const { supabase, userId } = context;

    const { data: thread, error: threadErr } = await supabase
      .from("threads")
      .select("id, title")
      .eq("id", data.threadId)
      .maybeSingle();
    if (threadErr) throw threadErr;
    if (!thread) throw new Error("Thread not found");

    const userText = data.message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n")
      .trim();
    const hasImage = data.message.parts.some((p) => p.type === "image");

    const { error: insertUserErr } = await supabase.from("messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "user",
      content: userText || (hasImage ? "[Image attached]" : ""),
      image_url: null,
    });
    if (insertUserErr) throw insertUserErr;

    const { data: history, error: histErr } = await supabase
      .from("messages")
      .select("role, content")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true })
      .limit(30);
    if (histErr) throw histErr;

    const messagesPayload: {
      role: "system" | "user" | "assistant";
      content: string | OpenAIContent[];
    }[] = [{ role: "system", content: SYSTEM_PROMPT }];

    for (const m of history ?? []) {
      messagesPayload.push({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content || "",
      });
    }

    if (
      messagesPayload.length > 1 &&
      messagesPayload[messagesPayload.length - 1].role === "user"
    ) {
      const content: OpenAIContent[] = [];
      for (const p of data.message.parts) {
        if (p.type === "text" && p.text) content.push({ type: "text", text: p.text });
        else if (p.type === "image")
          content.push({
            type: "image_url",
            image_url: { url: `data:${p.mimeType};base64,${p.data}` },
          });
      }
      if (content.length === 0) content.push({ type: "text", text: userText || "" });
      messagesPayload[messagesPayload.length - 1] = { role: "user", content };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messagesPayload,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI gateway error", res.status, errText);
      if (res.status === 429)
        throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits exhausted. Please add credits in Lovable Cloud.");
      throw new Error(`AURA could not respond (${res.status}). Please try again.`);
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const assistantText =
      payload.choices?.[0]?.message?.content?.trim() ||
      "I'm not sure how to respond to that.";

    const { error: insertAssistantErr } = await supabase.from("messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "assistant",
      content: assistantText,
    });
    if (insertAssistantErr) throw insertAssistantErr;

    const newTitle =
      thread.title === "New Chat" && userText ? userText.slice(0, 60) : thread.title;
    await supabase
      .from("threads")
      .update({ updated_at: new Date().toISOString(), title: newTitle })
      .eq("id", data.threadId);

    return { assistantText };
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("threads")
      .insert({ user_id: userId, title: "New Chat" })
      .select("id")
      .single();
    if (error) throw error;
    return { id: data.id };
  });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ threadId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ threadId: z.string().uuid(), title: z.string().min(1).max(120) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("threads")
      .update({ title: data.title })
      .eq("id", data.threadId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ threadId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("threads")
      .delete()
      .eq("id", data.threadId);
    if (error) throw error;
    return { ok: true };
  });
