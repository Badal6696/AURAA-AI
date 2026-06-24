import logoSrc from "@/assets/aura-logo.png";

export function AuraLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="AURA"
      width={size}
      height={size}
      className={className}
      style={{ filter: "drop-shadow(0 0 12px oklch(0.66 0.24 295 / 0.6))" }}
    />
  );
}

export function AuraWordmark({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <AuraLogo size={size} />
      <span
        className="font-display font-bold tracking-tight text-gradient-aura"
        style={{ fontSize: size * 0.75 }}
      >
        AURA
      </span>
      <span className="font-display font-light tracking-tight text-foreground/70" style={{ fontSize: size * 0.7 }}>
        — AI
      </span>
    </div>
  );
}
