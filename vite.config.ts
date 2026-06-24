// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Enable Cloudflare Workers (nitro) build outside of the Lovable sandbox.
  // deployConfig:true makes Nitro write wrangler.json into .output/server/ at
  // build time — so the source tree stays free of any wrangler config file
  // (Cloudflare's drag-and-drop uploader rejects projects that contain one).
  // Deploy with: npm run build && npx wrangler deploy --config .output/server/wrangler.json
  nitro: {
    preset: "cloudflare-module",
    cloudflare: { nodeCompat: true, deployConfig: false },
  },
  vite: {
    // Allow Vite to import and hash .mp4 files referenced from src/assets/
    assetsInclude: ["**/*.mp4"],
  },
});
