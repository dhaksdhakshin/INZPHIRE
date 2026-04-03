import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Check, SendHorizontal } from "lucide-react";

type SlideDeckItem = {
  id: string;
  title: string;
  objective: string;
  interaction: string;
  type: "title" | "word-cloud" | "scale" | "pie" | "text" | "multiple-choice";
  questionType?: string;
  choices?: string[];
};

type SessionSnapshot = {
  code: string;
  slideIndex: number;
  slides: SlideDeckItem[];
  updatedAt: number;
};

type ResultEntry = {
  counts?: number[];
  responses?: string[];
};

const SESSION_PREFIX = "inzphire-session:";
const RESULTS_PREFIX = "inzphire-results:";
const DEFAULT_CODE = "7117 9512";
const DEFAULT_SCALE_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const ensureChoiceCounts = (choices: string[] = [], counts: number[] = []) => {
  const next = [...counts];
  if (next.length < choices.length) {
    next.push(...Array.from({ length: choices.length - next.length }, () => 0));
  } else if (next.length > choices.length) {
    next.length = choices.length;
  }
  return next;
};

const parseSession = (raw: string | null) => {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
};

const parseResults = (raw: string | null) => {
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, ResultEntry>;
  } catch {
    return {};
  }
};

const formatJoinCode = (code: string) => {
  const digits = code.replace(/\s+/g, "");
  if (digits.length <= 4) {
    return digits;
  }
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`.trim();
};

export default function ParticipantPage() {
  const { code: routeCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get("code");
  const [joinCode, setJoinCode] = useState(formatJoinCode(routeCode || queryCode || DEFAULT_CODE));
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [responseText, setResponseText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const sessionKey = useMemo(() => `${SESSION_PREFIX}${joinCode}`, [joinCode]);
  const resultsKey = useMemo(() => `${RESULTS_PREFIX}${joinCode}`, [joinCode]);

  useEffect(() => {
    const loadSession = () => {
      setSession(parseSession(localStorage.getItem(sessionKey)));
    };

    loadSession();
    const interval = window.setInterval(loadSession, 1800);
    const onStorage = (event: StorageEvent) => {
      if (event.key === sessionKey) {
        loadSession();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [sessionKey]);

  useEffect(() => {
    setResponseText("");
    setSelectedIndex(null);
    setSubmitted(false);
  }, [session?.slideIndex, session?.updatedAt]);

  const activeSlide = useMemo(() => {
    if (!session || session.slides.length === 0) {
      return null;
    }
    return session.slides[Math.min(session.slideIndex, session.slides.length - 1)] ?? null;
  }, [session]);

  const isChoice =
    activeSlide?.type === "multiple-choice" || activeSlide?.type === "scale";
  const isText =
    activeSlide?.type === "word-cloud" || activeSlide?.questionType === "open-ended";

  const submitResponse = () => {
    if (!activeSlide) {
      return;
    }
    const results = parseResults(localStorage.getItem(resultsKey));
    const entry = results[activeSlide.id] ?? {};

    if (isChoice && selectedIndex !== null) {
      const choices = activeSlide.choices ?? [];
      const counts = ensureChoiceCounts(choices, entry.counts);
      counts[selectedIndex] = (counts[selectedIndex] ?? 0) + 1;
      entry.counts = counts;
    }

    if (isText && responseText.trim()) {
      const responses = entry.responses ? [...entry.responses] : [];
      responses.push(responseText.trim());
      entry.responses = responses.slice(-40);
    }

    results[activeSlide.id] = entry;
    localStorage.setItem(resultsKey, JSON.stringify(results));
    setSubmitted(true);
  };

  const joinLabel = session?.code || joinCode;
  const questionTitle = activeSlide?.title || "Waiting for a question…";
  const questionHint = activeSlide?.objective || "Respond to the question to join the live session.";
  const choices =
    activeSlide?.choices && activeSlide.choices.length > 0
      ? activeSlide.choices
      : activeSlide?.type === "scale"
        ? DEFAULT_SCALE_OPTIONS
        : [];

  return (
    <div className="participant-view">
      <header className="participant-header">
        <span className="participant-logo">INZPHIRE</span>
        <span className="participant-code">
          Join at inzphire.com
          <strong>{joinLabel}</strong>
        </span>
      </header>

      <main className="participant-card">
        <div className="participant-question">
          <h1>{questionTitle}</h1>
          <p>{questionHint}</p>
        </div>

        {isChoice ? (
          <div className="participant-choices" role="listbox" aria-label="Answer choices">
            {choices.map((option, index) => (
              <button
                key={option}
                type="button"
                className={`participant-choice${selectedIndex === index ? " is-selected" : ""}`}
                onClick={() => setSelectedIndex(index)}
              >
                <span>{option}</span>
                {selectedIndex === index ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
        ) : null}

        {isText ? (
          <div className="participant-input">
            <textarea
              value={responseText}
              onChange={(event) => setResponseText(event.target.value)}
              placeholder="Type your response here…"
              rows={5}
            />
          </div>
        ) : null}

        {!activeSlide ? (
          <div className="participant-waiting">Waiting for the presentation to begin.</div>
        ) : (
          <button
            type="button"
            className="participant-submit"
            onClick={submitResponse}
            disabled={submitted || (isChoice && selectedIndex === null) || (isText && !responseText.trim())}
          >
            {submitted ? "Sent" : "Send"}
            <SendHorizontal size={16} />
          </button>
        )}
      </main>
    </div>
  );
}
