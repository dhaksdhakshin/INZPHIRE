import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Eye, FileUp, Paintbrush, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { generateAiBuilderResponse } from "../ai-builder";
import { useDashboard } from "../dashboard-context";
import type { AiBuilderMessage, AiBuilderPreview } from "../types";
import DiscoverySections from "../../components/dashboard/DiscoverySections";
import LogoMark from "../../components/dashboard/LogoMark";
import PageSearch from "../../components/dashboard/PageSearch";

const starterOptions = [
  { id: "quiz", label: "Live quiz", color: "#58b467" },
  { id: "questions", label: "Questions for your audience", color: "#5c6df0" },
  { id: "survey", label: "Shareable survey", color: "#f2bd45" },
  { id: "unsure", label: "I'm not sure...", color: "#d8d8d3" },
] as const;

type StarterId = (typeof starterOptions)[number]["id"];

const starterCopyMap = {
  quiz: {
    intro:
      "Great! What kind of live quiz would you like to create? Get started by typing an idea or choosing a popular option.",
    suggestions: [
      "Icebreaker quiz",
      "Knowledge check",
      "Trivia challenge",
      "Team competition",
    ],
  },
  questions: {
    intro:
      "Great! What kind of questions would you like to ask your audience? Get started by typing an idea or choosing a popular option.",
    suggestions: [
      "Icebreaker questions",
      "Closing reflection",
      "Formative assessment",
      "Scenario-based skills training",
    ],
  },
  survey: {
    intro:
      "Great! What kind of survey would you like to share? Start by typing your goal or choosing a popular option.",
    suggestions: [
      "Customer feedback survey",
      "Event feedback",
      "Pulse check",
      "Team satisfaction survey",
    ],
  },
  unsure: {
    intro:
      "No problem. Tell us what you want to achieve and we will help shape the right interactive presentation for it.",
    suggestions: [
      "Workshop opener",
      "Audience engagement session",
      "Training presentation",
      "Idea collection",
    ],
  },
} as const;

function PreviewIllustration() {
  return (
    <svg
      className="ai-builder__preview-illustration"
      viewBox="0 0 210 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M40 147.5H167.5" stroke="#121212" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M56 39.5H151C153.761 39.5 156 41.7386 156 44.5V113.5H51V44.5C51 41.7386 53.2386 39.5 56 39.5Z"
        stroke="#121212"
        strokeWidth="2.6"
      />
      <path d="M75 86H113" stroke="#121212" strokeWidth="4" strokeLinecap="round" />
      <path d="M91 97H109" stroke="#121212" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 113.5H147V145.5H60V113.5Z" stroke="#121212" strokeWidth="2.6" />
      <path d="M98 131.5H109V145.5H98V131.5Z" stroke="#121212" strokeWidth="2.6" />
    </svg>
  );
}

function formatAssistantParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function StartWithAiPage() {
  const navigate = useNavigate();
  const { user, pushToast, createAiPresentationFromPreview } = useDashboard();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStarter, setSelectedStarter] = useState<StarterId | null>(null);
  const [messages, setMessages] = useState<AiBuilderMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [preview, setPreview] = useState<AiBuilderPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const starterPromptMap: Record<StarterId, string> = {
    quiz: "Create a live quiz presentation with engaging questions and a clear opening, challenge section, and closing slide.",
    questions:
      "Create a presentation designed to collect questions, feedback, and audience input during a session.",
    survey:
      "Create a shareable survey presentation with a clean intro, a few survey prompts, and a closing thank-you slide.",
    unsure:
      "Create an interactive presentation idea with a balanced structure that works for a general audience.",
  };

  useEffect(() => {
    if (!threadRef.current) {
      return;
    }

    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, suggestions, isGenerating]);

  const isConversationActive = selectedStarter !== null || messages.length > 0;
  const canSend = message.trim().length > 0 && !isGenerating;
  const canContinue = Boolean(preview) && !isGenerating;
  const previewStatus = useMemo(() => {
    if (isGenerating) {
      return "Generating preview";
    }

    if (preview) {
      return `Previewing ${preview.slides.length} slides`;
    }

    return "";
  }, [isGenerating, preview]);

  function startStarterFlow(starter: StarterId) {
    setSelectedStarter(starter);
    setMessages([{ role: "assistant", content: starterCopyMap[starter].intro }]);
    setSuggestions([...starterCopyMap[starter].suggestions]);
    setPreview(null);
    setMessage("");
  }

  async function submitPrompt(promptOverride?: string) {
    const trimmedPrompt = (promptOverride ?? message).trim();
    if (!trimmedPrompt || isGenerating) {
      return;
    }

    const starter = selectedStarter ?? "unsure";
    const nextUserMessage: AiBuilderMessage = { role: "user", content: trimmedPrompt };
    const nextHistory = [...messages, nextUserMessage];

    if (!selectedStarter) {
      setSelectedStarter(starter);
    }

    setMessages(nextHistory);
    setSuggestions([]);
    setMessage("");
    setIsGenerating(true);

    try {
      const response = await generateAiBuilderResponse({
        starterType: starter,
        prompt: trimmedPrompt || starterPromptMap[starter],
        history: nextHistory,
      });

      setMessages([...nextHistory, { role: "assistant", content: response.assistantMessage }]);

      if (response.preview) {
        setPreview(response.preview);
        pushToast("AI draft prepared", "success");
      }
    } catch (error) {
      setMessage(trimmedPrompt);
      const messageText =
        error instanceof Error ? error.message : "Unable to generate AI preview right now.";
      pushToast(messageText, "danger");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submitPrompt();
    }
  }

  function handleContinue() {
    if (!preview) {
      return;
    }

    const createdPresentation = createAiPresentationFromPreview(preview);
    navigate("/app/new", {
      state: {
        aiPreview: preview,
        presentationId: createdPresentation.id,
      },
    });
  }

  return (
    <div className="ai-builder-route">
      <main className="page ai-builder-route__backdrop" aria-hidden="true">
        <section className="page__content ai-builder-route__backdrop-content">
          <h1>Welcome {user.name}</h1>
          <PageSearch
            value={query}
            onChange={setQuery}
            placeholder="Search presentations, folders, and pages"
          />
          <DiscoverySections
            query={query}
            showLearning
            showActions
            onNewPresentation={() => {}}
            onCreateWithAi={() => {}}
            onImportPresentation={() => {}}
          />
        </section>
      </main>

      <div className="ai-builder-scrim" />

      <section className="ai-builder-modal" aria-label="Start with AI">
        <header className="ai-builder-modal__header">
          <button type="button" className="ai-builder-modal__theme" disabled>
            <Paintbrush size={14} />
            Change theme
          </button>

          <div className={`ai-builder-modal__status${previewStatus ? " is-visible" : ""}`}>
            <Eye size={14} />
            {previewStatus}
          </div>

          <div className="ai-builder-modal__header-actions">
            <button type="button" className="ai-builder-modal__cancel" onClick={() => navigate("/app/home")}>
              Cancel
            </button>
            <button
              type="button"
              className="ai-builder-modal__continue"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </header>

        <div className="ai-builder-modal__body">
          <div className="ai-builder-panel">
            <div className="ai-builder-panel__inner">
              {isConversationActive ? (
                <div ref={threadRef} className="ai-builder-thread">
                  {messages.map((entry, index) =>
                    entry.role === "assistant" ? (
                      <article key={`${entry.role}-${index}`} className="ai-builder-thread__message">
                        <LogoMark className="logo-mark ai-builder-thread__logo" />
                        <div className="ai-builder-thread__assistant">
                          {formatAssistantParagraphs(entry.content).map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </article>
                    ) : (
                      <div key={`${entry.role}-${index}`} className="ai-builder-thread__message ai-builder-thread__message--user">
                        <div className="ai-builder-thread__bubble">{entry.content}</div>
                      </div>
                    ),
                  )}

                  {suggestions.length > 0 ? (
                    <section className="ai-builder-thread__suggestions">
                      <h3>Suggestions</h3>
                      <div className="ai-builder-thread__suggestion-list">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            className="ai-builder-thread__suggestion-chip"
                            onClick={() => void submitPrompt(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {isGenerating ? (
                    <article className="ai-builder-thread__message">
                      <LogoMark className="logo-mark ai-builder-thread__logo" />
                      <div className="ai-builder-thread__assistant ai-builder-thread__assistant--loading">
                        <span className="ai-builder-thread__typing-dot" />
                        <span className="ai-builder-thread__typing-dot" />
                        <span className="ai-builder-thread__typing-dot" />
                      </div>
                    </article>
                  ) : null}
                </div>
              ) : (
                <div className="ai-builder-panel__intro">
                  <LogoMark className="logo-mark ai-builder-panel__logo" />
                  <div className="ai-builder-panel__copy">
                    <h2>Let's get started! What would you like to create?</h2>

                    <div className="ai-builder-chip-grid">
                      {starterOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`ai-builder-chip${selectedStarter === option.id ? " is-active" : ""}`}
                          onClick={() => startStarterFlow(option.id)}
                        >
                          <span className="ai-builder-chip__dot" style={{ color: option.color }} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="ai-builder-panel__composer">
                <div className="ai-builder-composer">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Type your message here..."
                  />

                  <div className="ai-builder-composer__footer">
                    <button type="button" className="ai-builder-composer__file">
                      <FileUp size={16} />
                      Add files
                    </button>

                    <button
                      type="button"
                      className={`ai-builder-composer__send${isGenerating ? " is-loading" : ""}`}
                      aria-label="Send prompt"
                      disabled={!canSend}
                      onClick={() => void submitPrompt()}
                    >
                      {isGenerating ? (
                        <span className="ai-builder-composer__spinner" aria-hidden="true" />
                      ) : (
                        <ArrowUp size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <p className="ai-builder-panel__disclaimer">
                  AI can make mistakes, always check the details in your INZPHIRE.
                </p>
              </div>
            </div>
          </div>

          <div className="ai-builder-preview">
            {isGenerating && !preview ? (
              <div className="ai-builder-preview__empty">
                <PreviewIllustration />
                <span>Generating your preview...</span>
              </div>
            ) : preview ? (
              <div className="ai-builder-preview__content">
                <article className="ai-builder-preview-slide ai-builder-preview-slide--hero">
                  <div className="ai-builder-preview-slide__meta">Intro</div>
                  <h3>{preview.title}</h3>
                  <p>{preview.summary}</p>
                </article>

                <div className="ai-builder-preview__stack">
                  {preview.slides.map((slide, index) => (
                    <article key={`${slide.title}-${index}`} className="ai-builder-preview-slide">
                      <div className="ai-builder-preview-slide__header">
                        <span className="ai-builder-preview-slide__index">{index + 1}</span>
                        <span className="ai-builder-preview-slide__interaction">{slide.interaction}</span>
                      </div>
                      <h4>{slide.title}</h4>
                      <p>{slide.objective}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-builder-preview__empty">
                <PreviewIllustration />
                <span>Your preview will appear here</span>
              </div>
            )}
          </div>
        </div>

        <button type="button" className="ai-builder-modal__close" onClick={() => navigate("/app/home")}>
          <X size={18} />
        </button>
      </section>
    </div>
  );
}
