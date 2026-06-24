import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Image as ImageIcon, MessageSquare, Code2, BookOpen, Brain, ArrowRight, Github } from "lucide-react";
import mountainVideo from "@/assets/mountain-bg.mp4.asset.json";
import cosmosImg from "@/assets/aura-cosmos.jpg";
import { AuraWordmark, AuraLogo } from "@/components/aura-logo";
import { StarField } from "@/components/star-field";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AURA - AI · The Future of Intelligence" },
      {
        name: "description",
        content:
          "AURA - AI: an advanced open-source AI assistant by Nikhil Badal. Chat, analyze images, code, learn and create.",
      },
    ],
  }),
  component: Landing,
});

const capabilities = [
  { icon: MessageSquare, title: "Conversational Intelligence", desc: "Natural, nuanced answers across every domain — from quantum physics to creative prose." },
  { icon: ImageIcon, title: "Vision Understanding", desc: "Upload photos, diagrams, screenshots or charts. AURA sees and explains them." },
  { icon: Code2, title: "Code & Debug", desc: "Generate, review, refactor and debug code in any modern language." },
  { icon: Brain, title: "Deep Reasoning", desc: "Complex problem solving with step-by-step clarity you can actually follow." },
  { icon: BookOpen, title: "Study & Research", desc: "Summarize papers, explain concepts, plan curricula and answer with sources." },
  { icon: Sparkles, title: "Creative Assistant", desc: "Stories, scripts, brand copy, ideation — drafted with style and voice." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <StarField />

      {/* Mountain scenery video backdrop — hero of the page */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <img
          src={cosmosImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={cosmosImg}
          aria-hidden="true"
          className="relative h-full w-full object-cover"
        >
          <source src={mountainVideo.url} type="video/mp4" />
        </video>
        {/* lighter overlay so the video is clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background/80" />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <AuraWordmark size={28} />
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Capabilities</a>
          <a href="#modes" className="transition hover:text-foreground">Modes</a>
          <a href="#creator" className="transition hover:text-foreground">Creator</a>
        </nav>
        <Link
          to="/auth"
          className="btn-aura inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
        >
          Launch AURA <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-32 text-center">
        <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-aura-cyan glow-cyan animate-pulse-glow" />
          Open-source · Multimodal · Built for the future
        </div>

        <h1
          className="animate-fade-up text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
          style={{ animationDelay: "0.1s" }}
        >
          The Future of <span className="text-gradient-aura animate-gradient">Intelligence</span>
        </h1>

        <p
          className="animate-fade-up mt-8 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl"
          style={{ animationDelay: "0.2s" }}
        >
          Meet <span className="text-foreground font-semibold">AURA — AI</span>, an advanced open-source
          assistant that thinks, sees, codes and creates. Crafted by{" "}
          <span className="text-foreground font-semibold">Nikhil Badal</span>.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            to="/auth"
            className="btn-aura group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base"
          >
            Start chatting free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#features"
            className="glass inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base hover:bg-secondary/60"
          >
            <Github className="h-4 w-4" /> Explore capabilities
          </a>
        </div>

        {/* Orb */}
        <div
          className="animate-fade-up relative mt-24 flex items-center justify-center"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="absolute inset-0 -z-10 blur-3xl">
            <div className="mx-auto h-80 w-80 rounded-full bg-gradient-to-br from-aura-cyan via-aura-violet to-aura-pink opacity-50 animate-pulse-glow" />
          </div>
          <div className="relative animate-float">
            <AuraLogo size={260} className="animate-spin-slow" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-32">
        <div className="mb-14 text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Engineered for everything</h2>
          <p className="mt-4 text-muted-foreground">One assistant. Every discipline.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <div
              key={c.title}
              className="glass group relative overflow-hidden rounded-2xl p-7 transition hover:-translate-y-1 hover:glow"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-aura-cyan/30 to-aura-violet/30 ring-1 ring-white/10">
                <c.icon className="h-5 w-5 text-aura-cyan" />
              </div>
              <h3 className="font-display text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-aura-violet/20 blur-3xl opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Modes */}
      <section id="modes" className="relative z-10 mx-auto max-w-5xl px-6 pb-32 text-center">
        <h2 className="font-display text-4xl font-bold md:text-5xl">Many minds, one AURA</h2>
        <p className="mt-4 text-muted-foreground">Switch your conversation by intent.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["Assistant", "Coding", "Study", "Research", "Creative"].map((m) => (
            <span
              key={m}
              className="glass rounded-full px-5 py-2 text-sm text-foreground/90 transition hover:bg-secondary/60"
            >
              {m}
            </span>
          ))}
        </div>
      </section>

      {/* Creator */}
      <section id="creator" className="relative z-10 mx-auto max-w-4xl px-6 pb-32">
        <div className="glass-strong rounded-3xl p-10 text-center md:p-14">
          <p className="text-sm uppercase tracking-[0.3em] text-aura-cyan">Built by</p>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            <span className="text-gradient-aura">Nikhil Badal</span>
          </h2>
          <p className="mt-3 text-muted-foreground">BCA · Data Science Student · Open-source advocate</p>
          <p className="mx-auto mt-6 max-w-xl text-foreground/80">
            "I built AURA — AI to make world-class artificial intelligence open, beautiful, and
            accessible to everyone. This is the future, and it belongs to all of us."
          </p>
          <Link
            to="/auth"
            className="btn-aura mt-8 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base"
          >
            Experience AURA <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        AURA — AI · The Future of Intelligence, Created by Nikhil Badal · Open Source
      </footer>
    </div>
  );
}
