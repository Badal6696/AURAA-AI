import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getThreadMessages, sendAuraMessage } from "@/lib/aura.functions";
import { ArrowUp, Image as ImageIcon, Copy, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { AuraLogo } from "@/components/aura-logo";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
});

type ImageAttachment = { mimeType: string; data: string; previewUrl: string };

function ChatThread() {
  const { threadId } = Route.useParams();
  const qc = useQueryClient();
  const getMessages = useServerFn(getThreadMessages);
  const send = useServerFn(sendAuraMessage);

  const messagesQuery = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => getMessages({ data: { threadId } }),
  });

  const [input, setInput] = useState("");
  const [image, setImage] = useState<ImageAttachment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (vars: { text: string; image: ImageAttachment | null }) => {
      const parts: Array<{ type: "text"; text: string } | { type: "image"; mimeType: string; data: string }> = [];
      if (vars.text) parts.push({ type: "text", text: vars.text });
      if (vars.image) parts.push({ type: "image", mimeType: vars.image.mimeType, data: vars.image.data });
      return send({ data: { threadId, message: { parts } } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "AURA could not respond");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messagesQuery.data, mutation.isPending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, mutation.isPending]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !image) return;
    if (mutation.isPending) return;
    setInput("");
    const img = image;
    setImage(null);
    if (img) URL.revokeObjectURL(img.previewUrl);
    mutation.mutate({ text, image: img });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    const buf = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    setImage({
      mimeType: file.type,
      data: base64,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const messages = messagesQuery.data ?? [];
  const isEmpty = messages.length === 0 && !mutation.isPending;

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-16 md:px-8 md:pt-8">
        <div className="mx-auto max-w-3xl space-y-6 pb-6">
          {isEmpty && <EmptyState onPick={(p) => setInput(p)} />}
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))}
          {mutation.isPending && (
            <div className="flex items-start gap-3 animate-fade-up">
              <AuraLogo size={32} className="mt-1 animate-pulse-glow flex-shrink-0" />
              <div className="shimmer-text pt-2 font-display text-sm">AURA is thinking...</div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 pb-6 md:px-8">
        <form
          onSubmit={handleSubmit}
          className="glass-strong mx-auto max-w-3xl rounded-2xl p-3 transition focus-within:glow-cyan"
        >
          {image && (
            <div className="relative mb-2 inline-block">
              <img src={image.previewUrl} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-white/10" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(image.previewUrl);
                  setImage(null);
                }}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={mutation.isPending}
              className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-aura-cyan disabled:opacity-50"
              title="Attach image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask AURA anything..."
              rows={1}
              className="max-h-48 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              style={{ minHeight: "44px" }}
            />
            <button
              type="submit"
              disabled={mutation.isPending || (!input.trim() && !image)}
              className="btn-aura flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-40"
              aria-label="Send"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          AURA — AI · created by Nikhil Badal · open-source
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex animate-fade-up items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && <AuraLogo size={32} className="mt-1 flex-shrink-0" />}
      <div className={`min-w-0 ${isUser ? "max-w-[80%]" : "flex-1"}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-aura-cyan/30 to-aura-violet/30 px-4 py-2.5 text-sm text-foreground ring-1 ring-white/10">
            {content}
          </div>
        ) : (
          <div className="aura-prose text-sm text-foreground/95">
            <ReactMarkdown>{content}</ReactMarkdown>
            <div className="mt-3 flex gap-1 opacity-60 transition hover:opacity-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  toast.success("Copied");
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-aura-cyan"
                title="Copy"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  const prompts = [
    "Explain quantum entanglement like I'm 15",
    "Write a Python script to scrape a webpage",
    "Help me plan a 1-month data science roadmap",
    "Brainstorm 5 startup ideas in EdTech",
  ];
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <AuraLogo size={120} className="animate-pulse-glow animate-float" />
      <h2 className="mt-6 font-display text-3xl font-bold">
        Hello, I'm <span className="text-gradient-aura">AURA</span>
      </h2>
      <p className="mt-2 text-muted-foreground">Your open-source AI companion. How can I help today?</p>
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="glass rounded-xl px-4 py-3 text-left text-sm text-foreground/85 transition hover:-translate-y-0.5 hover:text-foreground hover:glow-cyan"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
