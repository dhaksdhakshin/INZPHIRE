import type {
  FeatureTemplate,
  FeatureTemplateCategory,
  LearningResource,
  NavItem,
  PlaceholderPageCopy,
  TemplateCard,
  UserProfile,
} from "./types";

export const userProfile: UserProfile = {
  name: "DHAKS五条 !!",
  email: "dhaksdhakshin46891@gmail.com",
  initials: "D",
  teamName: "DHAKS五条's team",
  participantUsage: 4,
  participantLimit: 50,
};

export const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/app/home",
    icon: "home",
    group: "primary",
    isDesigned: true,
  },
  {
    id: "my-presentations",
    label: "My presentations",
    href: "/app/my-presentations",
    icon: "presentation",
    group: "primary",
    isDesigned: true,
  },
  {
    id: "shared-with-me",
    label: "Shared with me",
    href: "/app/shared-with-me",
    icon: "users",
    group: "primary",
    isDesigned: true,
  },
  {
    id: "workspace-presentations",
    label: "Workspace presentations",
    href: "/app/workspace-presentations",
    icon: "layout",
    group: "team",
  },
  {
    id: "shared-templates",
    label: "Shared templates",
    href: "/app/shared-templates",
    icon: "copy",
    group: "team",
  },
  {
    id: "templates",
    label: "Templates",
    href: "/app/templates",
    icon: "grid",
    group: "secondary",
  },
  {
    id: "integrations",
    label: "Integrations",
    href: "/app/integrations",
    icon: "plug",
    group: "secondary",
  },
  {
    id: "academy",
    label: "INZPHIRE Academy",
    href: "/app/academy",
    icon: "graduation",
    group: "secondary",
  },
  {
    id: "help",
    label: "Help",
    href: "/app/help",
    icon: "help",
    group: "secondary",
  },
  {
    id: "trash",
    label: "Trash",
    href: "/app/trash",
    icon: "trash",
    group: "secondary",
  },
];

export const featureTemplates: FeatureTemplate[] = [
  {
    id: "word-cloud",
    title: "Text bomb",
    color: "#F9726D",
    shape: "word-cloud",
    icon: "sparkles",
    deckTitle: "Text bomb brainstorm",
    description: "Collect fast responses and surface the strongest themes.",
    slides: 5,
  },
  {
    id: "poll",
    title: "Poll",
    color: "#5A6BE6",
    shape: "poll",
    icon: "presentation",
    deckTitle: "Audience poll deck",
    description: "Run a quick multiple-choice vote with instant summaries.",
    slides: 6,
  },
  {
    id: "open-ended",
    title: "Open Ended",
    color: "#F19A9A",
    shape: "open-ended",
    icon: "menu",
    deckTitle: "Open ended workshop",
    description: "Capture richer text feedback for retros, Q&A, and workshops.",
    slides: 7,
  },
  {
    id: "scales",
    title: "Scales",
    color: "#8784DA",
    shape: "scales",
    icon: "layout",
    deckTitle: "Pulse check scales",
    description: "Measure sentiment on a scale and compare results over time.",
    slides: 4,
  },
  {
    id: "ranking",
    title: "Ranking",
    color: "#58AF6C",
    shape: "ranking",
    icon: "grid",
    deckTitle: "Priority ranking session",
    description: "Let participants rank the most important ideas in sequence.",
    slides: 5,
  },
  {
    id: "pin-on-image",
    title: "Pin on Image",
    color: "#6156BB",
    shape: "pin-on-image",
    icon: "plus",
    deckTitle: "Pin on image activity",
    description: "Turn diagrams and images into collaborative input surfaces.",
    slides: 6,
  },
];

export const featureTemplateLibrary: Record<string, FeatureTemplateCategory> = {
  "word-cloud": {
    id: "word-cloud",
    title: "Text bombs",
    description:
      "Collect responses and highlight the most common ones in a beautiful text bomb! A very popular way to start or end a session.",
    templates: [
      {
        id: "blank-word-cloud",
        title: "Blank text bomb",
        prompt: "",
        background: "#ffffff",
        borderColor: "#0f0f0f",
        isBlank: true,
      },
      {
        id: "leadership-traits",
        title: "Leadership traits text bomb",
        prompt: "What's the most important trait for a great leader?",
        background: "#f2ece2",
        textColor: "#2b2a2a",
      },
      {
        id: "personal-reflection",
        title: "Personal reflection prompt",
        prompt: "In one word, what type of person do you aspire to be?",
        background: "#1b1f2a",
        textColor: "#f5f6f7",
      },
      {
        id: "weekly-opener",
        title: "Weekly team opener",
        prompt: "What are you looking forward to in the coming week?",
        background: "#e5e9ff",
        textColor: "#22263d",
      },
    ],
  },
  poll: {
    id: "poll",
    title: "Polls",
    description: "Ask a quick multiple-choice poll and show the results instantly.",
    templates: [
      {
        id: "blank-poll",
        title: "Blank poll",
        prompt: "",
        background: "#ffffff",
        borderColor: "#0f0f0f",
        isBlank: true,
      },
    ],
  },
  "open-ended": {
    id: "open-ended",
    title: "Open ended",
    description: "Collect longer, qualitative responses from your audience.",
    templates: [
      {
        id: "blank-open-ended",
        title: "Blank open ended",
        prompt: "",
        background: "#ffffff",
        borderColor: "#0f0f0f",
        isBlank: true,
      },
    ],
  },
  scales: {
    id: "scales",
    title: "Scales",
    description: "Gauge sentiment on a scale and compare results over time.",
    templates: [
      {
        id: "blank-scales",
        title: "Blank scales",
        prompt: "",
        background: "#ffffff",
        borderColor: "#0f0f0f",
        isBlank: true,
      },
    ],
  },
  ranking: {
    id: "ranking",
    title: "Ranking",
    description: "Let participants rank the most important ideas in sequence.",
    templates: [
      {
        id: "blank-ranking",
        title: "Blank ranking",
        prompt: "",
        background: "#ffffff",
        borderColor: "#0f0f0f",
        isBlank: true,
      },
    ],
  },
  "pin-on-image": {
    id: "pin-on-image",
    title: "Pin on image",
    description: "Turn diagrams and images into collaborative input surfaces.",
    templates: [
      {
        id: "blank-pin",
        title: "Blank pin on image",
        prompt: "",
        background: "#ffffff",
        borderColor: "#0f0f0f",
        isBlank: true,
      },
    ],
  },
};

export const learningResources: LearningResource[] = [
  {
    id: "what-is-a-menti",
    title: "What is INZPHIRE?",
    meta: "1 min read",
    icon: "menu",
    description: "Overview of what an interactive INZPHIRE can do inside meetings.",
  },
  {
    id: "creating-your-first-menti",
    title: "Creating your first INZPHIRE",
    meta: "4 min watch",
    icon: "play",
    description: "Guided walkthrough for building the first deck from scratch.",
  },
  {
    id: "how-to-present",
    title: "How to present",
    meta: "1 min read",
    icon: "menu",
    description: "Present live, moderate answers, and keep the session moving.",
  },
  {
    id: "how-participants-join",
    title: "How participants join",
    meta: "2 min read",
    icon: "menu",
    description: "Share the code, QR, or link and manage audience participation.",
  },
];

export const templateCards: TemplateCard[] = [
  {
    id: "team-icebreakers",
    title: "Get to know the team icebreakers",
    slides: 7,
    accent: "#FEF2F2",
    prompt: "What makes working with this team fun?",
    description: "Warm up a new group with fast prompts and playful exercises.",
  },
  {
    id: "stress-management",
    title: "Stress management training",
    slides: 8,
    accent: "#EFF6FF",
    prompt: "What is one thing you want to improve this week?",
    description: "Facilitate training sessions with quick personal reflection.",
  },
  {
    id: "initiative-prioritisation",
    title: "Initiative prioritisation",
    slides: 6,
    accent: "#F0FDFA",
    prompt: "Which initiative will have the highest impact this quarter?",
    description: "Stack-rank ideas and align teams around the next best move.",
  },
  {
    id: "meeting-icebreakers",
    title: "Fun meeting icebreakers",
    slides: 5,
    accent: "#F9FAFB",
    prompt: "Share one thing everyone here should know about you.",
    description: "Start recurring meetings with a fast, low-friction opener.",
  },
];

export const placeholderPages: Record<string, PlaceholderPageCopy> = {
  "workspace-presentations": {
    title: "Workspace presentations",
    description:
      "Shared decks for your workspace will live here once collaboration flows are added.",
  },
  "shared-templates": {
    title: "Shared templates",
    description:
      "Reusable team templates and curated workshop starters will appear on this page.",
  },
  templates: {
    title: "Templates",
    description:
      "Browse the full template library and start from a proven structure.",
  },
  integrations: {
    title: "Integrations",
    description:
      "Connect with meetings, spreadsheets, and import/export workflows from here.",
  },
  academy: {
    title: "INZPHIRE Academy",
    description:
      "Training content, walkthroughs, and onboarding materials for presenters.",
  },
  help: {
    title: "Help",
    description:
      "Central support surface for documentation, status, and common product answers.",
  },
  trash: {
    title: "Trash",
    description:
      "Deleted presentations and folders can be restored from this area when needed.",
  },
};
