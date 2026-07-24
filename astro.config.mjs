// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Config-driven: override at build time with PUBLIC_SITE_URL.
  site: process.env.PUBLIC_SITE_URL ?? "https://ekcron.com",
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // Dual-theme highlighting; the .dark class swaps the palette (see global.css).
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});
