/**
 * Site-wide configuration and copy.
 */

const env = import.meta.env;

export const SITE = {
  name: env.PUBLIC_SITE_NAME ?? "Ekcron",
  url: env.PUBLIC_SITE_URL ?? "https://ekcron.com",
  tagline: env.PUBLIC_SITE_TAGLINE ?? "A workbench for language model experiments",
  description:
    env.PUBLIC_SITE_DESCRIPTION ??
    "Fine-tune, distill, and evaluate open language models end to end. Build small domain-specific models with LoRA, DPO, and GRPO, then deploy or self-host them.",
} as const;

/** Where the product app is hosted. Sign-in / sign-up links point here. */
export const APP_URL = env.PUBLIC_APP_URL ?? "https://app.ekcron.com";

export const CONTACT = {
  general: env.PUBLIC_CONTACT_EMAIL ?? "hello@ekcron.com",
  /** Account, privacy, and security matters — cited by the legal pages. */
  admin: env.PUBLIC_ADMIN_EMAIL ?? "admin@ekcron.com",
  developer: env.PUBLIC_DEVELOPER_URL ?? "https://github.com/HumbleBee14",
  repo: env.PUBLIC_REPO_URL ?? "https://github.com/HumbleBee14/ekcron",
} as const;

export const SOCIALS = {
  x: env.PUBLIC_X_URL ?? "https://x.com/ekcron",
  linkedin:
    env.PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/company/ekcron/",
} as const;

/** Effective date shown on the legal pages. */
export const LEGAL_UPDATED = "July 2026";

export const FOOTER_TAGLINE = "Your data, your model, your hardware.";

/** Posts per page on /blog. Pagination only appears once this is exceeded. */
export const BLOG_PAGE_SIZE = 15;

/** Recent posts surfaced on the home page. */
export const HOME_POST_COUNT = 3;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export const NAV: { href: string; label: string }[] = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export const FOOTER_NAV: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#capabilities", label: "Capabilities" },
      { href: "/#experiments", label: "Experiments" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/help", label: "Help" },
      { href: "/rss.xml", label: "RSS" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: CONTACT.repo, label: "Contribute" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Home page content                                                          */
/* -------------------------------------------------------------------------- */

export const HERO = {
  eyebrow: "Language model workbench",
  headingLead: "Experiment with language models,",
  headingAccent: "end to end.",
  body:
    "Fine-tune or distill an open model on your data, prove it beat the base, then serve it or take the weights home.",
  primaryCta: "Get started",
  secondaryCta: "How it works",
} as const;

/** Mono facts under the brand banner. Each one is true of the running system. */

export const PIPELINE: { step: string; title: string; body: string; icon: string }[] = [
  {
    step: "01",
    title: "Upload",
    body: "Documents, a chat-format dataset, or traffic captured from a model already in use.",
    icon: "upload",
  },
  {
    step: "02",
    title: "Parse",
    body: "Text extracted and chunked. A golden holdout is set aside that nothing ever trains on.",
    icon: "parse",
  },
  {
    step: "03",
    title: "Generate",
    body: "Draft a sample, rate it, refine the guidance, then write the full training set.",
    icon: "generate",
  },
  {
    step: "04",
    title: "Train",
    body: "LoRA or QLoRA on an open model. A quick run, or iterative, aligned, and reasoning runs.",
    icon: "train",
  },
  {
    step: "05",
    title: "Evaluate",
    body: "Tuned and base scored on the same held-out data. A deploy can wait for the result.",
    icon: "evaluate",
  },
  {
    step: "06",
    title: "Deploy",
    body: "An OpenAI-compatible endpoint, or adapters and GGUF builds for your own hardware.",
    icon: "deploy",
  },
];

export const CAPABILITIES: { label: string; title: string; body: string; icon: string }[] = [
  {
    label: "Runs",
    title: "Managed training runs",
    body: "GPU scheduling, checkpoints, retries, and live metrics, so a long run surviving a restart isn't your problem.",
    icon: "runs",
  },
  {
    label: "Data",
    title: "Data curation in the loop",
    body: "Generate examples, then keep, edit, or reject them. Training data stays something you reviewed, not something you hope is fine.",
    icon: "data",
  },
  {
    label: "Evaluation",
    title: "Evaluation and comparison",
    body: "Held-out splits, judge-based scoring, and side-by-side comparison against the base model before anything ships.",
    icon: "compare",
  },
  {
    label: "Inference",
    title: "OpenAI-compatible inference",
    body: "Point an existing client at a new base URL. Your tuned model answers the same request shape you already send.",
    icon: "inference",
  },
  {
    label: "Export",
    title: "Export and self-host",
    body: "Download adapters or GGUF builds and run them on your own hardware, a laptop, or an edge device. No lock-in.",
    icon: "export",
  },
  {
    label: "Lineage",
    title: "Reproducible by default",
    body: "Every run keeps its dataset version, configuration, and metrics, so a result you liked can be found and repeated.",
    icon: "lineage",
  },
];

export interface ShowcaseItem {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  scene: "distill" | "train" | "evaluate";
  label: string;
  status: string;
  legend: { tone: "source" | "target"; label: string }[];
}

export const SHOWCASES: ShowcaseItem[] = [
  {
    id: "distillation",
    eyebrow: "Distillation",
    title: "A small model can inherit behaviour from a large one.",
    body: [
      "Capture how a larger model handles your task, then train a small open model on that behaviour instead of writing every example by hand.",
      "Teacher and student are then scored on the same held-out tasks, so how much of the quality carried over is a number, not a feeling.",
    ],
    scene: "distill",
    label: "Transfer map",
    status: "Transferring",
    legend: [
      { tone: "source", label: "Large model" },
      { tone: "target", label: "Small model" },
    ],
  },
  {
    id: "training",
    eyebrow: "Training",
    title: "See training as it happens.",
    body: [
      "Runs are scheduled on GPUs, checkpointed as they go, and stream step, loss, learning rate, and throughput while they are still running.",
      "A run that stalls or a loss that stops falling is visible in minutes, not after the bill.",
    ],
    scene: "train",
    label: "Run monitor",
    status: "Streaming",
    legend: [
      { tone: "source", label: "Training loss" },
      { tone: "target", label: "Held-out loss" },
    ],
  },
  {
    id: "evaluation",
    eyebrow: "Evaluation",
    title: "The comparison that matters is against the model you started with.",
    body: [
      "Every tuned model is scored on a split held back before training began, side by side with the base model on that same split.",
      "The unflattering result is visible too. A run that changed nothing, or made things worse, looks exactly like what it is.",
    ],
    scene: "evaluate",
    label: "Held-out scores",
    status: "Scoring",
    legend: [
      { tone: "source", label: "Base model" },
      { tone: "target", label: "Tuned model" },
    ],
  },
];

export const EXPERIMENTS: { label: string; title: string; body: string }[] = [
  {
    label: "Specialize",
    title: "Teach a small model one job well",
    body: "Take an open model in the 1B–8B range and tune it on a single narrow task until it's dependable at that task specifically.",
  },
  {
    label: "Distill",
    title: "Move behaviour from large to small",
    body: "Capture how a larger model handles your task, train a smaller one on that behaviour, and measure how much of the quality survived.",
  },
  {
    label: "Align",
    title: "Tune on preferences and rewards",
    body: "Go past supervised tuning with preference and reinforcement methods, for the cases that are hard to write down as plain examples.",
  },
  {
    label: "Constrain",
    title: "Make output shape reliable",
    body: "Tune for structured output and tool calls, then verify the format holds across a held-out set instead of trusting a few spot checks.",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is Ekcron?",
    a: "A workbench for language model experiments. It covers the path from raw data to a tuned model you can call or download: dataset preparation, fine-tuning and distillation, evaluation, and deployment or export.",
  },
  {
    q: "Do I need machine learning experience?",
    a: "You need to know your task and your data. The pipeline ships with defaults that produce a reasonable run, and the knobs are there once you want to change them.",
  },
  {
    q: "Which models can I work with?",
    a: "Open-weight models, tuned with QLoRA or LoRA by default, with full fine-tuning available when adapters aren't enough. Small and mid-size models are the focus, because they are the ones you can afford to iterate on and realistically self-host.",
  },
  {
    q: "How do I know a run actually improved something?",
    a: "A split is held back before training and never trained on. The tuned model and the base model are then scored against it and compared, so a run that didn't help shows up as a run that didn't help.",
  },
  {
    q: "Can I run the model myself?",
    a: "Yes. Adapters and GGUF builds can be exported and run on your own infrastructure, a laptop, or an edge device. Serving it here is a convenience, not a requirement.",
  },
  {
    q: "What happens to my data?",
    a: "Your data and the models you train from it are yours, isolated to your workspace, and are not used to train anything of ours or shared with other users. The privacy page has the detail.",
  },
  {
    q: "Is it open source?",
    a: "Yes. The full source — the training pipeline, data generation, evaluation harness, and this site — is public on GitHub, so you can read exactly how your data is handled. Issues and pull requests are welcome.",
  },
  {
    q: "Is this a product I can buy?",
    a: "Not currently. Ekcron is an experimental engineering project, not a commercial service, and it isn't operated by any registered business entity. There is nothing to pay for, and it comes with no warranties or availability guarantees. Treat it as an experimental environment rather than production infrastructure.",
  },
  {
    q: "What does it cost?",
    a: "Nothing today. Compute is finite, so runs may be queued or capped to keep the environment usable, but there is no billing while the project is experimental.",
  },
  {
    q: "How do I start?",
    a: "Create an account, bring a small dataset, and run one short job end to end. Starting small is the fastest way to see whether the pipeline suits your task.",
  },
];
