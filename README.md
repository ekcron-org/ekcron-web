# ekcron-web

Public marketing + writing site for Ekcron. Built with [Astro](https://astro.build),
MDX content collections, and Tailwind CSS v4. Statically generated — deploys as
plain files to any static host (Cloudflare Pages recommended, since DNS + R2 are
already there).

The internal product/dashboard is a **separate** app on `app.ekcron.com`; this
site only links to it (see [Auth handoff](#auth-handoff)).

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # static output → ./dist
pnpm preview      # serve the built site locally
pnpm check        # type-check .astro/.ts
```

## Writing content (no code changes needed)

Posts are MDX files. To publish, drop a file into the right folder — it appears
automatically in the index (newest first) and in the RSS feed.

- Blog → `src/content/blog/<slug>.mdx`
- Research → `src/content/research/<slug>.mdx`

Frontmatter (schema enforced in `src/content.config.ts`):

```yaml
---
title: "Post title"
description: "One-line summary used for listings and SEO."
pubDate: 2026-07-24
updatedDate: 2026-07-25   # optional
tags: ["fine-tuning"]     # optional
draft: false              # optional; true hides it from build + lists
---
```

The URL is the filename, e.g. `src/content/blog/hello.mdx` → `/blog/hello/`.

## Configuration (nothing brand-specific is hardcoded)

All brand/deployment values are env vars with fallbacks, read in
`src/consts.ts`. Set them in the host's build environment (or a local `.env`):

| Variable | Default | Purpose |
|---|---|---|
| `PUBLIC_SITE_NAME` | `Ekcron` | Brand name in nav, footer, titles |
| `PUBLIC_SITE_URL` | `https://ekcron.com` | Canonical URL, sitemap, RSS |
| `PUBLIC_SITE_TAGLINE` | see consts | Home hero headline |
| `PUBLIC_SITE_DESCRIPTION` | see consts | Meta description / hero subtitle |
| `PUBLIC_APP_URL` | `https://app.ekcron.com` | Where sign-in links point |

Home-page topics and the FAQ are also plain arrays in `src/consts.ts` — edit
there, no template changes.

## Deploy (Cloudflare Pages)

- **Framework preset:** Astro
- **Build command:** `pnpm build`
- **Output directory:** `dist`
- Add the env vars above under the project's build settings.
- Assign the custom domain `ekcron.com` (+ `www`) to this Pages project.

## Auth handoff

This site has **no auth logic**. Sign-in links point to the app:

- Nav / footer "Sign in" → `${PUBLIC_APP_URL}/sign-in`

The app (Clerk today) owns login and, on sign-out, redirects back here. See the
app repo for the matching redirect config.
