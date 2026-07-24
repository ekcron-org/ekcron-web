/**
 * Site-wide configuration. Everything brand- or deployment-specific is driven
 * by env vars (PUBLIC_* so they're available at build time) with sensible
 * fallbacks, so the site can be re-pointed or re-branded without touching JSX.
 */

const env = import.meta.env;

export const SITE = {
  name: env.PUBLIC_SITE_NAME ?? "Ekcron",
  url: env.PUBLIC_SITE_URL ?? "https://ekcron.com",
  tagline: env.PUBLIC_SITE_TAGLINE ?? "Language models, fine-tuning, and small models.",
  description:
    env.PUBLIC_SITE_DESCRIPTION ??
    "Ekcron explores how language models work, how fine-tuning and distillation shape them, and how small models can match far larger ones — through writing and experiments.",
} as const;

/** Where the internal app / dashboard is hosted. Sign-in links point here. */
export const APP_URL = env.PUBLIC_APP_URL ?? "https://app.ekcron.com";

export const NAV: { href: string; label: string }[] = [
  { href: "/research", label: "Research" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
];

/** Topics the site is about — shown on the home page. Edit freely. */
export const TOPICS: { title: string; body: string }[] = [
  {
    title: "Understanding LLMs",
    body: "How large language models actually behave — their capabilities, limits, and the mechanics underneath.",
  },
  {
    title: "Fine-tuning",
    body: "Adapting open models to specific tasks: the methods, the trade-offs, and what holds up in practice.",
  },
  {
    title: "Small models",
    body: "Getting big-model quality from compact models through distillation — and how to tell whether it worked.",
  },
];

/** Help / FAQ content. Plain and generic; add entries as questions come up. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is this?",
    a: "A place focused on language models — understanding how they work, how fine-tuning and distillation change them, and how small models can go further than their size suggests. It's writing and experiments, not a sales pitch.",
  },
  {
    q: "What will I find here?",
    a: "Blog posts on LLMs and fine-tuning, and longer research notes on distillation, small models, and evaluation. New writing is added regularly.",
  },
  {
    q: "Who is it for?",
    a: "Engineers and researchers curious about fine-tuning open models and running smaller ones — anyone who wants the practical details, not just the headlines.",
  },
  {
    q: "How do I follow along?",
    a: "Subscribe to the RSS feed, or just check back. Everything is public.",
  },
  {
    q: "Is there a product?",
    a: "Not yet. This is where the thinking and the experiments live. Anything usable will show up here first.",
  },
];
