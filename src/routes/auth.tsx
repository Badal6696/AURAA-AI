import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuraWordmark } from "@/components/aura-logo";
import { StarField } from "@/components/star-field";
import cosmosImg from "@/assets/aura-cosmos.jpg";
import mountainVideo from "@/assets/mountain-bg.mp4.asset.json";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · AURA - AI" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/chat" });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/chat" },
        });
        if (error) throw error;
        toast.success("Account created! You're in.");
        navigate({ to: "/chat" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to AURA");
        navigate({ to: "/chat" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/chat",
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: "/chat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <StarField />
      <div className="pointer-events-none fixed inset-0 -z-20">
        <img src={cosmosImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <video
          autoPlay loop muted playsInline preload="auto" poster={cosmosImg} aria-hidden="true"
          className="relative h-full w-full object-cover opacity-70"
        >
          <source src={mountainVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <Link
        to="/"
        className="glass absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <AuraWordmark size={32} />
          </Link>
        </div>

        <div className="glass-strong rounded-3xl p-8 glow">
          <h1 className="font-display text-3xl font-bold text-center">
            {mode === "signin" ? "Welcome back" : "Join AURA"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue your conversations" : "Create your account in seconds"}
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="glass mt-7 flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-secondary/80 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@cosmos.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-input/30 px-4 py-3 text-sm outline-none transition focus:border-aura-cyan focus:ring-2 focus:ring-aura-cyan/20"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-input bg-input/30 px-4 py-3 text-sm outline-none transition focus:border-aura-cyan focus:ring-2 focus:ring-aura-cyan/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-aura flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to AURA?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-aura-cyan hover:underline"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to chat respectfully with AURA. Created by Nikhil Badal.
        </p>
      </div>
    </div>
  );
}
