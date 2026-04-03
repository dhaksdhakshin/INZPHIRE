import type { AiBuilderMessage, AiBuilderResponse } from "./types";

interface GenerateAiBuilderPayload {
  starterType: string | null;
  prompt: string;
  history: AiBuilderMessage[];
}

export async function generateAiBuilderResponse(
  payload: GenerateAiBuilderPayload,
): Promise<AiBuilderResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 25000);

  const response = await fetch("/api/ai-builder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The AI request took too long. Please try again.");
    }

    throw error;
  });

  window.clearTimeout(timeoutId);

  const data = (await response.json().catch(() => null)) as
    | AiBuilderResponse
    | { error?: string }
    | null;

  if (!data || !("assistantMessage" in data)) {
    throw new Error(data && "error" in data && data.error ? data.error : "AI builder request failed");
  }

  return {
    assistantMessage: data.assistantMessage,
    preview: data.preview ?? null,
  };
}
