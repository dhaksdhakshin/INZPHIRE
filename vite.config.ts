import { IncomingMessage, ServerResponse } from "node:http";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Connect, type Plugin } from "vite";

interface AiBuilderMessage {
  role: "assistant" | "user";
  content: string;
}

interface AiBuilderRequestBody {
  starterType?: string | null;
  prompt?: string;
  history?: AiBuilderMessage[];
}

interface AiBuilderPreview {
  title: string;
  summary: string;
  audience: string;
  themeSuggestion: string;
  slides: Array<{
    title: string;
    objective: string;
    interaction: string;
  }>;
}

interface AiBuilderApiResponse {
  assistantMessage: string;
  preview: AiBuilderPreview | null;
}

function createFallbackPreview(body: AiBuilderRequestBody): AiBuilderPreview {
  const prompt = body.prompt?.trim() || "Interactive presentation";
  const starterType = body.starterType?.trim() || "interactive presentation";

  return {
    title: prompt.length > 54 ? `${prompt.slice(0, 51)}...` : prompt,
    summary: `A concise ${starterType} outline generated from your prompt.`,
    audience: "General audience",
    themeSuggestion: "Dark stage slides with high-contrast titles",
    slides: [
      {
        title: "Welcome",
        objective: "Introduce the topic and set context for the audience.",
        interaction: "Title slide",
      },
      {
        title: "Warm-up",
        objective: "Surface what the audience already thinks or knows.",
        interaction: "Poll",
      },
      {
        title: "Discussion prompt",
        objective: "Invite ideas, questions, or reactions from the audience.",
        interaction: "Open ended",
      },
      {
        title: "Scenario practice",
        objective: "Guide the audience through a realistic decision or reflection.",
        interaction: "Quiz",
      },
      {
        title: "Wrap-up",
        objective: "Summarize key takeaways and next steps.",
        interaction: "Q&A",
      },
    ],
  };
}

function createFallbackResponse(body: AiBuilderRequestBody): AiBuilderApiResponse {
  const history = body.history ?? [];
  const latestUserMessage = [...history].reverse().find((entry) => entry.role === "user")?.content?.trim();

  if (!latestUserMessage || latestUserMessage.length < 18) {
    return {
      assistantMessage:
        "Thanks. I can build that for you. Before I draft the slides, tell me a bit more about the audience and the outcome you want from this presentation.",
      preview: null,
    };
  }

  return {
    assistantMessage:
      "Great, I have enough to prepare a first draft. I created an initial presentation structure for your review.",
    preview: createFallbackPreview(body),
  };
}

async function readJsonBody(req: IncomingMessage): Promise<AiBuilderRequestBody> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as AiBuilderRequestBody;
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1];
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

function normalizePreview(raw: unknown): AiBuilderPreview | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const preview = raw as Record<string, unknown>;
  const slides = Array.isArray(preview.slides)
    ? preview.slides
      .map((slide) => {
        if (!slide || typeof slide !== "object") {
          return null;
        }

        const entry = slide as Record<string, unknown>;
        const title = typeof entry.title === "string" ? entry.title.trim() : "";
        const objective = typeof entry.objective === "string" ? entry.objective.trim() : "";
        const interaction = typeof entry.interaction === "string" ? entry.interaction.trim() : "";

        if (!title || !objective || !interaction) {
          return null;
        }

        return { title, objective, interaction };
      })
      .filter(Boolean)
    : [];

  const title = typeof preview.title === "string" ? preview.title.trim() : "";
  const summary = typeof preview.summary === "string" ? preview.summary.trim() : "";
  const audience = typeof preview.audience === "string" ? preview.audience.trim() : "";
  const themeSuggestion =
    typeof preview.themeSuggestion === "string" ? preview.themeSuggestion.trim() : "";

  if (!title || !summary || !audience || !themeSuggestion || slides.length < 3) {
    return null;
  }

  return {
    title,
    summary,
    audience,
    themeSuggestion,
    slides: slides.slice(0, 7) as AiBuilderPreview["slides"],
  };
}

function normalizeAiBuilderResponse(raw: unknown, body: AiBuilderRequestBody): AiBuilderApiResponse {
  if (!raw || typeof raw !== "object") {
    return createFallbackResponse(body);
  }

  const response = raw as Record<string, unknown>;
  const assistantMessage =
    typeof response.assistantMessage === "string" && response.assistantMessage.trim()
      ? response.assistantMessage.trim()
      : createFallbackResponse(body).assistantMessage;
  const preview = normalizePreview(response.preview);

  return {
    assistantMessage,
    preview,
  };
}

function historyToTranscript(history: AiBuilderMessage[]) {
  return history
    .map((entry) => `${entry.role === "assistant" ? "Assistant" : "User"}: ${entry.content}`)
    .join("\n");
}

async function createAiBuilderResponse(
  apiKey: string,
  body: AiBuilderRequestBody,
): Promise<AiBuilderApiResponse> {
  const prompt = body.prompt?.trim();
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const starterType = body.starterType?.trim() || "interactive presentation";
  const history = body.history ?? [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let response: Response;

  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "INZPHIRE Clone",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        response_format: { type: "json_object" },
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content:
              "You are the conversational AI builder for an INZPHIRE-style presentation tool. " +
              "Return valid JSON only with keys assistantMessage and preview. " +
              "assistantMessage must sound like a polished product assistant, concise and helpful, with no markdown. " +
              "If the user has not given enough detail to draft a solid deck, ask exactly one focused follow-up question and set preview to null. " +
              "If the user has given enough detail, acknowledge that and return a preview object. " +
              "preview must contain title, summary, audience, themeSuggestion, and slides. " +
              "slides must be an array of 5 to 7 objects, each with title, objective, and interaction. " +
              "For preview slides, make them feel like real INZPHIRE content with interactive slide types such as Title slide, Poll, Word cloud, Scales, Quiz, Open ended, Ranking, or Q&A.",
          },
          {
            role: "user",
            content:
              `Starter type: ${starterType}\n` +
              `Latest prompt: ${prompt}\n` +
              `Conversation so far:\n${historyToTranscript(history)}`,
          },
        ],
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("OpenRouter request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(payload?.error?.message || "OpenRouter request failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenRouter returned an empty response");
  }

  try {
    return normalizeAiBuilderResponse(JSON.parse(extractJson(text)), body);
  } catch {
    return createFallbackResponse(body);
  }
}

function createAiBuilderApiPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.OPENROUTER_API_KEY;

  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== "POST" || req.url !== "/api/ai-builder") {
      next();
      return;
    }

    try {
      const body = await readJsonBody(req);

      if (!body.prompt?.trim()) {
        sendJson(res, 400, { error: "Prompt is required." });
        return;
      }

      if (!apiKey) {
        sendJson(res, 503, {
          error: "Missing OPENROUTER_API_KEY in the local environment.",
          ...createFallbackResponse(body),
        });
        return;
      }

      try {
        const aiResponse = await createAiBuilderResponse(apiKey, body);
        sendJson(res, 200, aiResponse);
      } catch (error) {
        console.warn("AI builder upstream fallback:", error);
        sendJson(res, 200, createFallbackResponse(body));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected AI builder error";
      sendJson(res, 500, { error: message });
    }
  };

  return {
    name: "ai-builder-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), createAiBuilderApiPlugin(process.env.NODE_ENV ?? "development")],
});
