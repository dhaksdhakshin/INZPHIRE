import { NextResponse } from "next/server";

import type { AiBuilderMessage, AiBuilderPreview, AiBuilderResponse } from "../../../core/types";

interface AiBuilderRequest {
  starterType?: string | null;
  prompt?: string;
  history?: AiBuilderMessage[];
}

const starterTitles: Record<string, string> = {
  quiz: "Live quiz",
  questions: "Audience questions",
  survey: "Shareable survey",
  unsure: "Interactive session",
};

const starterThemes: Record<string, string> = {
  quiz: "Bold contrast with electric blues and high-energy accents",
  questions: "Calm neutrals with clear typography and generous spacing",
  survey: "Soft gradients with friendly, approachable accents",
  unsure: "Balanced modern palette focused on readability",
};

const audienceHints: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /students?|learners?|class/i, label: "students" },
  { pattern: /team|employees?|staff|colleagues/i, label: "your team" },
  { pattern: /customers?|clients?/i, label: "customers" },
  { pattern: /managers?|leaders?|execs?/i, label: "leaders" },
  { pattern: /sales|account reps?/i, label: "sales team" },
  { pattern: /engineers?|developers?|devs?/i, label: "engineers" },
  { pattern: /teachers?|educators?/i, label: "educators" },
];

const fillerPatterns = [
  /\bcreate\b/i,
  /\bbuild\b/i,
  /\bmake\b/i,
  /\bdesign\b/i,
  /\bneed\b/i,
  /\bwant\b/i,
  /\bplease\b/i,
  /\bfor\b/i,
  /\babout\b/i,
  /\bon\b/i,
  /\bregarding\b/i,
  /\baround\b/i,
  /\bidea\b/i,
];

function normalizePrompt(prompt?: string): string {
  if (!prompt) {
    return "";
  }

  return prompt.replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractAudience(prompt: string) {
  for (const hint of audienceHints) {
    if (hint.pattern.test(prompt)) {
      return hint.label;
    }
  }

  const forMatch = prompt.match(/for\s+([^.,!?]+)/i);
  if (forMatch) {
    return forMatch[1].trim();
  }

  return "your audience";
}

function extractTopic(prompt: string) {
  if (!prompt) {
    return "";
  }

  const aboutMatch = prompt.match(/(?:about|on|around|regarding)\s+([^.,!?]+)/i);
  if (aboutMatch) {
    return aboutMatch[1].trim();
  }

  const cleaned = fillerPatterns.reduce((acc, pattern) => acc.replace(pattern, ""), prompt)
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0) {
    return "";
  }

  return cleaned;
}

function extractGoal(prompt: string, topic: string) {
  const goalMatch = prompt.match(/(?:to|so that we can|so we can|so I can)\s+([^.,!?]+)/i);
  if (goalMatch) {
    return goalMatch[1].trim();
  }

  return topic ? `explore ${topic}` : "engage the audience";
}

function inferTitle(prompt: string, starter: string): string {
  const topic = extractTopic(prompt);
  if (topic) {
    const base = titleCase(topic.slice(0, 60));
    if (starter === "quiz" && !/quiz/i.test(base)) {
      return `${base} Quiz`;
    }
    if (starter === "survey" && !/survey/i.test(base)) {
      return `${base} Survey`;
    }
    if (starter === "questions" && !/questions|q&a/i.test(base)) {
      return `${base} Q&A`;
    }
    return base;
  }

  return starterTitles[starter] ?? "Interactive presentation";
}

function buildSlides(
  starter: string,
  topic: string,
  audience: string,
  goal: string,
): AiBuilderPreview["slides"] {
  const baseTopic = topic || starterTitles[starter] || "your topic";
  const titledTopic = titleCase(baseTopic);

  switch (starter) {
    case "quiz":
      return [
        {
          title: `Kickoff: ${titledTopic}`,
          objective: `Set context and outcomes for ${audience}.`,
          interaction: "Intro",
        },
        {
          title: "Warm-up check",
          objective: `Gauge baseline knowledge related to ${titledTopic}.`,
          interaction: "Multiple choice",
        },
        {
          title: "Speed round",
          objective: `Challenge ${audience} with fast-paced prompts.`,
          interaction: "Quiz competition",
        },
        {
          title: "Deep dive",
          objective: `Explore why answers matter and reinforce key points.`,
          interaction: "Open ended",
        },
        {
          title: "Leaderboard moment",
          objective: "Highlight top performers and celebrate engagement.",
          interaction: "Quiz leaderboard",
        },
        {
          title: "Wrap-up",
          objective: `Summarize what ${audience} learned and connect to next steps.`,
          interaction: "Closing",
        },
      ];
    case "survey":
      return [
        {
          title: `Survey kickoff: ${titledTopic}`,
          objective: "Explain the purpose, timing, and how responses will be used.",
          interaction: "Intro",
        },
        {
          title: "Pulse check",
          objective: `Capture sentiment on ${goal}.`,
          interaction: "Scales",
        },
        {
          title: "Open feedback",
          objective: "Collect qualitative responses and comments.",
          interaction: "Open ended",
        },
        {
          title: "Priorities",
          objective: `See what ${audience} values most.`,
          interaction: "Ranking",
        },
        {
          title: "Close & thank you",
          objective: "Confirm next steps and appreciation.",
          interaction: "Closing",
        },
      ];
    case "questions":
      return [
        {
          title: `Set the stage: ${titledTopic}`,
          objective: `Align on goals and invite ${audience} to participate.`,
          interaction: "Intro",
        },
        {
          title: "Quick pulse",
          objective: "Gather first impressions in a fast prompt.",
          interaction: "Text bomb",
        },
        {
          title: "Discussion questions",
          objective: `Collect questions and concerns about ${titledTopic}.`,
          interaction: "Q&A",
        },
        {
          title: "Key reflections",
          objective: "Capture takeaways and themes.",
          interaction: "Open ended",
        },
        {
          title: "Next steps",
          objective: `Decide what happens after ${titledTopic}.`,
          interaction: "Closing",
        },
      ];
    default:
      return [
        {
          title: `Kickoff: ${titledTopic}`,
          objective: `Set expectations and define success for ${audience}.`,
          interaction: "Intro",
        },
        {
          title: "Engage the room",
          objective: `Collect quick reactions related to ${titledTopic}.`,
          interaction: "Text bomb",
        },
        {
          title: "Explore perspectives",
          objective: `Invite ${audience} to share experiences around ${goal}.`,
          interaction: "Open ended",
        },
        {
          title: "Prioritize next moves",
          objective: "Rank the most important actions or ideas.",
          interaction: "Ranking",
        },
        {
          title: "Wrap-up",
          objective: "Summarize conclusions and confirm follow-through.",
          interaction: "Closing",
        },
      ];
  }
}

function buildAssistantMessage(
  prompt: string,
  starter: string,
  history: AiBuilderMessage[],
  topic: string,
  audience: string,
): string {
  const lastUserMessage = [...history].reverse().find((entry) => entry.role === "user")?.content;
  const opening = starter === "unsure"
    ? "Thanks for the context."
    : "Great, I can work with that.";
  const focus = lastUserMessage ? `You mentioned: "${lastUserMessage}".` : "";
  const topicLine = topic ? `I framed the flow around ${topic}.` : "";
  const audienceLine = audience ? `It should feel clear and engaging for ${audience}.` : "";
  const followUp =
    starter === "quiz"
      ? "Do you want the questions to be beginner-friendly or more advanced?"
      : starter === "survey"
        ? "Should the tone be formal or more casual?"
        : "Is there anything you want to emphasize in the flow?";

  return [opening, focus, topicLine, audienceLine, "I drafted a short outline and preview for you below.", followUp]
    .filter(Boolean)
    .join(" ");
}

function buildSummary(
  prompt: string,
  starter: string,
  audience: string,
  goal: string,
  interactions: string[],
) {
  const focusLine = prompt ? `Focused on ${prompt}.` : `Focused on helping ${audience} ${goal}.`;
  const uniqueInteractions = Array.from(new Set(interactions)).slice(0, 4);
  const interactionLine = uniqueInteractions.length
    ? `Includes ${uniqueInteractions.join(", ")}.`
    : "Includes a balanced mix of interactive moments.";
  const starterLine =
    starter === "quiz"
      ? "Built for fast engagement and competition."
      : starter === "survey"
        ? "Designed to capture both sentiment and detail."
        : starter === "questions"
          ? "Designed to surface questions and reflections."
          : "Designed for an interactive, participatory flow.";

  return `${focusLine} ${starterLine} ${interactionLine}`.trim();
}

export async function POST(request: Request) {
  let payload: AiBuilderRequest | null = null;

  try {
    payload = (await request.json()) as AiBuilderRequest;
  } catch {
    payload = null;
  }

  const starterType = typeof payload?.starterType === "string" ? payload?.starterType : "unsure";
  const prompt = normalizePrompt(payload?.prompt);
  const history = Array.isArray(payload?.history) ? payload?.history : [];

  const topic = extractTopic(prompt);
  const audience = extractAudience(prompt);
  const goal = extractGoal(prompt, topic);
  const title = inferTitle(prompt, starterType);
  const slides = buildSlides(starterType, title, audience, goal);
  const preview: AiBuilderPreview = {
    title,
    summary: buildSummary(
      prompt,
      starterType,
      audience,
      goal,
      slides.map((slide) => slide.interaction),
    ),
    audience: "General audience",
    themeSuggestion: starterThemes[starterType] ?? starterThemes.unsure,
    slides,
  };

  const response: AiBuilderResponse = {
    assistantMessage: buildAssistantMessage(prompt, starterType, history, topic, audience),
    preview,
  };

  return NextResponse.json(response, { status: 200 });
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
