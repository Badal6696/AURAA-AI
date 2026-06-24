import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Pencil, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { createThread, deleteThread, listThreads, renameThread } from "@/lib/aura.functions";
import { supabase } from "@/integrations/supabase/client";
import { AuraWordmark } from "@/components/aura-logo";
import { StarField } from "@/components/star-field";
import cosmosImg from "@/assets/aura-cosmos.jpg";
import mountainVideo from "@/assets/mountain-bg.mp4.asset.json";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const remove = useServerFn(deleteThread);
  const rename = useServerFn(renameThread);

  const threads = useQuery({
    queryKey: ["threads"],
    queryFn: () => list(),
  });

  const filtered = (threads.data ?? []).filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleNew = async () => {
    try {
      const { id } = await create();
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: id } });
      setSidebarOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start a new chat");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;
    await remove({ data: { threadId: id } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (activeId === id) navigate({ to: "/chat" });
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return setEditing(null);
    await rename({ data: { threadId: id, title: editTitle.trim() } });
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["threads"] });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/" });
  };

  // Auto-create first thread if user lands on /chat with none
  useEffect(() => {
    if (!activeId && threads.data && threads.data.length === 0) {
      handleNew();
    } else if (!activeId && threads.data && threads.data.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: threads.data[0].id }, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, threads.data]);

  return (
    <div className="relative flex h-screen overflow-hidden text-foreground">
      <StarField />
      <div className="pointer-events-none fixed inset-0 -z-20">
        <img src={cosmosImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <video
          autoPlay loop muted playsInline preload="auto" poster={cosmosImg} aria-hidden="true"
          className="relative h-full w-full object-cover opacity-50"
        >
          <source src={mountainVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Sidebar */}
      <aside
        className={`glass-strong absolute inset-y-0 left-0 z-30 flex w-80 flex-col border-r border-white/5 transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5">
          <Link to="/"><AuraWordmark size={22} /></Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4">
          <button
            onClick={handleNew}
            className="btn-aura flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" /> New chat
          </button>
        </div>

        <div className="relative mx-4 mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-xl border border-input bg-input/20 py-2 pl-9 pr-3 text-sm outline-none focus:border-aura-cyan"
          />
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {threads.isLoading && <p className="px-2 text-xs text-muted-foreground">Loading...</p>}
          {filtered.map((t) => {
            const isActive = activeId === t.id;
            return (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-xl px-2 transition ${
                  isActive ? "bg-secondary/80 glow-cyan" : "hover:bg-secondary/40"
                }`}
              >
                {editing === t.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRename(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(t.id);
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="flex-1 rounded-lg bg-transparent px-2 py-2 text-sm outline-none"
                  />
                ) : (
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    onClick={() => setSidebarOpen(false)}
                    className="min-w-0 flex-1 truncate py-2.5 text-sm"
                  >
                    {t.title || "Untitled"}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setEditing(t.id);
                    setEditTitle(t.title);
                  }}
                  className="opacity-0 transition group-hover:opacity-100 hover:text-aura-cyan p-1"
                  title="Rename"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 transition group-hover:opacity-100 hover:text-destructive p-1"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && !threads.isLoading && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No conversations yet</p>
          )}
        </nav>

        <div className="border-t border-white/5 p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary/40 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-black/50 md:hidden" />
      )}

      {/* Main */}
      <main className="relative flex flex-1 flex-col">
        <button
          onClick={() => setSidebarOpen(true)}
          className="glass absolute left-4 top-4 z-10 rounded-xl p-2 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Outlet />
      </main>
    </div>
  );
}
