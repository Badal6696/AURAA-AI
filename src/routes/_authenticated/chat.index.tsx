import { createFileRoute } from "@tanstack/react-router";
import { AuraLogo } from "@/components/aura-logo";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: () => (
    <div className="flex h-full flex-1 items-center justify-center">
      <div className="text-center">
        <AuraLogo size={120} className="mx-auto animate-pulse-glow" />
        <p className="mt-6 shimmer-text font-display text-lg">Awakening AURA...</p>
      </div>
    </div>
  ),
});
