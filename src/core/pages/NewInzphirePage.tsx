import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Download,
  Eye,
  EyeOff,
  FilePenLine,
  Check,
  Keyboard,
  LayoutGrid,
  MapPin,
  Maximize2,
  MessageSquareText,
  MousePointer2,
  PaintBucket,
  Plus,
  Copy,
  CopyPlus,
  Play,
  Pause,
  QrCode,
  RotateCcw,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Timer,
  Users,
  SendHorizontal,
  Star,
  Trash2,
  X,
  Lightbulb,
  XCircle,
} from "lucide-react";
import QRCode from "qrcode";

import { useDashboard } from "../dashboard-context";
import type { AiBuilderPreview } from "../types";
import FourDotLoader from "../../components/dashboard/FourDotLoader";
import LogoMark from "../../components/dashboard/LogoMark";
import ScratchMenuIcon from "../../components/dashboard/ScratchMenuIcon";

const toolPanels = [
  {
    id: "top",
    items: [
      { icon: FilePenLine, label: "Edit" },
      { icon: MessageSquareText, label: "Comments" },
    ],
  },
  {
    id: "bottom",
    items: [
      { icon: MousePointer2, label: "Interactivity" },
      { icon: PaintBucket, label: "Themes" },
      { icon: FilePenLine, label: "Templates", active: true },
    ],
  },
];

const templateFilters = [
  {
    id: "check-ins",
    label: "Check-ins & icebreakers",
    match: ["icebreaker", "team", "check-in", "fun"],
  },
  {
    id: "training",
    label: "Training & Evaluation",
    match: ["training", "improve", "evaluation", "workshop"],
  },
  {
    id: "brainstorming",
    label: "Workshop & Brainstorming",
    match: ["brainstorm", "initiative", "workshop", "ideas"],
  },
  {
    id: "feedback",
    label: "Feedback & Reflection",
    match: ["feedback", "reflection", "know about you"],
  },
  {
    id: "prioritise",
    label: "Plan & Prioritize",
    match: ["priorit", "impact", "ranking", "decision"],
  },
  {
    id: "events",
    label: "Events & Town Halls",
    match: ["event", "town", "meeting"],
  },
];

const QR_GRID_SIZE = 21;
const DEFAULT_MULTIPLE_CHOICE_OPTIONS = ["Option 1", "Option 2", "Option 3", "Option 4"];
type PresentationSlideType = "title" | "word-cloud" | "scale" | "pie" | "text" | "multiple-choice" | "ranking" | "qna" | "hundred-points" | "grid-2x2" | "pin-image" | "select-answer" | "type-answer" | "image-choice" | "reactions" | "quick-form" | "comments" | "gather-names" | "leaderboard" | "timer" | "instructions" | "content" | "guess-number";
type QuestionTypeKey = keyof typeof QUESTION_TYPE_TO_PRESENTATION_TYPE;
type SlideDeckItem = {
  id: string;
  title: string;
  objective: string;
  interaction: string;
  type: PresentationSlideType;
  questionType?: QuestionTypeKey;
  choices?: string[];
  choiceCounts?: number[];
  label?: string;
  skipped?: boolean;
  options?: string[];
  imageUrl?: string;
  imageOptions?: Array<{ id: string; url: string; label: string }>;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  gridXLabel?: string;
  gridYLabel?: string;
  timerDuration?: number;
  quizPoints?: number;
  quizTimerSeconds?: number;
  correctAnswers?: string[];
  correctAnswerIndex?: number;
  formFields?: Array<{ id: string; label: string; type: "email" | "text" | "phone" }>;
  contentHtml?: string;
  instructionSteps?: string[];
  reactions?: string[];
  maxResponseLength?: number;
  maxResponses?: number;
  correctNumber?: number;
  guessMin?: number;
  guessMax?: number;
};

type ThemePreset = {
  id: string;
  name: string;
  surfaceBg: string;
  surfaceBorder: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  muted: string;
  cloudBg: string;
  cloudBorder: string;
  previewBg: string;
  bars: string[];
};

const themePresets: ThemePreset[] = [
  {
    id: "inzphire-dark",
    name: "INZPHIRE Dark",
    surfaceBg: "#0f0f10",
    surfaceBorder: "#1d1d1f",
    cardBg: "#1c1c1e",
    cardBorder: "#3a3a3f",
    text: "#f5f4f1",
    muted: "rgba(245,244,241,0.7)",
    cloudBg: "#141416",
    cloudBorder: "#2a2a2e",
    previewBg: "#141418",
    bars: ["#7c7aff", "#ff8f8f", "#5f6ed5", "#3a3a3f"],
  },
  {
    id: "inzphire-light",
    name: "INZPHIRE Light",
    surfaceBg: "#ffffff",
    surfaceBorder: "#d7d7d2",
    cardBg: "#ffffff",
    cardBorder: "rgba(120,134,245,0.65)",
    text: "#121212",
    muted: "#7b7b78",
    cloudBg: "transparent",
    cloudBorder: "transparent",
    previewBg: "#f4f3fb",
    bars: ["#7c7aff", "#ff8f8f", "#8ea1ff", "#cfd2ff"],
  },
  {
    id: "rosehip",
    name: "Rosehip",
    surfaceBg: "#fff7f6",
    surfaceBorder: "#f2dedd",
    cardBg: "#ffffff",
    cardBorder: "#f1c9c5",
    text: "#2b2221",
    muted: "#8b7a78",
    cloudBg: "#fff1ef",
    cloudBorder: "#f4d2ce",
    previewBg: "#ffe9e6",
    bars: ["#e45a5a", "#f3a3a0", "#7c7aff", "#f9d2cf"],
  },
  {
    id: "pistachio",
    name: "Pistachio",
    surfaceBg: "#f4fbf7",
    surfaceBorder: "#d8eadf",
    cardBg: "#ffffff",
    cardBorder: "#cde8d6",
    text: "#22322b",
    muted: "#6f8277",
    cloudBg: "#eef8f2",
    cloudBorder: "#cfe4d7",
    previewBg: "#e9f7ee",
    bars: ["#6ccb8a", "#2f7f5d", "#7c7aff", "#bfe9cc"],
  },
  {
    id: "vanilla-bean",
    name: "Vanilla Bean",
    surfaceBg: "#faf7f0",
    surfaceBorder: "#e6ddd2",
    cardBg: "#ffffff",
    cardBorder: "#e6ddd2",
    text: "#2f2a24",
    muted: "#7b7065",
    cloudBg: "#f7f1e6",
    cloudBorder: "#eadfcf",
    previewBg: "#f5efe4",
    bars: ["#bda27d", "#e3d3b5", "#9a8cff", "#f2e7d6"],
  },
  {
    id: "juniper",
    name: "Juniper",
    surfaceBg: "#eef1ff",
    surfaceBorder: "#d4daf8",
    cardBg: "#ffffff",
    cardBorder: "#c9c7f7",
    text: "#23253a",
    muted: "#70749b",
    cloudBg: "#e7ebff",
    cloudBorder: "#c6ccf5",
    previewBg: "#e7ebff",
    bars: ["#7c7aff", "#9aa5ff", "#5562d9", "#cfd5ff"],
  },
  {
    id: "edamame",
    name: "Edamame",
    surfaceBg: "#eef7f1",
    surfaceBorder: "#d3e6da",
    cardBg: "#ffffff",
    cardBorder: "#c4dfcf",
    text: "#203226",
    muted: "#6f8277",
    cloudBg: "#e8f4ec",
    cloudBorder: "#cbe0d4",
    previewBg: "#e5f3ea",
    bars: ["#4f8f6d", "#7ed0a0", "#234e38", "#bfe6d1"],
  },
  {
    id: "huckleberry",
    name: "Huckleberry",
    surfaceBg: "#1c1c26",
    surfaceBorder: "#30303b",
    cardBg: "#232332",
    cardBorder: "#3b3b52",
    text: "#f5f5fb",
    muted: "rgba(245,245,251,0.7)",
    cloudBg: "#1a1a24",
    cloudBorder: "#2d2d3b",
    previewBg: "#1f1f2c",
    bars: ["#7c7aff", "#a3b1ff", "#4752c9", "#2a2a3a"],
  },
];

const QUESTION_TYPE_TO_PRESENTATION_TYPE: Record<string, PresentationSlideType> = {
  "word-cloud": "word-cloud",
  "multiple-choice": "multiple-choice",
  "open-ended": "text",
  scales: "scale",
  ranking: "ranking",
  qna: "qna",
  "guess-number": "guess-number",
  "points-100": "hundred-points",
  "grid-2x2": "grid-2x2",
  "pin-image": "pin-image",
  "select-answer": "select-answer",
  "type-answer": "type-answer",
  "image-choice": "image-choice",
  "reactions": "reactions",
  "quick-form": "quick-form",
  "comments": "comments",
  "gather-names": "gather-names",
  "leaderboard": "leaderboard",
  "timer": "timer",
  "instructions": "instructions",
  "content": "content",
  "hundred-points": "hundred-points",
  "two-by-two": "grid-2x2",
};

function inferQuestionTypeFromSlide(title: string, interaction: string): QuestionTypeKey {
  const signature = `${title} ${interaction}`.toLowerCase();
  if (signature.includes("text bomb")) {
    return "word-cloud";
  }
  if (signature.includes("multiple choice") || signature.includes("poll")) {
    return "multiple-choice";
  }
  if (signature.includes("open ended") || signature.includes("open-ended")) {
    return "open-ended";
  }
  if (signature.includes("scale")) {
    return "scales";
  }
  if (signature.includes("ranking")) {
    return "ranking";
  }
  if (signature.includes("q&a") || signature.includes("qna")) {
    return "qna";
  }
  if (signature.includes("guess")) {
    return "guess-number";
  }
  if (signature.includes("100 points")) {
    return "points-100";
  }
  if (signature.includes("2 x 2") || signature.includes("2x2")) {
    return "grid-2x2";
  }
  if (signature.includes("pin on image")) {
    return "pin-image";
  }
  if (signature.includes("select answer")) {
    return "select-answer";
  }
  if (signature.includes("type answer")) {
    return "type-answer";
  }
  if (signature.includes("image choice")) return "image-choice";
  if (signature.includes("hundred points")) return "hundred-points";
  if (signature.includes("two by two") || signature.includes("2x2 matrix")) return "two-by-two";
  if (signature.includes("pin on image")) return "pin-image";
  if (signature.includes("reaction")) return "reactions";
  if (signature.includes("quick form")) return "quick-form";
  if (signature.includes("comment")) return "comments";
  if (signature.includes("gather name")) return "gather-names";
  if (signature.includes("timer")) return "timer";
  if (signature.includes("instruction")) return "instructions";
  if (signature.includes("content slide")) return "content";
  if (signature.includes("leaderboard")) return "leaderboard";
  if (signature.includes("title") || signature.includes("intro")) {
    return "open-ended";
  }
  return "open-ended";
}

function buildSeedSlideDeck(
  slides: Array<{ title?: string; objective?: string; interaction?: string }>,
): SlideDeckItem[] {
  return slides.map((slide, index) => {
    const title = slide.title ?? "Untitled slide";
    const objective = slide.objective ?? "";
    const interaction = slide.interaction ?? "";
    const questionType = inferQuestionTypeFromSlide(title, interaction);
    const baseSlide: SlideDeckItem = {
      id: `seed-${index}`,
      title,
      objective,
      interaction,
      type: QUESTION_TYPE_TO_PRESENTATION_TYPE[questionType] ?? "text",
      questionType,
    };
    if (questionType === "multiple-choice") {
      baseSlide.choices = [...DEFAULT_MULTIPLE_CHOICE_OPTIONS];
      baseSlide.choiceCounts = Array.from({ length: baseSlide.choices.length }, () => 0);
    }
    return baseSlide;
  });
}

function buildPseudoQrMatrix(seed: string) {
  const matrix = Array.from({ length: QR_GRID_SIZE }, () => Array(QR_GRID_SIZE).fill(false));
  const reserved = Array.from({ length: QR_GRID_SIZE }, () => Array(QR_GRID_SIZE).fill(false));

  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const isOuter = y === 0 || y === 6 || x === 0 || x === 6;
        const isInner = y >= 2 && y <= 4 && x >= 2 && x <= 4;
        matrix[startY + y][startX + x] = isOuter || isInner;
        reserved[startY + y][startX + x] = true;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(QR_GRID_SIZE - 7, 0);
  drawFinder(0, QR_GRID_SIZE - 7);

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  for (let y = 0; y < QR_GRID_SIZE; y += 1) {
    for (let x = 0; x < QR_GRID_SIZE; x += 1) {
      if (reserved[y][x]) {
        continue;
      }
      const value = (hash + x * 17 + y * 29 + x * y) % 7;
      matrix[y][x] = value < 3;
    }
  }

  return matrix;
}

function generateJoinCode() {
  const digits = Math.floor(10000000 + Math.random() * 90000000)
    .toString()
    .padStart(8, "0");
  return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

export default function NewInzphirePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    presentations,
    templateCards,
    createPresentationFromTemplate,
    pushToast,
  } = useDashboard();
  const [message, setMessage] = useState("");
  const [createMode, setCreateMode] = useState<"create" | "results">("create");
  const [isBooting, setIsBooting] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideDeck, setSlideDeck] = useState<SlideDeckItem[]>([]);
  const [isDeckDirty, setIsDeckDirty] = useState(false);
  const [wordCloudQuestion, setWordCloudQuestion] = useState("Your Text Bomb question here");
  const [isScratchMenuOpen, setIsScratchMenuOpen] = useState(false);
  const [scratchMenuMode, setScratchMenuMode] = useState<"start" | "add">("start");
  const [isQuestionTypeOpen, setIsQuestionTypeOpen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showJoinBar, setShowJoinBar] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [presenterControlsVisible, setPresenterControlsVisible] = useState(true);
  const [responsesHidden, setResponsesHidden] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVotingPaused, setIsVotingPaused] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [wordCloudInspectorView, setWordCloudInspectorView] = useState<
    "slide" | "wordcloud" | "question"
  >("wordcloud");
  const [questionLabel, setQuestionLabel] = useState("");
  const [wordCloudResponsesMode, setWordCloudResponsesMode] = useState<
    "instant" | "click" | "private"
  >("instant");
  const [wordCloudResponseLimit, setWordCloudResponseLimit] = useState("Unlimited");
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [activeTemplateFilter, setActiveTemplateFilter] = useState(templateFilters[0].id);
  const [slideMenuOpenId, setSlideMenuOpenId] = useState<string | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"slide" | "themes">("slide");
  const [activeThemeId, setActiveThemeId] = useState<string>("inzphire-light");
  const [liveResults, setLiveResults] = useState<
    Record<string, { counts?: number[]; responses?: string[] }>
  >({});
  const locationState = location.state as
    | {
        aiPreview?: AiBuilderPreview;
        presentationId?: string;
        title?: string;
        templateType?: string;
        templatePrompt?: string;
        templateIsBlank?: boolean;
      }
    | null;
  const aiPreview = locationState?.aiPreview ?? null;
  const selectedTitle = locationState?.title;
  const templateType = locationState?.templateType;
  const templatePrompt = locationState?.templatePrompt;
  const templateIsBlank = locationState?.templateIsBlank ?? false;
  const selectedPresentation = presentations.find(
    (presentation) => presentation.id === locationState?.presentationId,
  );
  const presentationKey = selectedPresentation?.id ?? locationState?.presentationId ?? "scratch";
  const [joinCode, setJoinCode] = useState(() => {
    if (typeof window === "undefined") {
      return "0000 0000";
    }
    const storageKey = `inzphire-join-code:${presentationKey}`;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      return stored;
    }
    const fresh = generateJoinCode();
    window.localStorage.setItem(storageKey, fresh);
    return fresh;
  });
  const publicOrigin = process.env.NEXT_PUBLIC_ORIGIN ?? "";
  const joinHost = useMemo(() => {
    if (publicOrigin) {
      try {
        return new URL(publicOrigin).host;
      } catch {
        return publicOrigin.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      }
    }
    if (typeof window !== "undefined" && window.location?.host) {
      return window.location.host;
    }
    return "inzphire.com";
  }, [publicOrigin]);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const joinCodeDigits = useMemo(() => joinCode.replace(/\s+/g, ""), [joinCode]);
  const joinUrl = useMemo(() => {
    if (publicOrigin) {
      return `${publicOrigin.replace(/\/$/, "")}/join/${joinCodeDigits}`;
    }
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}/join/${joinCodeDigits}`;
    }
    return `https://${joinHost}/join/${joinCodeDigits}`;
  }, [joinCodeDigits, joinHost, publicOrigin]);
  const scaleOptions = ["Statement 1", "Statement 2", "Statement 3"];
  const pieOptions = ["Morning", "Lunchtime", "Afternoon", "Evening"];
  const sessionStorageKey = useMemo(() => `inzphire-session:${joinCode}`, [joinCode]);
  const resultsStorageKey = useMemo(() => `inzphire-results:${joinCode}`, [joinCode]);
  const qrMatrix = useMemo(() => buildPseudoQrMatrix(joinCode), [joinCode]);
  const previousQuestionType = useRef<string | null>(null);
  const deckSeedRef = useRef<string>("");
  const presentationControlsTimeout = useRef<number | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storageKey = `inzphire-join-code:${presentationKey}`;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setJoinCode(stored);
      return;
    }
    const fresh = generateJoinCode();
    window.localStorage.setItem(storageKey, fresh);
    setJoinCode(fresh);
  }, [presentationKey]);

  const filteredTemplates = useMemo(() => {
    const filter = templateFilters.find((item) => item.id === activeTemplateFilter);
    if (!filter) {
      return templateCards;
    }
    return templateCards.filter((template) => {
      const haystack = `${template.title} ${template.prompt} ${template.description}`.toLowerCase();
      return filter.match.some((keyword) => haystack.includes(keyword));
    });
  }, [activeTemplateFilter, templateCards]);

  const activeTheme = useMemo(
    () => themePresets.find((theme) => theme.id === activeThemeId) ?? themePresets[0],
    [activeThemeId],
  );

  const themeStyle = useMemo(
    () =>
      ({
        "--theme-surface-bg": activeTheme.surfaceBg,
        "--theme-surface-border": activeTheme.surfaceBorder,
        "--theme-card-bg": activeTheme.cardBg,
        "--theme-card-border": activeTheme.cardBorder,
        "--theme-text": activeTheme.text,
        "--theme-muted": activeTheme.muted,
        "--theme-cloud-bg": activeTheme.cloudBg,
        "--theme-cloud-border": activeTheme.cloudBorder,
      }) as Record<string, string>,
    [activeTheme],
  );

  const parseResults = (raw: string | null) => {
    if (!raw) {
      return {};
    }
    try {
      return JSON.parse(raw) as Record<string, { counts?: number[]; responses?: string[] }>;
    } catch {
      return {};
    }
  };

  function ensureMultipleChoiceOptions(choices?: string[]) {
    if (choices && choices.length > 0) {
      return [...choices];
    }
    return [...DEFAULT_MULTIPLE_CHOICE_OPTIONS];
  }

  function normalizeChoiceCounts(choices: string[], counts?: number[]) {
    const next = counts ? [...counts] : [];
    if (next.length < choices.length) {
      next.push(...Array.from({ length: choices.length - next.length }, () => 0));
    } else if (next.length > choices.length) {
      next.length = choices.length;
    }
    return next;
  }

  const recordChoiceResult = async (slideId: string, choices: string[], index: number) => {
    const results = parseResults(localStorage.getItem(resultsStorageKey));
    const entry = results[slideId] ?? {};
    const counts = ensureMultipleChoiceOptions(choices);
    const nextCounts = normalizeChoiceCounts(counts, entry.counts);
    nextCounts[index] = (nextCounts[index] ?? 0) + 1;
    const finalResults = {
      ...results,
      [slideId]: { ...entry, counts: nextCounts },
    };
    localStorage.setItem(resultsStorageKey, JSON.stringify(finalResults));
    setLiveResults(finalResults);

    try {
      await fetch(`/api/sync?code=${joinCode}&type=results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: finalResults }),
      });
    } catch (err) {
      console.error("Failed to sync results", err);
    }
  };

  useEffect(() => {
    const loadResultsFromLocal = () => {
      setLiveResults(parseResults(localStorage.getItem(resultsStorageKey)));
    };

    // Aggregate raw responses into renderer-friendly format
    const aggregateResponses = (
      rawResponses: Array<{ slideId: string; data: any }>,
    ): Record<string, { counts?: number[]; responses?: string[] }> => {
      const result: Record<string, { counts?: number[]; responses?: string[] }> = {};

      for (const entry of rawResponses) {
        const sid = entry.slideId;
        if (!sid) continue;
        if (!result[sid]) result[sid] = {};
        const payload = entry.data;
        if (!payload) continue;

        // Text-based (word cloud, open ended)
        if (payload.type === "text") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(payload.value);
        }
        // Multiple choice / quiz selection
        else if (payload.type === "choice" || (payload.type === "quiz_answer" && typeof payload.index === "number")) {
          const idx = payload.index ?? 0;
          if (!result[sid].counts) result[sid].counts = [];
          while (result[sid].counts!.length <= idx) result[sid].counts!.push(0);
          result[sid].counts![idx]++;
        }
        // Scale
        else if (payload.type === "scale") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(String(payload.value));
        }
        // Ranking
        else if (payload.type === "ranking") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(JSON.stringify(payload.order));
        }
        // Points
        else if (payload.type === "points") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(JSON.stringify(payload.values));
        }
        // Grid
        else if (payload.type === "grid") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(JSON.stringify({ x: payload.x, y: payload.y }));
        }
        // Pin
        else if (payload.type === "pin") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(JSON.stringify({ x: payload.x, y: payload.y }));
        }
        // Image choice
        else if (payload.type === "image_choice") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(payload.imageId);
        }
        // Form
        else if (payload.type === "form") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(JSON.stringify(payload.fields));
        }
        // Name
        else if (payload.type === "name") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(payload.name);
        }
        // Quiz typed answer
        else if (payload.type === "quiz_answer") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(payload.answer);
        }
        // Guess number
        else if (payload.type === "guess_number") {
          if (!result[sid].responses) result[sid].responses = [];
          result[sid].responses!.push(String(payload.value));
        }
      }

      return result;
    };

    const loadResultsFromBackend = async () => {
      try {
        // Fetch raw participant responses
        const res = await fetch(`/api/sync?code=${joinCode}&type=responses`);
        if (res.ok) {
          const { data } = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            const aggregated = aggregateResponses(data);
            // Merge with any existing local results (from presenter's own clicks)
            const local = parseResults(localStorage.getItem(resultsStorageKey));
            const merged = { ...local };
            for (const [slideId, slideResult] of Object.entries(aggregated)) {
              if (!merged[slideId]) {
                merged[slideId] = slideResult;
              } else {
                // Merge counts
                if (slideResult.counts) {
                  if (!merged[slideId].counts) merged[slideId].counts = [];
                  for (let i = 0; i < slideResult.counts.length; i++) {
                    while (merged[slideId].counts!.length <= i) merged[slideId].counts!.push(0);
                    merged[slideId].counts![i] = slideResult.counts[i];
                  }
                }
                // Merge responses
                if (slideResult.responses) {
                  merged[slideId].responses = slideResult.responses;
                }
              }
            }
            localStorage.setItem(resultsStorageKey, JSON.stringify(merged));
            setLiveResults(merged);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch responses", err);
      }

      // Also try legacy results endpoint
      try {
        const res = await fetch(`/api/sync?code=${joinCode}&type=results`);
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            localStorage.setItem(resultsStorageKey, JSON.stringify(data));
            setLiveResults(data);
            return;
          }
        }
      } catch {}

      loadResultsFromLocal();
    };

    loadResultsFromBackend();
    const interval = window.setInterval(loadResultsFromBackend, 800);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === resultsStorageKey) {
        loadResultsFromLocal();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [joinCode, resultsStorageKey]);

  function handleToolPanelAction(label: string) {
    if (label === "Templates") {
      setIsTemplatesModalOpen(true);
      return;
    }
    if (label === "Themes") {
      setInspectorTab("themes");
      return;
    }
    if (label === "Edit" || label === "Comments" || label === "Interactivity") {
      setInspectorTab("slide");
    }
  }

  const questionTypeOptions = useMemo(
    () => ({
      "multiple-choice": {
        label: "Multiple Choice",
        icon: "multiple-choice",
        colorClass: "editor-inspector__icon--blue",
        previewTitle: "Multiple Choice",
        previewObjective: "Add options so your audience can vote.",
        group: "interactive",
      },
      "word-cloud": {
        label: "Text Bomb",
        icon: "word-cloud",
        colorClass: "editor-inspector__icon--coral",
        previewTitle: "Text Bomb",
        previewObjective: "Collect one-word responses from your audience.",
        group: "interactive",
      },
      "open-ended": {
        label: "Open Ended",
        icon: "open-ended",
        colorClass: "editor-inspector__icon--rose",
        previewTitle: "Your Open Ended question here",
        previewObjective: "Let your audience respond in full sentences.",
        group: "interactive",
      },
      scales: {
        label: "Scales",
        icon: "scales",
        colorClass: "editor-inspector__icon--violet",
        previewTitle: "Scales",
        previewObjective: "Measure sentiment on a scale.",
        group: "interactive",
      },
      ranking: {
        label: "Ranking",
        icon: "ranking",
        colorClass: "editor-inspector__icon--green",
        previewTitle: "Ranking",
        previewObjective: "Ask the audience to prioritize options.",
        group: "interactive",
      },
      qna: {
        label: "Q&A",
        icon: "qna",
        colorClass: "editor-inspector__icon--rose",
        previewTitle: "Q&A",
        previewObjective: "Collect questions from the audience.",
        group: "interactive",
      },
      "guess-number": {
        label: "Guess the Number",
        icon: "guess-number",
        colorClass: "editor-inspector__icon--amber",
        previewTitle: "Guess the Number",
        previewObjective: "Ask for a numerical guess.",
        group: "interactive",
      },
      "points-100": {
        label: "100 Points",
        icon: "points-100",
        colorClass: "editor-inspector__icon--blue",
        previewTitle: "100 Points",
        previewObjective: "Distribute 100 points across options.",
        group: "interactive",
      },
      "grid-2x2": {
        label: "2 x 2 Grid",
        icon: "grid-2x2",
        colorClass: "editor-inspector__icon--salmon",
        previewTitle: "2 x 2 Grid",
        previewObjective: "Place items in a 2 x 2 matrix.",
        group: "interactive",
      },
      "pin-image": {
        label: "Pin on Image",
        icon: "pin-image",
        colorClass: "editor-inspector__icon--purple",
        previewTitle: "Pin on Image",
        previewObjective: "Let participants drop pins on an image.",
        group: "interactive",
      },
      "select-answer": {
        label: "Select Answer",
        icon: "select-answer",
        colorClass: "editor-inspector__icon--blue",
        previewTitle: "Select Answer",
        previewObjective: "Pick the best answer in a quiz.",
        group: "quiz",
      },
      "type-answer": {
        label: "Type Answer",
        icon: "type-answer",
        colorClass: "editor-inspector__icon--green",
        previewTitle: "Type Answer",
        previewObjective: "Let participants type their answer.",
        group: "quiz",
      },
      "image-choice": {
        label: "Image Choice",
        icon: "image-choice",
        colorClass: "editor-inspector__icon--blue",
        previewTitle: "Image Choice",
        previewObjective: "Let participants vote on images.",
        group: "interactive",
      },
      "hundred-points": {
        label: "100 Points",
        icon: "points-100",
        colorClass: "editor-inspector__icon--blue",
        previewTitle: "100 Points",
        previewObjective: "Distribute 100 points across options.",
        group: "interactive",
      },
      "two-by-two": {
        label: "2 x 2 Grid",
        icon: "grid-2x2",
        colorClass: "editor-inspector__icon--salmon",
        previewTitle: "2 x 2 Grid",
        previewObjective: "Place items in a 2 x 2 matrix.",
        group: "interactive",
      },
      reactions: {
        label: "Reactions",
        icon: "reactions",
        colorClass: "editor-inspector__icon--purple",
        previewTitle: "Reactions",
        previewObjective: "Collect emoji reactions from the audience.",
        group: "interactive",
      },
      "quick-form": {
        label: "Quick Form",
        icon: "quick-form",
        colorClass: "editor-inspector__icon--gold",
        previewTitle: "Quick Form",
        previewObjective: "Collect emails and other data.",
        group: "interactive",
      },
      comments: {
        label: "Comments",
        icon: "comments",
        colorClass: "editor-inspector__icon--blue",
        previewTitle: "Comments",
        previewObjective: "Live chat during presentation.",
        group: "interactive",
      },
      "gather-names": {
        label: "Gather Names",
        icon: "gather-names",
        colorClass: "editor-inspector__icon--blue",
        previewTitle: "Gather Names",
        previewObjective: "Collect participant names.",
        group: "interactive",
      },
      timer: {
        label: "Timer",
        icon: "timer",
        colorClass: "editor-inspector__icon--amber",
        previewTitle: "Timer",
        previewObjective: "Countdown timer for activities.",
        group: "interactive",
      },
      instructions: {
        label: "Instructions",
        icon: "instructions",
        colorClass: "editor-inspector__icon--slate",
        previewTitle: "Instructions",
        previewObjective: "Show how to join and participate.",
        group: "interactive",
      },
      content: {
        label: "Content Slide",
        icon: "content",
        colorClass: "editor-inspector__icon--slate",
        previewTitle: "Content Slide",
        previewObjective: "Plain text/image content.",
        group: "interactive",
      },
      leaderboard: {
        label: "Leaderboard",
        icon: "leaderboard",
        colorClass: "editor-inspector__icon--gold",
        previewTitle: "Leaderboard",
        previewObjective: "Display top 10 scores.",
        group: "quiz",
      },
    }),
    [],
  );

  const [selectedQuestionType, setSelectedQuestionType] = useState<keyof typeof questionTypeOptions>(
    () => {
      if (templateType && templateType in questionTypeOptions) {
        return templateType as keyof typeof questionTypeOptions;
      }
      return "word-cloud";
    },
  );
  const [localTemplateType, setLocalTemplateType] = useState<string | null>(templateType ?? null);

  useEffect(() => {
    setLocalTemplateType(templateType ?? null);
  }, [templateType]);

  const activeTemplateType = localTemplateType ?? templateType ?? null;

  useEffect(() => {
    if (templateType && templateType in questionTypeOptions) {
      setSelectedQuestionType(templateType as keyof typeof questionTypeOptions);
    }
  }, [templateType, questionTypeOptions]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!isPresenting) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPresenting]);

  useEffect(() => {
    if (!isPresenting) {
      return;
    }

    let hideTimer: number | null = window.setTimeout(() => {
      setPresenterControlsVisible(false);
    }, 2200);

    const handleActivity = () => {
      setPresenterControlsVisible(true);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      hideTimer = window.setTimeout(() => {
        setPresenterControlsVisible(false);
      }, 2200);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [isPresenting]);

  useEffect(() => {
    if (previousQuestionType.current === selectedQuestionType) {
      return;
    }

    if (selectedQuestionType === "word-cloud") {
      setWordCloudInspectorView("wordcloud");
    } else {
      setWordCloudInspectorView("slide");
    }

    previousQuestionType.current = selectedQuestionType;
  }, [selectedQuestionType]);

  useEffect(() => {
    if (!slideMenuOpenId) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest(".editor-slide__menu")) {
        return;
      }
      closeSlideMenu();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSlideMenu();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [slideMenuOpenId]);

  const wordCloudPalette = [
    "#b9b6f7",
    "#f8bcb5",
    "#a7abc8",
    "#c9c7f7",
    "#d8b0ac",
    "#f3c4bf",
    "#b7b4e6",
  ];

  const templateSlides = useMemo(() => {
    if (!activeTemplateType) {
      return [];
    }

    if (activeTemplateType === "word-cloud") {
      return [
        {
          title: "Your Text Bomb question here",
          objective:
            templatePrompt ||
            "Use one word to describe the most important trait for a great leader.",
          interaction: "Text bomb",
        },
      ];
    }

    return [
      {
        title: templatePrompt ? "Template slide" : "Blank template",
        objective: templatePrompt || "Customize this template to get started.",
        interaction: activeTemplateType.replace(/-/g, " "),
      },
    ];
  }, [activeTemplateType, templatePrompt]);

  const activeQuestionConfig =
    questionTypeOptions[selectedQuestionType] ?? questionTypeOptions["word-cloud"];
  const isWordCloudSlide = selectedQuestionType === "word-cloud";
  const isQuestionSlide = ["word-cloud", "multiple-choice", "open-ended"].includes(selectedQuestionType);
  const showWordCloudPanel = isWordCloudSlide && wordCloudInspectorView === "wordcloud";
  const showQuestionPanel = isQuestionSlide && wordCloudInspectorView === "question";
  const showSlidePanel = !isQuestionSlide || wordCloudInspectorView === "slide";

  const questionTypeSlides = useMemo(() => {
    if (!activeTemplateType) {
      return [];
    }

    return [
      {
        title: selectedQuestionType === "word-cloud" ? wordCloudQuestion : activeQuestionConfig.previewTitle,
        objective: activeQuestionConfig.previewObjective,
        interaction: activeQuestionConfig.label,
      },
    ];
  }, [activeTemplateType, selectedQuestionType, wordCloudQuestion, activeQuestionConfig]);

  const fallbackSlides = useMemo(() => {
    if (!selectedPresentation) {
      return [];
    }

    const count = Math.max(1, selectedPresentation.slides || 1);
    const templates = [
      { title: "Title slide", objective: "Introduce the topic and set the stage.", interaction: "Title slide" },
      { title: "Audience poll", objective: "Collect quick audience input.", interaction: "Poll" },
      { title: "Text bomb", objective: "Capture immediate reactions.", interaction: "Text bomb" },
      { title: "Open ended", objective: "Invite longer responses.", interaction: "Open ended" },
      { title: "Ranking", objective: "Prioritize ideas together.", interaction: "Ranking" },
      { title: "Scales", objective: "Measure sentiment on a scale.", interaction: "Scales" },
      { title: "Q&A", objective: "Wrap up with questions.", interaction: "Q&A" },
    ];

    return Array.from({ length: count }, (_, index) => {
      const template = templates[index % templates.length];
      return {
        title: `${template.title}`,
        objective: template.objective,
        interaction: template.interaction,
      };
    });
  }, [selectedPresentation]);
  const generatedSlides = useMemo(() => {
    if (aiPreview) {
      return aiPreview.slides;
    }

    if (questionTypeSlides.length > 0) {
      return questionTypeSlides;
    }

    if (fallbackSlides.length > 0) {
      return fallbackSlides;
    }

    return [
      {
        title: "Title slide",
        objective: "Start from scratch or ask AI to build your first draft.",
        interaction: "Title slide",
      },
    ];
  }, [aiPreview, questionTypeSlides, fallbackSlides]);

  const seededSlides = useMemo(() => buildSeedSlideDeck(generatedSlides), [generatedSlides]);
  const deckSlides = slideDeck.length > 0 ? slideDeck : seededSlides;
  const presentationSlides = deckSlides;

  useEffect(() => {
    const snapshot = {
      code: joinCode,
      slideIndex: activeSlideIndex,
      slides: deckSlides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        objective: slide.objective,
        interaction: slide.interaction,
        type: slide.type,
        questionType: slide.questionType,
        choices: slide.choices,
        options: slide.choices,
        imageUrl: slide.imageUrl,
        imageOptions: slide.imageOptions,
        scaleMin: slide.scaleMin,
        scaleMax: slide.scaleMax,
        scaleMinLabel: slide.scaleMinLabel,
        scaleMaxLabel: slide.scaleMaxLabel,
        gridXLabel: slide.gridXLabel,
        gridYLabel: slide.gridYLabel,
        timerDuration: slide.timerDuration,
        quizPoints: slide.quizPoints,
        quizTimerSeconds: slide.quizTimerSeconds,
        correctAnswers: slide.correctAnswers,
        correctAnswerIndex: slide.correctAnswerIndex,
        formFields: slide.formFields,
        contentHtml: slide.contentHtml,
        instructionSteps: slide.instructionSteps,
        reactions: slide.reactions,
        maxResponseLength: slide.maxResponseLength,
        maxResponses: slide.maxResponses,
        correctNumber: slide.correctNumber,
        guessMin: slide.guessMin,
        guessMax: slide.guessMax,
      })),
      updatedAt: Date.now(),
    };
    
    // Also save in localStorage for local fallback just in case
    localStorage.setItem(sessionStorageKey, JSON.stringify(snapshot));

    // Sync to backend DB so participants on other devices can see it
    fetch(`/api/sync?code=${joinCode}&type=session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: snapshot }),
    }).catch(err => console.error("Failed to sync session", err));

  }, [activeSlideIndex, deckSlides, joinCode, sessionStorageKey]);

  useEffect(() => {
    const deckSeed = [
      aiPreview?.title ?? "",
      selectedPresentation?.id ?? "",
      templateType ?? "",
      templatePrompt ?? "",
    ].join("|");
    if (deckSeedRef.current !== deckSeed) {
      deckSeedRef.current = deckSeed;
      setIsDeckDirty(false);
    }
  }, [aiPreview?.title, selectedPresentation?.id, templateType, templatePrompt]);

  useEffect(() => {
    if (isDeckDirty) {
      return;
    }
    setSlideDeck(seededSlides);
    setActiveSlideIndex(0);
    const firstSlide = seededSlides[0];
    if (firstSlide?.questionType && firstSlide.questionType in questionTypeOptions) {
      setSelectedQuestionType(firstSlide.questionType as keyof typeof questionTypeOptions);
      setLocalTemplateType(firstSlide.questionType);
      if (firstSlide.questionType === "word-cloud") {
        setWordCloudQuestion(firstSlide.title || "Your Text Bomb question here");
        setWordCloudInspectorView("wordcloud");
      } else {
        setWordCloudInspectorView("slide");
      }
    }
    setQuestionLabel(firstSlide?.label ?? "");
  }, [seededSlides, isDeckDirty, questionTypeOptions]);

  const presentationSlide =
    presentationSlides[Math.min(activeSlideIndex, presentationSlides.length - 1)] ??
    ({
      title: "Warm-up icebreaker: What’s one thing you can’t live without?",
      objective: "",
      interaction: "",
      type: "text",
      choices: [...DEFAULT_MULTIPLE_CHOICE_OPTIONS],
    } as {
      title: string;
      objective: string;
      interaction: string;
      type: PresentationSlideType;
      choices?: string[];
    });

  const pieLegend =
    presentationSlide.choices && presentationSlide.choices.length > 0
      ? presentationSlide.choices
      : pieOptions;
  const piePercents = useMemo(() => {
    if (pieLegend.length === 0) {
      return [];
    }
    const seed = `${presentationSlide.title}-${pieLegend.join("|")}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const raw = pieLegend.map((_, index) => {
      const value = ((hash >> ((index % 4) * 8)) & 0xff) % 25;
      return 8 + value;
    });
    const total = raw.reduce((sum, value) => sum + value, 0) || 1;
    const percents = raw.map((value) => Math.max(4, Math.round((value / total) * 100)));
    const adjust = percents.reduce((sum, value) => sum + value, 0) - 100;
    if (adjust !== 0) {
      percents[0] = Math.max(4, percents[0] - adjust);
    }
    return percents;
  }, [pieLegend, presentationSlide.title]);

  const multipleChoiceLabels = useMemo(() => {
    if (presentationSlide.type !== "multiple-choice") {
      return [];
    }
    return ensureMultipleChoiceOptions(presentationSlide.choices);
  }, [presentationSlide.type, presentationSlide.choices]);

  const liveChoiceCounts = liveResults[presentationSlide.id]?.counts;

  const multipleChoiceCounts = useMemo(() => {
    if (presentationSlide.type !== "multiple-choice") {
      return [];
    }
    return normalizeChoiceCounts(multipleChoiceLabels, liveChoiceCounts ?? presentationSlide.choiceCounts);
  }, [presentationSlide.type, presentationSlide.choiceCounts, multipleChoiceLabels, liveChoiceCounts]);

  const multipleChoiceTotal = useMemo(
    () => multipleChoiceCounts.reduce((sum, value) => sum + value, 0),
    [multipleChoiceCounts],
  );

  const multipleChoicePercents = useMemo(() => {
    if (multipleChoiceCounts.length === 0) {
      return [];
    }
    if (multipleChoiceTotal === 0) {
      return multipleChoiceCounts.map(() => 0);
    }
    return multipleChoiceCounts.map((value) => Math.round((value / multipleChoiceTotal) * 100));
  }, [multipleChoiceCounts, multipleChoiceTotal]);

  const scaleLabels = useMemo(() => {
    if (presentationSlide.type !== "scale") {
      return [];
    }
    return presentationSlide.choices && presentationSlide.choices.length > 0
      ? presentationSlide.choices
      : scaleOptions;
  }, [presentationSlide.choices, presentationSlide.type, scaleOptions]);

  const scaleCounts = useMemo(() => {
    if (presentationSlide.type !== "scale") {
      return [];
    }
    return normalizeChoiceCounts(scaleLabels, liveResults[presentationSlide.id]?.counts);
  }, [liveResults, presentationSlide.id, presentationSlide.type, scaleLabels]);

  const scalePercents = useMemo(() => {
    if (scaleCounts.length === 0) {
      return [];
    }
    const max = Math.max(1, ...scaleCounts);
    return scaleCounts.map((value) => Math.round((value / max) * 100));
  }, [scaleCounts]);

  const wordCloudTerms = useMemo(() => {
    if (presentationSlide.type !== "word-cloud") {
      return [];
    }
    const responses = liveResults[presentationSlide.id]?.responses ?? [];
    const terms = responses
      .flatMap((response) => response.split(/\s+/))
      .map((term) => term.trim())
      .filter(Boolean);
    return terms.slice(-14);
  }, [presentationSlide.id, presentationSlide.type, liveResults]);

  const openEndedResponses = useMemo(() => {
    if (presentationSlide.questionType !== "open-ended") {
      return [];
    }
    return liveResults[presentationSlide.id]?.responses ?? [];
  }, [presentationSlide.id, presentationSlide.questionType, liveResults]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 240,
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then((url: string) => {
        if (active) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (active) {
          setQrDataUrl(null);
        }
      });
    return () => {
      active = false;
    };
  }, [joinUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsBooting(false);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [aiPreview?.title, selectedPresentation?.id]);

  useEffect(() => {
    if (activeSlideIndex >= presentationSlides.length && presentationSlides.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [activeSlideIndex, presentationSlides.length]);

  useEffect(() => {
    if (activeTemplateType === "word-cloud") {
      setWordCloudQuestion(templatePrompt || "Your Text Bomb question here");
    }
  }, [activeTemplateType, templatePrompt]);

  const showInspector = Boolean(activeTemplateType);
  const activeDeckSlide = deckSlides[Math.min(activeSlideIndex, deckSlides.length - 1)];
  const editorScaleLabels =
    activeDeckSlide?.choices && activeDeckSlide.choices.length > 0
      ? activeDeckSlide.choices
      : scaleOptions;

  const updateActiveSlide = (updater: (slide: SlideDeckItem) => SlideDeckItem) => {
    setSlideDeck((prev) => {
      const baseDeck = prev.length > 0 ? prev : seededSlides;
      if (baseDeck.length === 0) {
        return baseDeck;
      }
      const nextDeck = [...baseDeck];
      const currentIndex = Math.min(activeSlideIndex, nextDeck.length - 1);
      nextDeck[currentIndex] = updater(nextDeck[currentIndex]);
      return nextDeck;
    });
    setIsDeckDirty(true);
  };

  const multipleChoiceOptions = ensureMultipleChoiceOptions(activeDeckSlide?.choices);

  const handleMultipleChoiceQuestionChange = (value: string) => {
    updateActiveSlide((slide) => ({
      ...slide,
      title: value,
      questionType: "multiple-choice",
      type: QUESTION_TYPE_TO_PRESENTATION_TYPE["multiple-choice"],
      interaction: questionTypeOptions["multiple-choice"].label,
      choices: ensureMultipleChoiceOptions(slide.choices),
      choiceCounts: normalizeChoiceCounts(
        ensureMultipleChoiceOptions(slide.choices),
        slide.choiceCounts,
      ),
    }));
  };

  const handleOpenEndedQuestionChange = (value: string) => {
    updateActiveSlide((slide) => ({
      ...slide,
      title: value,
      questionType: "open-ended",
      type: QUESTION_TYPE_TO_PRESENTATION_TYPE["open-ended"],
      interaction: questionTypeOptions["open-ended"].label,
    }));
  };

  const handleScaleQuestionChange = (value: string) => {
    updateActiveSlide((slide) => ({
      ...slide,
      title: value,
      questionType: "scales",
      type: QUESTION_TYPE_TO_PRESENTATION_TYPE["scales"],
      interaction: questionTypeOptions["scales"].label,
      choices: slide.choices && slide.choices.length > 0 ? slide.choices : [...scaleOptions],
      choiceCounts: normalizeChoiceCounts(
        slide.choices && slide.choices.length > 0 ? slide.choices : scaleOptions,
        slide.choiceCounts,
      ),
    }));
  };

  const handleMultipleChoiceOptionChange = (index: number, value: string) => {
    updateActiveSlide((slide) => {
      const options = ensureMultipleChoiceOptions(slide.choices);
      options[index] = value;
      return {
        ...slide,
        choices: options,
        choiceCounts: normalizeChoiceCounts(options, slide.choiceCounts),
      };
    });
  };

  const handleAddMultipleChoiceOption = () => {
    updateActiveSlide((slide) => {
      const options = ensureMultipleChoiceOptions(slide.choices);
      options.push(`Option ${options.length + 1}`);
      const counts = normalizeChoiceCounts(options, slide.choiceCounts);
      return {
        ...slide,
        choices: options,
        choiceCounts: counts,
      };
    });
  };

  const handleRemoveMultipleChoiceOption = (index: number) => {
    updateActiveSlide((slide) => {
      const options = ensureMultipleChoiceOptions(slide.choices);
      if (options.length <= 2) {
        return slide;
      }
      options.splice(index, 1);
      const counts = normalizeChoiceCounts(options, slide.choiceCounts);
      counts.splice(index, 1);
      const normalizedCounts = normalizeChoiceCounts(options, counts);
      return {
        ...slide,
        choices: options,
        choiceCounts: normalizedCounts,
      };
    });
  };

  /* ── Ranking item handlers ── */
  const handleRankingItemChange = (index: number, value: string) => {
    updateActiveSlide((slide) => {
      const items = [...(slide.choices ?? ["Item 1", "Item 2", "Item 3", "Item 4"])];
      items[index] = value;
      return { ...slide, choices: items };
    });
  };

  const handleAddRankingItem = () => {
    updateActiveSlide((slide) => {
      const items = [...(slide.choices ?? ["Item 1", "Item 2", "Item 3", "Item 4"])];
      items.push(`Item ${items.length + 1}`);
      return { ...slide, choices: items };
    });
  };

  const handleRemoveRankingItem = (index: number) => {
    updateActiveSlide((slide) => {
      const items = [...(slide.choices ?? [])];
      if (items.length <= 2) return slide;
      items.splice(index, 1);
      return { ...slide, choices: items };
    });
  };

  const handleReorderRankingItem = (index: number, direction: number) => {
    updateActiveSlide((slide) => {
      const items = [...(slide.choices ?? [])];
      const target = index + direction;
      if (target < 0 || target >= items.length) return slide;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...slide, choices: items };
    });
  };

  /* ── 100 Points item handlers ── */
  const handlePointsItemChange = (index: number, value: string) => {
    updateActiveSlide((slide) => {
      const items = [...(slide.choices ?? ["Option A", "Option B", "Option C"])];
      items[index] = value;
      return { ...slide, choices: items };
    });
  };

  const handleAddPointsItem = () => {
    updateActiveSlide((slide) => {
      const items = [...(slide.choices ?? [])];
      items.push(`Option ${items.length + 1}`);
      return { ...slide, choices: items };
    });
  };

  const handleRemovePointsItem = (index: number) => {
    updateActiveSlide((slide) => {
      const items = [...(slide.choices ?? [])];
      if (items.length <= 2) return slide;
      items.splice(index, 1);
      return { ...slide, choices: items };
    });
  };

  /* ── Guess the Number handlers ── */
  const handleCorrectNumberChange = (value: number) => {
    updateActiveSlide((slide) => ({ ...slide, correctNumber: value }));
  };

  const handleGuessRangeChange = (field: "guessMin" | "guessMax", value: number) => {
    updateActiveSlide((slide) => ({ ...slide, [field]: value }));
  };

  const handleMultipleChoiceVote = (index: number) => {
    if (!activeDeckSlide) {
      return;
    }
    if (activeDeckSlide.id) {
      recordChoiceResult(activeDeckSlide.id, ensureMultipleChoiceOptions(activeDeckSlide.choices), index);
    }
    updateActiveSlide((slide) => {
      const options = ensureMultipleChoiceOptions(slide.choices);
      const counts = normalizeChoiceCounts(options, slide.choiceCounts);
      counts[index] = (counts[index] ?? 0) + 1;
      return {
        ...slide,
        choices: options,
        choiceCounts: counts,
      };
    });
  };

  const syncActiveSlide = (index: number) => {
    const slide = deckSlides[index];
    if (!slide) {
      setQuestionLabel("");
      return;
    }
    setQuestionLabel(slide.label ?? "");
    if (!slide?.questionType) {
      return;
    }
    if (slide.questionType in questionTypeOptions) {
      setSelectedQuestionType(slide.questionType as keyof typeof questionTypeOptions);
      setLocalTemplateType(slide.questionType);
    }
    if (slide.questionType === "word-cloud") {
      setWordCloudQuestion(slide.title || "Your Text Bomb question here");
      setWordCloudInspectorView("wordcloud");
    } else {
      setWordCloudInspectorView("slide");
    }
  };

  const handleQuestionLabelChange = (value: string) => {
    setQuestionLabel(value);
    updateActiveSlide((slide) => ({
      ...slide,
      label: value,
    }));
  };

  const createSlideFromQuestionType = (type: keyof typeof questionTypeOptions): SlideDeckItem => {
    const config = questionTypeOptions[type];
    const title =
      type === "word-cloud" ? "Your Text Bomb question here" : config.previewTitle;
    const baseSlide: SlideDeckItem = {
      id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      objective: config.previewObjective,
      interaction: config.label,
      type: QUESTION_TYPE_TO_PRESENTATION_TYPE[type] ?? "text",
      questionType: type,
    };
    if (type === "multiple-choice" || type === "select-answer") {
      baseSlide.choices = [...DEFAULT_MULTIPLE_CHOICE_OPTIONS];
      baseSlide.choiceCounts = Array.from({ length: baseSlide.choices.length }, () => 0);
    }
    if (type === "scales" || type === "guess-number") {
      baseSlide.choices = [...scaleOptions];
      baseSlide.choiceCounts = Array.from({ length: baseSlide.choices.length }, () => 0);
    }
    if (type === "ranking") {
      baseSlide.choices = ["First Item", "Second Item", "Third Item", "Fourth Item"];
    }
    if (type === "points-100" || type === "hundred-points") {
      baseSlide.choices = ["Option A", "Option B", "Option C"];
    }
    if (type === "grid-2x2" || type === "two-by-two") {
      baseSlide.choices = ["Item 1", "Item 2", "Item 3"];
    }
    if (type === "image-choice") {
      baseSlide.choices = ["Image 1", "Image 2", "Image 3"];
    }
    return baseSlide;
  };

  const createContentSlide = (label: string): SlideDeckItem => ({
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: label,
    objective: "",
    interaction: label,
    type: "text",
    questionType: "open-ended",
  });

  const handleAddSlide = (slide: SlideDeckItem) => {
    const baseDeck = slideDeck.length > 0 ? slideDeck : seededSlides;
    const nextDeck = [...baseDeck, slide];
    setSlideDeck(nextDeck);
    setIsDeckDirty(true);
    setActiveSlideIndex(nextDeck.length - 1);
    if (slide.questionType && slide.questionType in questionTypeOptions) {
      setSelectedQuestionType(slide.questionType as keyof typeof questionTypeOptions);
      setLocalTemplateType(slide.questionType);
    }
    if (slide.questionType === "word-cloud") {
      setWordCloudQuestion(slide.title || "Your Text Bomb question here");
      setWordCloudInspectorView("wordcloud");
    } else {
      setWordCloudInspectorView("slide");
    }
  };

  const handleQuestionTypeSelect = (type: keyof typeof questionTypeOptions) => {
    setSelectedQuestionType(type);
    setLocalTemplateType(type);
    setIsQuestionTypeOpen(false);
    const config = questionTypeOptions[type];
    setSlideDeck((prev) => {
      const baseDeck = prev.length > 0 ? prev : seededSlides;
      if (baseDeck.length === 0) {
        return baseDeck;
      }
      const nextDeck = [...baseDeck];
      const current = nextDeck[Math.min(activeSlideIndex, nextDeck.length - 1)];
      const nextSlide: SlideDeckItem = {
        ...current,
        title: type === "word-cloud" ? wordCloudQuestion : config.previewTitle,
        objective: config.previewObjective,
        interaction: config.label,
        type: QUESTION_TYPE_TO_PRESENTATION_TYPE[type] ?? "text",
        questionType: type,
      };
      if (type === "multiple-choice") {
        const options = ensureMultipleChoiceOptions(current.choices);
        nextSlide.choices = options;
        nextSlide.choiceCounts = normalizeChoiceCounts(options, current.choiceCounts);
      }
      if (type === "scales") {
        const options = current.choices && current.choices.length > 0 ? current.choices : scaleOptions;
        nextSlide.choices = options;
        nextSlide.choiceCounts = normalizeChoiceCounts(options, current.choiceCounts);
      }
      nextDeck[Math.min(activeSlideIndex, nextDeck.length - 1)] = nextSlide;
      return nextDeck;
    });
    setIsDeckDirty(true);
    if (type === "word-cloud") {
      setWordCloudInspectorView("wordcloud");
    } else {
      setWordCloudInspectorView("slide");
    }
  };

  const handleWordCloudQuestionChange = (value: string) => {
    setWordCloudQuestion(value);
    setSlideDeck((prev) => {
      const baseDeck = prev.length > 0 ? prev : seededSlides;
      if (baseDeck.length === 0) {
        return baseDeck;
      }
      const nextDeck = [...baseDeck];
      const currentIndex = Math.min(activeSlideIndex, nextDeck.length - 1);
      const current = nextDeck[currentIndex];
      nextDeck[currentIndex] = {
        ...current,
        title: value,
        questionType: "word-cloud",
        type: QUESTION_TYPE_TO_PRESENTATION_TYPE["word-cloud"],
        interaction: questionTypeOptions["word-cloud"].label,
      };
      return nextDeck;
    });
    setIsDeckDirty(true);
  };

  const handleSelectSlide = (index: number) => {
    setActiveSlideIndex(index);
    syncActiveSlide(index);
  };

  const closeSlideMenu = () => {
    setSlideMenuOpenId(null);
  };

  const handleDuplicateSlideByIndex = (index: number) => {
    const baseDeck = slideDeck.length > 0 ? slideDeck : seededSlides;
    const source = baseDeck[index];
    if (!source) {
      return;
    }
    const duplicate: SlideDeckItem = {
      ...source,
      id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    const nextDeck = [...baseDeck];
    nextDeck.splice(index + 1, 0, duplicate);
    setSlideDeck(nextDeck);
    setIsDeckDirty(true);
    setActiveSlideIndex(index + 1);
    syncActiveSlide(index + 1);
  };

  const handleCopySlide = () => {
    pushToast("Copy to another presentation is ready for integration.", "default");
  };

  const handleAddComment = () => {
    pushToast("Commenting is ready for integration.", "default");
  };

  const handleToggleSkipSlide = (index: number) => {
    const baseDeck = slideDeck.length > 0 ? slideDeck : seededSlides;
    if (!baseDeck[index]) {
      return;
    }
    const nextDeck = [...baseDeck];
    nextDeck[index] = {
      ...nextDeck[index],
      skipped: !nextDeck[index].skipped,
    };
    setSlideDeck(nextDeck);
    setIsDeckDirty(true);
  };

  const handleDeleteSlide = (index: number) => {
    const baseDeck = slideDeck.length > 0 ? slideDeck : seededSlides;
    if (baseDeck.length <= 1) {
      pushToast("You need at least one slide in the deck.", "default");
      return;
    }
    const nextDeck = baseDeck.filter((_, slideIndex) => slideIndex !== index);
    setSlideDeck(nextDeck);
    setIsDeckDirty(true);
    const nextIndex = Math.min(activeSlideIndex, nextDeck.length - 1);
    setActiveSlideIndex(nextIndex);
    syncActiveSlide(nextIndex);
  };

  const requestDeleteSlide = (index: number) => {
    setPendingDeleteIndex(index);
  };

  const confirmDeleteSlide = () => {
    if (pendingDeleteIndex === null) {
      return;
    }
    handleDeleteSlide(pendingDeleteIndex);
    setPendingDeleteIndex(null);
  };

  const cancelDeleteSlide = () => {
    setPendingDeleteIndex(null);
  };

  const handleScratchSelect = (type: keyof typeof questionTypeOptions) => {
    if (scratchMenuMode === "add") {
      handleAddSlide(createSlideFromQuestionType(type));
    } else {
      setSelectedQuestionType(type);
      setLocalTemplateType(type);
      setIsDeckDirty(false);
      if (type === "word-cloud") {
        setWordCloudInspectorView("wordcloud");
      } else {
        setWordCloudInspectorView("slide");
      }
    }
    setIsScratchMenuOpen(false);
    setIsQuestionTypeOpen(false);
    setScratchMenuMode("start");
  };

  const handleScratchContentSelect = (label: string) => {
    handleAddSlide(createContentSlide(label));
    setIsScratchMenuOpen(false);
    setScratchMenuMode("start");
  };
  const qrOverlay = showQrCode ? (
    <>
      <div className="editor-qr-card is-visible">
        <div className="editor-qr-card__code" aria-hidden="true">
          {qrDataUrl ? (
            <img className="editor-qr-card__img" src={qrDataUrl} alt="" />
          ) : (
            <div className="editor-qr-card__matrix">
              {qrMatrix.map((row, rowIndex) =>
                row.map((cell, cellIndex) => (
                  <span
                    key={`${rowIndex}-${cellIndex}`}
                    className={cell ? "is-on" : undefined}
                  />
                )),
              )}
            </div>
          )}
        </div>
        <div className="editor-qr-card__meta">
          <span>{joinHost}</span>
          <strong>{joinCode}</strong>
        </div>
        <button type="button" className="editor-qr-card__button">
          Participant counter
        </button>
      </div>
      <div className="editor-qr-hint">
        <QrCode size={14} />
        QR code visible while presenting
      </div>
    </>
  ) : null;

  function handleStartFromScratch() {
    setScratchMenuMode("start");
    setIsScratchMenuOpen((current) => !current);
  }

  const handleExitPresentation = () => {
    setIsPresenting(false);
    setPresenterControlsVisible(true);
    setShowHotkeys(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
  };

  const handleStartPresentation = () => {
    setIsPresenting(true);
    setPresenterControlsVisible(true);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  };

  const handlePresentationPrev = () => {
    if (presentationSlides.length === 0) {
      return;
    }
    const nextIndex = Math.max(0, activeSlideIndex - 1);
    setActiveSlideIndex(nextIndex);
    syncActiveSlide(nextIndex);
  };

  const handlePresentationNext = () => {
    if (presentationSlides.length === 0) {
      return;
    }
    const nextIndex = Math.min(presentationSlides.length - 1, activeSlideIndex + 1);
    setActiveSlideIndex(nextIndex);
    syncActiveSlide(nextIndex);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  };

  const showPresentationControls = () => {
    setPresenterControlsVisible(true);
    if (presentationControlsTimeout.current) {
      window.clearTimeout(presentationControlsTimeout.current);
    }
    presentationControlsTimeout.current = window.setTimeout(() => {
      setPresenterControlsVisible(false);
    }, 2400);
  };

  const toggleJoinInstructions = () => {
    const shouldShow = !(showJoinBar || showQrCode);
    setShowJoinBar(shouldShow);
    setShowQrCode(shouldShow);
  };

  const handleClearResults = () => {
    setSlideDeck((prev) => {
      const baseDeck = prev.length > 0 ? prev : seededSlides;
      return baseDeck.map((slide) => {
        if (!slide.choices || slide.choices.length === 0) {
          return slide;
        }
        return {
          ...slide,
          choiceCounts: slide.choices.map(() => 0),
        };
      });
    });
    localStorage.removeItem(resultsStorageKey);
    setLiveResults({});
    pushToast("Results cleared.", "default");
    
    fetch(`/api/sync?code=${joinCode}&type=results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: {} }),
    }).catch(err => console.error("Failed to clear results", err));
  };

  const toggleVotingPause = () => {
    setIsVotingPaused((prev) => !prev);
    pushToast(isVotingPaused ? "Voting paused" : "Voting resumed", "default");
  };

  const handleDuplicateSlide = (slideId: string) => {
    const currentSlide = presentationSlides[activeSlideIndex];
    if (!currentSlide) return;

    const newSlide = {
      ...currentSlide,
      id: `${currentSlide.id}-copy-${Date.now()}`,
    };
    setSlideDeck((prev) => [...prev.slice(0, activeSlideIndex), newSlide, ...prev.slice(activeSlideIndex + 1)]);
    setActiveSlideIndex(activeSlideIndex + 1);
    pushToast("Slide duplicated", "default");
  };

  const handleReorderSlide = (fromIndex: number, toIndex: number): void => {
    setSlideDeck((prev) => {
      const newDeck = [...prev];
      const [movedItem] = newDeck.splice(fromIndex, 1);
      newDeck.splice(toIndex, 0, movedItem);
      return newDeck;
    });
    if (activeSlideIndex === fromIndex) {
      setActiveSlideIndex(toIndex);
    }
    pushToast("Slide reordered", "default");
  };

  useEffect(() => {
    if (!isPresenting) {
      return;
    }
    showPresentationControls();
    const handleMouseMove = () => {
      showPresentationControls();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(event.target.tagName)
      ) {
        return;
      }
      if (event.key === "Escape") {
        handleExitPresentation();
      }
      if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
        event.preventDefault();
        handlePresentationNext();
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        handlePresentationPrev();
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }
      if (event.key.toLowerCase() === "h") {
        event.preventDefault();
        setResponsesHidden((value) => !value);
      }
      if (event.key.toLowerCase() === "i") {
        event.preventDefault();
        toggleJoinInstructions();
      }
      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        toggleVotingPause();
      }
      if (event.key.toLowerCase() === "k" || event.key === "?") {
        event.preventDefault();
        setShowHotkeys((value) => !value);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKey);
      if (presentationControlsTimeout.current) {
        window.clearTimeout(presentationControlsTimeout.current);
      }
    };
  }, [isPresenting, presentationSlides.length, showJoinBar, showQrCode, isVotingPaused, toggleVotingPause]);

  if (isBooting) {
    return (
      <div className="editor-loader-screen">
        <FourDotLoader />
      </div>
    );
  }


  return (
    <div className="editor-page">
      {isTemplatesModalOpen ? (
        <div className="templates-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="templates-modal__scrim"
            onClick={() => setIsTemplatesModalOpen(false)}
            aria-label="Close templates"
          />
          <section className="templates-modal__panel">
            <header className="templates-modal__header">
              <div className="templates-modal__tabs">
                <button type="button" className="templates-modal__tab is-active">
                  INZPHIRE templates
                </button>
              </div>
              <button
                type="button"
                className="templates-modal__close"
                onClick={() => setIsTemplatesModalOpen(false)}
                aria-label="Close templates"
              >
                <X size={18} />
              </button>
            </header>

            <div className="templates-modal__body">
              <div className="templates-modal__filters">
                {templateFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={`templates-modal__filter${
                      activeTemplateFilter === filter.id ? " is-active" : ""
                    }`}
                    onClick={() => setActiveTemplateFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="templates-modal__filters templates-modal__filters--secondary">
                <button type="button" className="templates-modal__filter">
                  More categories
                </button>
              </div>

              <div className="templates-modal__grid">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className="template-card"
                    onClick={() => {
                      const created = createPresentationFromTemplate(template.id);
                      pushToast(`Template "${template.title}" added`, "success");
                      setIsTemplatesModalOpen(false);
                      navigate("/app/new", {
                        state: {
                          presentationId: created?.id,
                          title: template.title,
                        },
                      });
                    }}
                  >
                    <div
                      className="template-card__hero"
                      style={{ backgroundColor: template.accent }}
                    >
                      <div className="template-card__hero-content">
                        <p>{template.prompt}</p>
                      </div>
                      <div
                        className="template-card__glyph"
                        data-template={template.id}
                        aria-hidden="true"
                      />
                      <span className="template-card__preview">Preview</span>
                    </div>
                    <div className="template-card__body">
                      <strong>{template.title}</strong>
                      <span>{template.slides} slides</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <header className="editor-toolbar">
        <div className="editor-toolbar__left">
          <button
            type="button"
            className="editor-toolbar__back"
            onClick={() => navigate("/app/my-presentations")}
            aria-label="Back to My presentations"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="editor-toolbar__meta">
            <h1>
              {aiPreview?.title ??
                selectedTitle ??
                selectedPresentation?.title ??
                (templateType ? "New presentation" : "Untitled presentation")}
            </h1>
            <button type="button" onClick={() => navigate("/app/my-presentations")}>
              My presentations
            </button>
          </div>

          <span className="editor-toolbar__divider" />

          <button type="button" className="editor-toolbar__icon">
            <Settings2 size={18} />
          </button>
          <button type="button" className="editor-toolbar__icon">
            <Share2 size={18} />
          </button>
        </div>

        <div className="editor-toolbar__tabs">
          <button
            type="button"
            className={`editor-tab${createMode === "create" ? " is-active" : ""}`}
            onClick={() => setCreateMode("create")}
          >
            Create
          </button>
          <button
            type="button"
            className={`editor-tab${createMode === "results" ? " is-active" : ""}`}
            onClick={() => setCreateMode("results")}
          >
            Results
            <span>0</span>
          </button>
        </div>

        <div className="editor-toolbar__right">
          <div className="editor-toolbar__avatar">{user.initials}!</div>
          <button type="button" className="editor-toolbar__plus">
            <Plus size={20} />
          </button>
          <span className="editor-toolbar__divider" />
          <button type="button" className="editor-toolbar__icon editor-toolbar__icon--ghost">
            <Eye size={18} />
          </button>

          <div className="editor-toolbar__present">
            <button
              type="button"
              onClick={handleStartPresentation}
              disabled={presentationSlides.length === 0}
            >
              Start presentation
            </button>
            <button type="button" className="editor-toolbar__present-toggle">
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className={`editor-workspace${showInspector ? " editor-workspace--inspector" : ""}`}>
        {isScratchMenuOpen ? (
          <div className="scratch-menu" role="dialog" aria-label="Start from scratch">
            <button
              type="button"
              className="scratch-menu__close"
              aria-label="Close menu"
              onClick={() => setIsScratchMenuOpen(false)}
            >
              <X size={14} />
            </button>

            <section className="scratch-menu__section">
              <header className="scratch-menu__section-header">
                <span>Interactive questions</span>
                <CircleHelp size={16} />
              </header>
              <div className="scratch-menu__grid">
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("multiple-choice")}>
                  <ScratchMenuIcon
                    name="multiple-choice"
                    className="scratch-menu__icon scratch-menu__icon--blue"
                  />
                  <span className="scratch-menu__label">Multiple Choice</span>
                </button>
                <button
                  type="button"
                  className="scratch-menu__item is-highlight"
                  onClick={() => handleScratchSelect("word-cloud")}
                >
                  <ScratchMenuIcon
                    name="word-cloud"
                    className="scratch-menu__icon scratch-menu__icon--coral"
                  />
                  <span className="scratch-menu__label">Text Bomb</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("open-ended")}>
                  <ScratchMenuIcon
                    name="open-ended"
                    className="scratch-menu__icon scratch-menu__icon--rose"
                  />
                  <span className="scratch-menu__label">Open Ended</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("scales")}>
                  <ScratchMenuIcon
                    name="scales"
                    className="scratch-menu__icon scratch-menu__icon--violet"
                  />
                  <span className="scratch-menu__label">Scales</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("ranking")}>
                  <ScratchMenuIcon
                    name="ranking"
                    className="scratch-menu__icon scratch-menu__icon--green"
                  />
                  <span className="scratch-menu__label">Ranking</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("qna")}>
                  <ScratchMenuIcon
                    name="qna"
                    className="scratch-menu__icon scratch-menu__icon--rose"
                  />
                  <span className="scratch-menu__label">Q&amp;A</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("guess-number")}>
                  <ScratchMenuIcon
                    name="guess-number"
                    className="scratch-menu__icon scratch-menu__icon--amber"
                  />
                  <span className="scratch-menu__label">Guess the Number</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("points-100")}>
                  <ScratchMenuIcon
                    name="points-100"
                    className="scratch-menu__icon scratch-menu__icon--blue"
                  />
                  <span className="scratch-menu__label">100 Points</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("grid-2x2")}>
                  <ScratchMenuIcon
                    name="grid-2x2"
                    className="scratch-menu__icon scratch-menu__icon--salmon"
                  />
                  <span className="scratch-menu__label">2 x 2 Grid</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("open-ended")}>
                  <ScratchMenuIcon
                    name="quick-form"
                    className="scratch-menu__icon scratch-menu__icon--gold"
                  />
                  <span className="scratch-menu__label">Quick Form</span>
                  <span className="scratch-menu__badge">
                    <Star size={10} />
                  </span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("pin-image")}>
                  <ScratchMenuIcon
                    name="pin-image"
                    className="scratch-menu__icon scratch-menu__icon--purple"
                  />
                  <span className="scratch-menu__label">Pin on Image</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("image-choice")}>
                  <ScratchMenuIcon
                    name="image-choice"
                    className="scratch-menu__icon scratch-menu__icon--blue"
                  />
                  <span className="scratch-menu__label">Image Choice</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("hundred-points")}>
                  <ScratchMenuIcon
                    name="points-100"
                    className="scratch-menu__icon scratch-menu__icon--blue"
                  />
                  <span className="scratch-menu__label">100 Points</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("two-by-two")}>
                  <ScratchMenuIcon
                    name="grid-2x2"
                    className="scratch-menu__icon scratch-menu__icon--salmon"
                  />
                  <span className="scratch-menu__label">2 x 2 Grid</span>
                </button>
              </div>
            </section>

            <section className="scratch-menu__section">
              <header className="scratch-menu__section-header">
                <span>Quiz competitions</span>
                <CircleHelp size={16} />
              </header>
              <div className="scratch-menu__grid scratch-menu__grid--compact">
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("select-answer")}>
                  <ScratchMenuIcon
                    name="select-answer"
                    className="scratch-menu__icon scratch-menu__icon--blue"
                  />
                  <span className="scratch-menu__label">Select Answer</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("type-answer")}>
                  <ScratchMenuIcon
                    name="type-answer"
                    className="scratch-menu__icon scratch-menu__icon--green"
                  />
                  <span className="scratch-menu__label">Type Answer</span>
                </button>
              </div>
            </section>

            <section className="scratch-menu__section">
              <header className="scratch-menu__section-header">
                <span>Audience interaction</span>
                <CircleHelp size={16} />
              </header>
              <div className="scratch-menu__grid scratch-menu__grid--compact">
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("reactions")}>
                  <ScratchMenuIcon name="reactions" className="scratch-menu__icon scratch-menu__icon--purple" />
                  <span className="scratch-menu__label">Reactions</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("quick-form")}>
                  <ScratchMenuIcon name="quick-form" className="scratch-menu__icon scratch-menu__icon--gold" />
                  <span className="scratch-menu__label">Quick Form</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("comments")}>
                  <ScratchMenuIcon name="comments" className="scratch-menu__icon scratch-menu__icon--blue" />
                  <span className="scratch-menu__label">Comments</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("gather-names")}>
                  <ScratchMenuIcon name="gather-names" className="scratch-menu__icon scratch-menu__icon--blue" />
                  <span className="scratch-menu__label">Gather Names</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("timer")}>
                  <ScratchMenuIcon name="timer" className="scratch-menu__icon scratch-menu__icon--amber" />
                  <span className="scratch-menu__label">Timer</span>
                </button>
                <button type="button" className="scratch-menu__item" onClick={() => handleScratchSelect("leaderboard")}>
                  <ScratchMenuIcon name="leaderboard" className="scratch-menu__icon scratch-menu__icon--gold" />
                  <span className="scratch-menu__label">Leaderboard</span>
                </button>
              </div>
            </section>

            <section className="scratch-menu__section">
              <header className="scratch-menu__section-header">
                <span>Content slides</span>
                <CircleHelp size={16} />
              </header>
              <div className="scratch-menu__grid scratch-menu__grid--compact">
                <button
                  type="button"
                  className="scratch-menu__item"
                  onClick={() => handleScratchContentSelect("Text slide")}
                >
                  <ScratchMenuIcon
                    name="text"
                    className="scratch-menu__icon scratch-menu__icon--blue"
                  />
                  <span className="scratch-menu__label">Text</span>
                </button>
                <button
                  type="button"
                  className="scratch-menu__item"
                  onClick={() => handleScratchContentSelect("Image slide")}
                >
                  <ScratchMenuIcon
                    name="image"
                    className="scratch-menu__icon scratch-menu__icon--blue"
                  />
                  <span className="scratch-menu__label">Image</span>
                </button>
                <button
                  type="button"
                  className="scratch-menu__item"
                  onClick={() => handleScratchContentSelect("Video slide")}
                >
                  <ScratchMenuIcon
                    name="video"
                    className="scratch-menu__icon scratch-menu__icon--purple"
                  />
                  <span className="scratch-menu__label">Video</span>
                </button>
                <button
                  type="button"
                  className="scratch-menu__item"
                  onClick={() => handleScratchContentSelect("Instructions")}
                >
                  <ScratchMenuIcon
                    name="instructions"
                    className="scratch-menu__icon scratch-menu__icon--slate"
                  />
                  <span className="scratch-menu__label">Instructions</span>
                </button>
              </div>
            </section>

            <section className="scratch-menu__section scratch-menu__section--integrations">
              <header className="scratch-menu__section-header">
                <span>Integrations</span>
                <CircleHelp size={16} />
              </header>
              <div className="scratch-menu__grid scratch-menu__grid--compact">
                <button type="button" className="scratch-menu__item scratch-menu__item--brand">
                  <span className="scratch-menu__brand scratch-menu__brand--google">G</span>
                  <span className="scratch-menu__label">Google Slides</span>
                  <span className="scratch-menu__badge">
                    <Star size={10} />
                  </span>
                </button>
                <button type="button" className="scratch-menu__item scratch-menu__item--brand">
                  <span className="scratch-menu__brand scratch-menu__brand--ppt">P</span>
                  <span className="scratch-menu__label">Powerpoint</span>
                  <span className="scratch-menu__badge">
                    <Star size={10} />
                  </span>
                </button>
              </div>
              <button type="button" className="scratch-menu__import">
                <Download size={16} />
                Import slides
                <span className="scratch-menu__badge">
                  <Star size={10} />
                </span>
              </button>
            </section>
          </div>
        ) : null}

        <aside className="editor-slides">
          <button
            type="button"
            className="editor-slides__new"
            onClick={() => {
              setScratchMenuMode("add");
              setIsScratchMenuOpen(true);
            }}
          >
            <Plus size={18} />
            New slide
          </button>

          <div className="editor-slides__list">
            {deckSlides.map((slide, index) => (
              <div key={slide.id} className="editor-slide">
                <span className="editor-slide__number">{index + 1}</span>
                <div className="editor-slide__thumb-wrap">
                  <button
                    type="button"
                    className={`editor-slide__thumb${index === activeSlideIndex ? " is-active" : ""}${
                      slide.skipped ? " is-skipped" : ""
                    }`}
                    onClick={() => {
                      handleSelectSlide(index);
                      if (slideMenuOpenId) {
                        closeSlideMenu();
                      }
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSlideMenuOpenId((current) => (current === slide.id ? null : slide.id));
                    }}
                  >
                    <span className="editor-slide__title">
                      {slide.title.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="editor-slide__badge">{user.initials}!</span>
                  </button>
                  <div className="editor-slide__menu">
                    {slideMenuOpenId === slide.id ? (
                      <div
                        className="editor-slide__menu-popover"
                        role="menu"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="editor-slide__menu-item"
                          onClick={() => {
                            closeSlideMenu();
                            setScratchMenuMode("add");
                            setIsScratchMenuOpen(true);
                          }}
                        >
                          <Plus size={16} />
                          New slide
                        </button>
                        <button
                          type="button"
                          className="editor-slide__menu-item"
                          onClick={() => {
                            closeSlideMenu();
                            handleAddComment();
                          }}
                        >
                          <MessageSquareText size={16} />
                          Add comment
                        </button>
                        <div className="editor-slide__menu-divider" />
                        <button
                          type="button"
                          className="editor-slide__menu-item"
                          onClick={() => {
                            closeSlideMenu();
                            handleDuplicateSlideByIndex(index);
                          }}
                        >
                          <CopyPlus size={16} />
                          Duplicate slide
                        </button>
                        <button
                          type="button"
                          className="editor-slide__menu-item"
                          onClick={() => {
                            closeSlideMenu();
                            handleCopySlide();
                          }}
                        >
                          <Copy size={16} />
                          Copy to another presentation
                        </button>
                        <button
                          type="button"
                          className="editor-slide__menu-item"
                          onClick={() => {
                            closeSlideMenu();
                            handleToggleSkipSlide(index);
                          }}
                        >
                          <EyeOff size={16} />
                          {slide.skipped ? "Unskip slide" : "Skip slide"}
                        </button>
                        <div className="editor-slide__menu-divider" />
                        <button
                          type="button"
                          className="editor-slide__menu-item editor-slide__menu-item--danger"
                          onClick={() => {
                            closeSlideMenu();
                            requestDeleteSlide(index);
                          }}
                        >
                          <Trash2 size={16} />
                          Delete slide
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="editor-canvas">
          <div className="editor-canvas__surface" style={themeStyle}>
            {aiPreview || selectedPresentation || activeTemplateType ? (
              selectedQuestionType === "word-cloud" ? (
                <div className="editor-wordcloud-slide">
                  {showJoinBar ? (
                    <div className="editor-join-bar">
                      <span>Join at {joinHost} | use code</span>
                      <strong>{joinCode}</strong>
                    </div>
                  ) : null}
                  <div className="editor-join-brand">
                    <LogoMark />
                  </div>
                  <div
                    className="editor-wordcloud__question"
                    onClick={() => {
                      setInspectorTab("slide");
                      setWordCloudInspectorView("question");
                    }}
                  >
                    {questionLabel ? (
                      <span className="editor-wordcloud__label">{questionLabel}</span>
                    ) : null}
                    <input
                      value={wordCloudQuestion}
                      onChange={(event) => handleWordCloudQuestionChange(event.target.value)}
                      onFocus={() => {
                        setInspectorTab("slide");
                        setWordCloudInspectorView("question");
                      }}
                      aria-label="Text bomb question"
                    />
                  </div>
                  <div
                    className="editor-wordcloud__cloud"
                    onClick={() => {
                      setInspectorTab("slide");
                      setWordCloudInspectorView("wordcloud");
                    }}
                  >
                    <span className="wc-word wc-word--creative">creative</span>
                    <span className="wc-word wc-word--leader">leader</span>
                    <span className="wc-word wc-word--focus">focus</span>
                    <span className="wc-word wc-word--bold">bold</span>
                    <span className="wc-word wc-word--fast">fast</span>
                    <span className="wc-word wc-word--inspiration">inspiration</span>
                    <span className="wc-word wc-word--transpiration">transpiration</span>
                  </div>
                  {qrOverlay}
                </div>
              ) : selectedQuestionType === "multiple-choice" ? (
                <div className="editor-mc-slide">
                  {showJoinBar ? (
                    <div className="editor-join-bar">
                      <span>Join at {joinHost} | use code</span>
                      <strong>{joinCode}</strong>
                    </div>
                  ) : null}
                  <div className="editor-join-brand">
                    <LogoMark />
                  </div>
                  <div
                    className="editor-mc__question"
                    onClick={() => {
                      setInspectorTab("slide");
                      setWordCloudInspectorView("question");
                    }}
                  >
                    {questionLabel ? (
                      <span className="editor-mc__label">{questionLabel}</span>
                    ) : null}
                    <input
                      value={activeDeckSlide?.title ?? activeQuestionConfig.previewTitle}
                      onChange={(event) => handleMultipleChoiceQuestionChange(event.target.value)}
                      onFocus={() => {
                        setInspectorTab("slide");
                        setWordCloudInspectorView("question");
                      }}
                      aria-label="Multiple choice question"
                    />
                  </div>
                  <div className="editor-mc__options">
                    {multipleChoiceOptions.map((option, index) => (
                      <div key={`${activeDeckSlide?.id ?? "mc"}-${index}`} className="editor-mc__option">
                        <span className="editor-mc__bullet" aria-hidden="true" />
                        <input
                          value={option}
                          onChange={(event) => handleMultipleChoiceOptionChange(index, event.target.value)}
                          aria-label={`Option ${index + 1}`}
                        />
                        {multipleChoiceOptions.length > 2 ? (
                          <button
                            type="button"
                            className="editor-mc__option-remove"
                            onClick={() => handleRemoveMultipleChoiceOption(index)}
                            aria-label={`Remove option ${index + 1}`}
                          >
                            <X size={14} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="editor-mc__add"
                      onClick={handleAddMultipleChoiceOption}
                    >
                      + Add option
                    </button>
                  </div>
                  {qrOverlay}
                </div>
              ) : selectedQuestionType === "scales" ? (
                <div className="editor-scale-slide">
                  {showJoinBar ? (
                    <div className="editor-join-bar">
                      <span>Join at {joinHost} | use code</span>
                      <strong>{joinCode}</strong>
                    </div>
                  ) : null}
                  <div className="editor-join-brand">
                    <LogoMark />
                  </div>
                  <div
                    className="editor-scale__question"
                    onClick={() => {
                      setInspectorTab("slide");
                      setWordCloudInspectorView("question");
                    }}
                  >
                    {questionLabel ? (
                      <span className="editor-scale__label">{questionLabel}</span>
                    ) : null}
                    <input
                      value={activeDeckSlide?.title ?? activeQuestionConfig.previewTitle}
                      onChange={(event) => handleScaleQuestionChange(event.target.value)}
                      onFocus={() => {
                        setInspectorTab("slide");
                        setWordCloudInspectorView("question");
                      }}
                      aria-label="Scale question"
                    />
                  </div>
                  <div
                    className="editor-scale__track"
                    onClick={() => {
                      setInspectorTab("slide");
                      setWordCloudInspectorView("slide");
                    }}
                  >
                    <div className="editor-scale__line" />
                    <div className="editor-scale__ticks">
                      {editorScaleLabels.map((label) => (
                        <span key={label} className="editor-scale__tick">
                          {label}
                        </span>
                      ))}
                    </div>
                    {editorScaleLabels.length > 1 ? (
                      <div
                        className="editor-scale__indicator"
                        style={{
                          left: `${(Math.min(7, editorScaleLabels.length - 1) /
                            Math.max(1, editorScaleLabels.length - 1)) * 100}%`,
                        }}
                      >
                        <span />
                        <strong>{editorScaleLabels[Math.min(7, editorScaleLabels.length - 1)]}</strong>
                      </div>
                    ) : null}
                  </div>
                  {qrOverlay}
                </div>
              ) : selectedQuestionType === "open-ended" ? (
                <div className="editor-open-slide">
                  {showJoinBar ? (
                    <div className="editor-join-bar">
                      <span>Join at {joinHost} | use code</span>
                      <strong>{joinCode}</strong>
                    </div>
                  ) : null}
                  <div className="editor-join-brand">
                    <LogoMark />
                  </div>
                  <div
                    className="editor-open__question"
                    onClick={() => {
                      setInspectorTab("slide");
                      setWordCloudInspectorView("question");
                    }}
                  >
                    {questionLabel ? (
                      <span className="editor-open__label">{questionLabel}</span>
                    ) : null}
                    <input
                      value={activeDeckSlide?.title ?? activeQuestionConfig.previewTitle}
                      onChange={(event) => handleOpenEndedQuestionChange(event.target.value)}
                      onFocus={() => {
                        setInspectorTab("slide");
                        setWordCloudInspectorView("question");
                      }}
                      aria-label="Open ended question"
                    />
                  </div>
                  <div
                    className="editor-open__response"
                    onClick={() => {
                      setInspectorTab("slide");
                      setWordCloudInspectorView("slide");
                    }}
                  >
                    <div className="editor-open__prompt">
                      Let your audience respond in full sentences.
                    </div>
                    <div className="editor-open__box">
                      <span>Type your response here...</span>
                    </div>
                  </div>
                  {qrOverlay}
                </div>
              ) : (() => {
                const slideTitle = activeDeckSlide?.title ?? activeQuestionConfig.previewTitle;
                const slideObj = activeDeckSlide?.objective ?? activeQuestionConfig.previewObjective;
                const slideChoices: string[] = activeDeckSlide?.choices ?? [];
                const joinBarEl = showJoinBar ? (<div className="editor-join-bar"><span>Join at {joinHost} | use code</span><strong>{joinCode}</strong></div>) : null;
                const brandEl = <div className="editor-join-brand"><LogoMark /></div>;
                const footerEl = (<footer className="editor-generated-slide__footer"><span>{aiPreview?.title ?? selectedPresentation?.title ?? "Presentation"}</span><strong>{activeSlideIndex + 1}/{deckSlides.length}</strong></footer>);
                const rankingColors = ["#6366f1", "#ec4899", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

                if (selectedQuestionType === "ranking") {
                  const items = slideChoices.length > 0 ? slideChoices : ["Item 1", "Item 2", "Item 3", "Item 4"];
                  return (
                    <article className="editor-generated-slide" style={{ alignContent: "start", paddingTop: 48 }}>{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Ranking question" style={{ fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em" }} />
                      </div>
                      <div style={{ width: "100%", maxWidth: 580, display: "flex", flexDirection: "column", gap: 0, margin: "0 auto", textAlign: "left" }}>
                        {items.map((c, i) => (
                          <div key={i} style={{ position: "relative", padding: "10px 0 14px", borderBottom: i < items.length - 1 ? "1px solid #eeeaf8" : "none" }}>
                            <input
                              value={c}
                              onChange={(e) => handleRankingItemChange(i, e.target.value)}
                              placeholder={`Item ${i + 1}`}
                              aria-label={`Ranking item ${i + 1}`}
                              style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 15, fontWeight: 500, color: "#1f1f1f", padding: "4px 0", fontFamily: "inherit" }}
                            />
                            <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#f1f0ed", overflow: "hidden", marginTop: 4 }}>
                              <div style={{ width: `${Math.max(10, 80 - i * 15)}%`, height: "100%", borderRadius: 2, background: rankingColors[i % rankingColors.length], transition: "width 500ms ease" }} />
                            </div>
                            {/* Action buttons on hover - reorder + delete */}
                            <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4, opacity: 0.5 }}>
                              {i > 0 && <button type="button" onClick={() => handleReorderRankingItem(i, -1)} style={{ width: 24, height: 24, border: "1px solid #e5e5e1", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#666" }}>↑</button>}
                              {i < items.length - 1 && <button type="button" onClick={() => handleReorderRankingItem(i, 1)} style={{ width: 24, height: 24, border: "1px solid #e5e5e1", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#666" }}>↓</button>}
                              {items.length > 2 && <button type="button" onClick={() => handleRemoveRankingItem(i)} style={{ width: 24, height: 24, border: "1px solid #e5e5e1", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#c44949" }}>✕</button>}
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddRankingItem} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "#6366f1", border: "none", color: "#fff", fontSize: 18, margin: "12px 0 0", cursor: "pointer", lineHeight: 1 }}>+</button>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "qna") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Q&A question" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 540, margin: "8px auto 0", padding: "40px 32px", border: "1px solid #e5e5e1", borderRadius: 16, background: "#fafaf9", textAlign: "center" }}>
                        <h3 style={{ fontSize: 22, fontWeight: 600, color: "#1f1f1f", margin: "0 0 10px" }}>No questions from the audience!</h3>
                        <p style={{ fontSize: 15, color: "#7b7b78", margin: 0, lineHeight: 1.5 }}>Incoming questions will show up here so that you can answer them one by one.</p>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "guess-number") {
                  const gnCorrect = activeDeckSlide?.correctNumber ?? 7;
                  const gnMin = activeDeckSlide?.guessMin ?? 0;
                  const gnMax = activeDeckSlide?.guessMax ?? 100;
                  const gnRange = gnMax - gnMin || 1;
                  const gnPct = ((gnCorrect - gnMin) / gnRange) * 100;
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Guess question" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 520, margin: "8px auto 0", textAlign: "center" }}>
                        {/* Bell curve SVG */}
                        <svg viewBox="0 0 400 140" style={{ width: "100%", height: 140 }}>
                          <defs><linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e2e1f8" stopOpacity="0.6"/><stop offset="100%" stopColor="#e2e1f8" stopOpacity="0.1"/></linearGradient></defs>
                          <path d="M0,130 C30,130 60,128 100,120 C140,108 160,80 180,40 C190,20 200,10 200,10 C200,10 210,20 220,40 C240,80 260,108 300,120 C340,128 370,130 400,130 Z" fill="url(#bellGrad)" stroke="#c8c6e8" strokeWidth="1.5"/>
                        </svg>
                        {/* Number indicator */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 12, background: "#e8e7ef", margin: "-20px 0 12px" }}>
                          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#c8f3d2", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>✓</span>
                          <strong style={{ fontSize: 18 }}>{gnCorrect}</strong>
                        </div>
                        {/* Scale line */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                          <span style={{ fontSize: 13, color: "#7b7b78" }}>{gnMin}</span>
                          <div style={{ flex: 1, height: 2, margin: "0 12px", background: "#e5e5e1", position: "relative" }}>
                            <div style={{ position: "absolute", left: `${Math.max(2, Math.min(98, gnPct))}%`, top: "50%", transform: "translate(-50%, -50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "8px solid #6366f1" }} />
                          </div>
                          <span style={{ fontSize: 13, color: "#7b7b78" }}>{gnMax}</span>
                        </div>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "points-100" || selectedQuestionType === "hundred-points") {
                  const bars = slideChoices.length > 0 ? slideChoices : ["Item 1", "Item 2", "Item 3"];
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="100 points question" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 520, margin: "8px auto 0", display: "flex", flexDirection: "column", gap: 0, textAlign: "left" }}>
                        {bars.map((b, i) => (
                          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #eeeaf8" }}>
                            <div style={{ fontSize: 15, fontWeight: 500, color: "#1f1f1f", marginBottom: 6 }}>{b}</div>
                            <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#f1f0ed", overflow: "hidden" }}>
                              <div style={{ width: `${60 - i * 18}%`, height: "100%", borderRadius: 2, background: rankingColors[i % rankingColors.length] }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "grid-2x2" || selectedQuestionType === "two-by-two") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Grid question" />
                      </div>
                      <div style={{ position: "relative", width: 320, height: 240, margin: "8px auto 0", border: "1px solid #e5e5e1", borderRadius: 12, background: "#fafaf9" }}>
                        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#e5e5e1" }} />
                        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#e5e5e1" }} />
                        <div style={{ position: "absolute", left: "30%", top: "25%", width: 12, height: 12, borderRadius: "50%", background: "#6366f1", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                        <div style={{ position: "absolute", left: "65%", top: "60%", width: 12, height: 12, borderRadius: "50%", background: "#ec4899", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                        <div style={{ position: "absolute", left: "45%", top: "70%", width: 12, height: 12, borderRadius: "50%", background: "#10b981", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "pin-image") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Pin question" />
                      </div>
                      <div style={{ position: "relative", width: "100%", maxWidth: 500, height: 240, margin: "8px auto 0", borderRadius: 12, background: "#f5f5f3", border: "1px solid #e5e5e1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14, color: "#8a8a86" }}>📍 Drop an image here or upload one</span>
                        <div style={{ position: "absolute", left: "35%", top: "40%", transform: "translate(-50%, -100%)" }}>
                          <svg width="20" height="28" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#ef4444"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>
                        </div>
                        <div style={{ position: "absolute", left: "62%", top: "55%", transform: "translate(-50%, -100%)" }}>
                          <svg width="20" height="28" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#3b82f6"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>
                        </div>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "select-answer") {
                  const opts = slideChoices.length > 0 ? slideChoices : ["Option 1", "Option 2", "Option 3", "Option 4"];
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Quiz question" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 520, margin: "8px auto 0", display: "flex", flexDirection: "column", gap: 8 }}>
                        {opts.map((o, i) => {
                          const isCorrect = activeDeckSlide?.correctAnswerIndex === i;
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: isCorrect ? "2px solid #34d399" : "1px solid #e5e5e1", background: isCorrect ? "#f0fdf9" : "#fff" }}>
                              <span style={{ width: 28, height: 28, borderRadius: "50%", background: isCorrect ? "#34d399" : "#f1f0ed", color: isCorrect ? "#fff" : "#4b4b4b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#1f1f1f" }}>{o}</span>
                              {isCorrect && <span style={{ fontSize: 16, color: "#34d399" }}>✓</span>}
                            </div>
                          );
                        })}
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "type-answer") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Type answer question" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 420, margin: "12px auto 0" }}>
                        <div style={{ padding: "16px 20px", borderRadius: 14, border: "1px solid #e5e5e1", background: "#fafaf9", textAlign: "center" }}>
                          <span style={{ fontSize: 15, color: "#b0b0ab" }}>Type your answer...</span>
                        </div>
                        {(activeDeckSlide?.correctAnswers ?? []).length > 0 && (
                          <div style={{ marginTop: 12, fontSize: 14, color: "#10b981", textAlign: "center", fontWeight: 600 }}>✓ Accepted: {(activeDeckSlide?.correctAnswers ?? []).join(", ")}</div>
                        )}
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "image-choice") {
                  const imgs = slideChoices.length > 0 ? slideChoices : ["Image 1", "Image 2", "Image 3"];
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Image choice question" />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(imgs.length, 3)}, 1fr)`, gap: 12, maxWidth: 520, margin: "8px auto 0" }}>
                        {imgs.map((img, i) => (
                          <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e5e1", background: "#fff" }}>
                            <div style={{ paddingBottom: "70%", background: `${rankingColors[i % rankingColors.length]}12`, display: "flex", alignItems: "center", justifyContent: "center" }} />
                            <div style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: "#1f1f1f", textAlign: "center" }}>{img}</div>
                          </div>
                        ))}
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "reactions") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Reactions question" />
                      </div>
                      <div style={{ display: "flex", gap: 28, justifyContent: "center", margin: "20px auto 0" }}>
                        {["😍","👏","🎉","🤔","👎"].map((e) => (
                          <div key={e} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 40 }}>{e}</span>
                            <span style={{ fontSize: 14, color: "#8a8a86", fontWeight: 600 }}>0</span>
                          </div>
                        ))}
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "quick-form") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Form title" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 420, margin: "8px auto 0", display: "flex", flexDirection: "column", gap: 10 }}>
                        {["Email", "Name", "Phone"].map((field) => (
                          <div key={field} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e5e1", background: "#fafaf9" }}>
                            <span style={{ fontSize: 14, color: "#b0b0ab" }}>{field}</span>
                          </div>
                        ))}
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "comments") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Comments title" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 480, margin: "8px auto 0", padding: "32px 24px", border: "1px solid #e5e5e1", borderRadius: 16, background: "#fafaf9", textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: "#1f1f1f", margin: "0 0 8px" }}>No comments yet</p>
                        <p style={{ fontSize: 14, color: "#7b7b78", margin: 0 }}>Comments from the audience will appear here in real time.</p>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "gather-names") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Your question</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Ask your question here..." aria-label="Gather names title" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 480, margin: "8px auto 0", padding: "32px 24px", border: "1px solid #e5e5e1", borderRadius: 16, background: "#fafaf9", textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: "#1f1f1f", margin: "0 0 8px" }}>Waiting for participants</p>
                        <p style={{ fontSize: 14, color: "#7b7b78", margin: 0 }}>Names will appear here as participants join.</p>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "timer") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-generated-slide__eyebrow">{activeQuestionConfig.label}</div>
                      <div style={{ textAlign: "center", margin: "12px auto 0" }}>
                        <div style={{ fontSize: 72, fontWeight: 700, color: "#1f1f1f", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>1:00</div>
                        <div style={{ width: 240, height: 6, borderRadius: 3, background: "#e5e5e1", margin: "16px auto 0", overflow: "hidden" }}>
                          <div style={{ width: "100%", height: "100%", borderRadius: 3, background: "#6366f1" }} />
                        </div>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "leaderboard") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-generated-slide__eyebrow">{activeQuestionConfig.label}</div>
                      <div style={{ textAlign: "center", margin: "0 auto" }}>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
                        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#1f1f1f", marginBottom: 20 }}>{slideTitle}</h2>
                      </div>
                      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
                        {["1st Place", "2nd Place", "3rd Place"].map((p, i) => {
                          const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 12, border: "1px solid #e5e5e1", background: "#fff" }}>
                              <span style={{ width: 28, height: 28, borderRadius: "50%", background: medalColors[i], color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ fontSize: 15, fontWeight: 500, color: "#4b4b4b" }}>{p}</span>
                            </div>
                          );
                        })}
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                if (selectedQuestionType === "instructions" || selectedQuestionType === "content") {
                  return (
                    <article className="editor-generated-slide">{joinBarEl}{brandEl}
                      <div className="editor-wordcloud__question" onClick={() => { setInspectorTab("slide"); setWordCloudInspectorView("question"); }}>
                        <span className="editor-wordcloud__label">Title</span>
                        <input value={slideTitle} onChange={(e) => handleWordCloudQuestionChange(e.target.value)} placeholder="Your heading here..." aria-label="Content title" />
                      </div>
                      <div style={{ width: "100%", maxWidth: 500, margin: "0 auto", padding: "24px", border: "1px solid #e5e5e1", borderRadius: 14, background: "#fafaf9", textAlign: "center" }}>
                        <p style={{ color: "#7b7b78", fontSize: 15, margin: 0, lineHeight: 1.6 }}>{slideObj || "Add your content here. Participants will see this on the big screen."}</p>
                      </div>
                      {footerEl}{qrOverlay}
                    </article>
                  );
                }

                // Default fallback
                return (
                  <article className="editor-generated-slide">{joinBarEl}{brandEl}
                    <div className="editor-generated-slide__eyebrow">{activeQuestionConfig.label}</div>
                    <h2>{slideTitle}</h2>
                    <p>{slideObj}</p>
                    {footerEl}{qrOverlay}
                  </article>
                );
              })()
            ) : (
              <div className="editor-create">
                <div className="editor-create__eyebrow">
                  <Sparkles size={14} />
                  Start with AI
                </div>
                <h2>What would you like to create?</h2>

                <div className="editor-create__composer">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type your message here..."
                  />
                  <button type="button" aria-label="Send prompt" disabled={message.trim().length === 0}>
                    <SendHorizontal size={16} />
                  </button>
                </div>

                <div className="editor-create__actions">
                  <button
                    type="button"
                    className="editor-create__button"
                    onClick={handleStartFromScratch}
                    aria-expanded={isScratchMenuOpen}
                  >
                    <FilePenLine size={18} />
                    Start from scratch
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {showInspector ? (
          <aside className="editor-inspector">
            {inspectorTab === "themes" ? (
              <>
                <header className="editor-inspector__header editor-inspector__header--themes">
                  <h3>Themes</h3>
                  <button
                    type="button"
                    className="editor-inspector__close"
                    onClick={() => setInspectorTab("slide")}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </header>

                <div className="editor-theme">
                  <div className="editor-theme__row">
                    <span>My themes</span>
                    <button type="button" className="editor-theme__create">
                      <Plus size={14} />
                      Create
                    </button>
                  </div>
                  <div className="editor-theme__divider" />
                  <div className="editor-theme__title">Default themes</div>
                  <div className="editor-theme__grid">
                    {themePresets.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        className={`editor-theme__card${activeThemeId === theme.id ? " is-active" : ""}`}
                        onClick={() => setActiveThemeId(theme.id)}
                      >
                        <div
                          className="editor-theme__preview"
                          style={{ background: theme.previewBg }}
                        >
                          <div className="editor-theme__bars">
                            {theme.bars.map((color, index) => (
                              <span
                                key={`${theme.id}-bar-${index}`}
                                style={{ backgroundColor: color, height: `${28 + index * 6}px` }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="editor-theme__name">{theme.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : showWordCloudPanel ? (
              <>
                <header className="editor-inspector__header editor-inspector__header--wordcloud">
                  <button
                    type="button"
                    className="editor-inspector__back"
                    onClick={() => setWordCloudInspectorView("slide")}
                    aria-label="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h3>Text Bomb</h3>
                  <button
                    type="button"
                    className="editor-inspector__close"
                    onClick={() => setWordCloudInspectorView("slide")}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </header>

                <div className="editor-inspector__section editor-inspector__section--wordcloud">
                  <span className="editor-inspector__label">Text Bomb</span>
                  <div className="editor-inspector__palette">
                    {wordCloudPalette.map((color) => (
                      <span
                        key={color}
                        className="editor-inspector__palette-swatch"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button type="button" className="editor-inspector__palette-add" aria-label="Add">
                      +
                    </button>
                  </div>
                </div>

                <div className="editor-inspector__section editor-inspector__section--wordcloud">
                  <div className="editor-inspector__row">
                    <span>Number of responses</span>
                    <div className="editor-inspector__select-chip">
                      <select
                        value={wordCloudResponseLimit}
                        onChange={(event) => setWordCloudResponseLimit(event.target.value)}
                      >
                        <option>Unlimited</option>
                        <option>50</option>
                        <option>100</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                <div className="editor-inspector__divider" />

                <div className="editor-inspector__section editor-inspector__section--wordcloud">
                  <div className="editor-inspector__row editor-inspector__row--space">
                    <span>Show responses</span>
                    <button type="button" className="editor-inspector__apply">
                      Apply to all
                    </button>
                  </div>
                  <label className={`editor-inspector__radio${wordCloudResponsesMode === "instant" ? " is-active" : ""}`}>
                    <input
                      type="radio"
                      name="wordcloud-responses"
                      checked={wordCloudResponsesMode === "instant"}
                      onChange={() => setWordCloudResponsesMode("instant")}
                    />
                    <span className="editor-inspector__radio-dot" />
                    Instant responses
                  </label>
                  <label className={`editor-inspector__radio${wordCloudResponsesMode === "click" ? " is-active" : ""}`}>
                    <input
                      type="radio"
                      name="wordcloud-responses"
                      checked={wordCloudResponsesMode === "click"}
                      onChange={() => setWordCloudResponsesMode("click")}
                    />
                    <span className="editor-inspector__radio-dot" />
                    Responses on click
                    <span className="editor-inspector__pill">Recommended</span>
                  </label>
                  <label className={`editor-inspector__radio${wordCloudResponsesMode === "private" ? " is-active" : ""}`}>
                    <input
                      type="radio"
                      name="wordcloud-responses"
                      checked={wordCloudResponsesMode === "private"}
                      onChange={() => setWordCloudResponsesMode("private")}
                    />
                    <span className="editor-inspector__radio-dot" />
                    Private responses
                  </label>
                </div>

              </>
            ) : showQuestionPanel ? (
              <>
                <header className="editor-inspector__header editor-inspector__header--wordcloud">
                  <button
                    type="button"
                    className="editor-inspector__back"
                    onClick={() => setWordCloudInspectorView("wordcloud")}
                    aria-label="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h3>Question</h3>
                  <button
                    type="button"
                    className="editor-inspector__close"
                    onClick={() => setWordCloudInspectorView("slide")}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </header>

                <div className="editor-inspector__section editor-inspector__section--question-details">
                  <div className="editor-inspector__field">
                    <div className="editor-inspector__label-row">
                      <span>Label</span>
                      <CircleHelp size={14} />
                    </div>
                    <div className="editor-inspector__input-wrap">
                      <input
                        className="editor-inspector__input"
                        placeholder="Enter label here..."
                        value={questionLabel}
                        maxLength={75}
                        onChange={(event) => {
                          handleQuestionLabelChange(event.target.value);
                        }}
                      />
                      <span className="editor-inspector__counter">
                        {Math.max(0, 75 - questionLabel.length)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : showSlidePanel ? (
              <>
                <header className="editor-inspector__header">
                  <h3>Slide</h3>
                </header>

            <div className="editor-inspector__section editor-inspector__section--question">
              <span className="editor-inspector__label">Question type</span>
              <button
                type="button"
                className={`editor-inspector__select${isQuestionTypeOpen ? " is-open" : ""}`}
                onClick={() => setIsQuestionTypeOpen((current) => !current)}
              >
                <ScratchMenuIcon
                  name={activeQuestionConfig.icon as Parameters<typeof ScratchMenuIcon>[0]["name"]}
                  className={`editor-inspector__icon ${activeQuestionConfig.colorClass}`}
                />
                {activeQuestionConfig.label}
                <ChevronDown size={18} />
              </button>
              {isQuestionTypeOpen ? (
                <div className="editor-inspector__dropdown">
                  <span className="editor-inspector__dropdown-title">Interactive questions</span>
                  <div className="editor-inspector__dropdown-list">
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "multiple-choice" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("multiple-choice")}
                    >
                      <ScratchMenuIcon
                        name="multiple-choice"
                        className="editor-inspector__icon editor-inspector__icon--blue"
                      />
                      Multiple Choice
                      {selectedQuestionType === "multiple-choice" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "word-cloud" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("word-cloud")}
                    >
                      <ScratchMenuIcon
                        name="word-cloud"
                        className="editor-inspector__icon editor-inspector__icon--coral"
                      />
                      Text Bomb
                      {selectedQuestionType === "word-cloud" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "open-ended" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("open-ended")}
                    >
                      <ScratchMenuIcon
                        name="open-ended"
                        className="editor-inspector__icon editor-inspector__icon--rose"
                      />
                      Open Ended
                      {selectedQuestionType === "open-ended" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "scales" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("scales")}
                    >
                      <ScratchMenuIcon
                        name="scales"
                        className="editor-inspector__icon editor-inspector__icon--violet"
                      />
                      Scales
                      {selectedQuestionType === "scales" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "ranking" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("ranking")}
                    >
                      <ScratchMenuIcon
                        name="ranking"
                        className="editor-inspector__icon editor-inspector__icon--green"
                      />
                      Ranking
                      {selectedQuestionType === "ranking" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "qna" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("qna")}
                    >
                      <ScratchMenuIcon
                        name="qna"
                        className="editor-inspector__icon editor-inspector__icon--rose"
                      />
                      Q&amp;A
                      {selectedQuestionType === "qna" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "guess-number" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("guess-number")}
                    >
                      <ScratchMenuIcon
                        name="guess-number"
                        className="editor-inspector__icon scratch-menu__icon--amber"
                      />
                      Guess the Number
                      {selectedQuestionType === "guess-number" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "points-100" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("points-100")}
                    >
                      <ScratchMenuIcon
                        name="points-100"
                        className="editor-inspector__icon scratch-menu__icon--blue"
                      />
                      100 Points
                      {selectedQuestionType === "points-100" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "grid-2x2" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("grid-2x2")}
                    >
                      <ScratchMenuIcon
                        name="grid-2x2"
                        className="editor-inspector__icon scratch-menu__icon--salmon"
                      />
                      2 x 2 Grid
                      {selectedQuestionType === "grid-2x2" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "pin-image" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("pin-image")}
                    >
                      <ScratchMenuIcon
                        name="pin-image"
                        className="editor-inspector__icon scratch-menu__icon--purple"
                      />
                      Pin on Image
                      {selectedQuestionType === "pin-image" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "image-choice" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("image-choice")}
                    >
                      <ScratchMenuIcon
                        name="image-choice"
                        className="editor-inspector__icon editor-inspector__icon--blue"
                      />
                      Image Choice
                      {selectedQuestionType === "image-choice" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "hundred-points" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("hundred-points")}
                    >
                      <ScratchMenuIcon
                        name="points-100"
                        className="editor-inspector__icon editor-inspector__icon--blue"
                      />
                      100 Points
                      {selectedQuestionType === "hundred-points" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "two-by-two" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("two-by-two")}
                    >
                      <ScratchMenuIcon
                        name="grid-2x2"
                        className="editor-inspector__icon editor-inspector__icon--salmon"
                      />
                      2 x 2 Grid
                      {selectedQuestionType === "two-by-two" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                  </div>
                  <span className="editor-inspector__dropdown-title">Quiz competitions</span>
                  <div className="editor-inspector__dropdown-list">
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "select-answer" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("select-answer")}
                    >
                      <ScratchMenuIcon
                        name="select-answer"
                        className="editor-inspector__icon scratch-menu__icon--blue"
                      />
                      Select Answer
                      {selectedQuestionType === "select-answer" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "type-answer" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("type-answer")}
                    >
                      <ScratchMenuIcon
                        name="type-answer"
                        className="editor-inspector__icon scratch-menu__icon--green"
                      />
                      Type Answer
                      {selectedQuestionType === "type-answer" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                  </div>
                  <span className="editor-inspector__dropdown-title">Audience interaction</span>
                  <div className="editor-inspector__dropdown-list">
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "reactions" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("reactions")}
                    >
                      <ScratchMenuIcon
                        name="reactions"
                        className="editor-inspector__icon editor-inspector__icon--purple"
                      />
                      Reactions
                      {selectedQuestionType === "reactions" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "quick-form" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("quick-form")}
                    >
                      <ScratchMenuIcon
                        name="quick-form"
                        className="editor-inspector__icon editor-inspector__icon--gold"
                      />
                      Quick Form
                      {selectedQuestionType === "quick-form" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "comments" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("comments")}
                    >
                      <ScratchMenuIcon
                        name="comments"
                        className="editor-inspector__icon editor-inspector__icon--blue"
                      />
                      Comments
                      {selectedQuestionType === "comments" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "gather-names" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("gather-names")}
                    >
                      <ScratchMenuIcon
                        name="gather-names"
                        className="editor-inspector__icon editor-inspector__icon--blue"
                      />
                      Gather Names
                      {selectedQuestionType === "gather-names" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "timer" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("timer")}
                    >
                      <ScratchMenuIcon
                        name="timer"
                        className="editor-inspector__icon editor-inspector__icon--amber"
                      />
                      Timer
                      {selectedQuestionType === "timer" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`editor-inspector__dropdown-item${selectedQuestionType === "leaderboard" ? " is-active" : ""}`}
                      onClick={() => handleQuestionTypeSelect("leaderboard")}
                    >
                      <ScratchMenuIcon
                        name="leaderboard"
                        className="editor-inspector__icon editor-inspector__icon--gold"
                      />
                      Leaderboard
                      {selectedQuestionType === "leaderboard" ? (
                        <span className="editor-inspector__dropdown-check">
                          <Check size={16} />
                        </span>
                      ) : null}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* ── Ranking Inspector ── */}
            {selectedQuestionType === "ranking" ? (
              <div className="editor-inspector__section">
                <span className="editor-inspector__label">Items to rank</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(activeDeckSlide?.choices ?? ["Item 1", "Item 2", "Item 3", "Item 4"]).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: "#6366f1", textAlign: "center" }}>{i + 1}</span>
                      <input
                        className="editor-inspector__input"
                        value={item}
                        onChange={(e) => handleRankingItemChange(i, e.target.value)}
                        placeholder={`Item ${i + 1}`}
                        style={{ flex: 1 }}
                      />
                      <button type="button" onClick={() => handleReorderRankingItem(i, -1)} disabled={i === 0} style={{ width: 22, height: 22, border: "1px solid #e5e5e1", borderRadius: 4, background: "#fff", cursor: i === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#666", opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                      <button type="button" onClick={() => handleReorderRankingItem(i, 1)} disabled={i === (activeDeckSlide?.choices?.length ?? 4) - 1} style={{ width: 22, height: 22, border: "1px solid #e5e5e1", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#666", opacity: i === (activeDeckSlide?.choices?.length ?? 4) - 1 ? 0.3 : 1 }}>↓</button>
                      {(activeDeckSlide?.choices?.length ?? 4) > 2 && (
                        <button type="button" onClick={() => handleRemoveRankingItem(i)} style={{ width: 22, height: 22, border: "1px solid #e5e5e1", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#c44949" }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddRankingItem} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px dashed #d1d5db", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#6366f1", fontWeight: 600, width: "100%", justifyContent: "center" }}>
                    <Plus size={14} /> Add item
                  </button>
                </div>
              </div>
            ) : null}

            {/* ── Q&A Inspector ── */}
            {selectedQuestionType === "qna" ? (
              <div className="editor-inspector__section">
                <span className="editor-inspector__label">Q&A Settings</span>
                <div className="editor-toggle">
                  <span>Allow upvoting</span>
                  <button type="button" className="editor-toggle__switch is-on" onClick={() => pushToast("Upvoting enabled by default", "default")}>
                    <span />
                  </button>
                </div>
                <div className="editor-toggle">
                  <span>Audience can see questions</span>
                  <button type="button" className="editor-toggle__switch is-on" onClick={() => pushToast("Audience visibility toggled", "default")}>
                    <span />
                  </button>
                </div>
                <div className="editor-toggle">
                  <span>Moderation</span>
                  <button type="button" className="editor-toggle__switch" onClick={() => pushToast("Moderation toggled", "default")}>
                    <span />
                  </button>
                </div>
              </div>
            ) : null}

            {/* ── Guess the Number Inspector ── */}
            {selectedQuestionType === "guess-number" ? (
              <div className="editor-inspector__section">
                <span className="editor-inspector__label">Answer</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div className="editor-inspector__label-row" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#7b7b78" }}>Correct number</span>
                    </div>
                    <div className="editor-inspector__input-wrap">
                      <input
                        className="editor-inspector__input"
                        type="number"
                        value={activeDeckSlide?.correctNumber ?? 7}
                        onChange={(e) => handleCorrectNumberChange(Number(e.target.value))}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}><span style={{ fontSize: 12, color: "#7b7b78" }}>Minimum</span></div>
                      <div className="editor-inspector__input-wrap">
                        <input
                          className="editor-inspector__input"
                          type="number"
                          value={activeDeckSlide?.guessMin ?? 0}
                          onChange={(e) => handleGuessRangeChange("guessMin", Number(e.target.value))}
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}><span style={{ fontSize: 12, color: "#7b7b78" }}>Maximum</span></div>
                      <div className="editor-inspector__input-wrap">
                        <input
                          className="editor-inspector__input"
                          type="number"
                          value={activeDeckSlide?.guessMax ?? 100}
                          onChange={(e) => handleGuessRangeChange("guessMax", Number(e.target.value))}
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* ── 100 Points Inspector ── */}
            {(selectedQuestionType === "points-100" || selectedQuestionType === "hundred-points") ? (
              <div className="editor-inspector__section">
                <span className="editor-inspector__label">Options</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(activeDeckSlide?.choices ?? ["Option A", "Option B", "Option C"]).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: ["#6366f1", "#ec4899", "#3b82f6", "#f59e0b", "#10b981"][i % 5], flexShrink: 0 }} />
                      <input
                        className="editor-inspector__input"
                        value={item}
                        onChange={(e) => handlePointsItemChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        style={{ flex: 1 }}
                      />
                      {(activeDeckSlide?.choices?.length ?? 3) > 2 && (
                        <button type="button" onClick={() => handleRemovePointsItem(i)} style={{ width: 22, height: 22, border: "1px solid #e5e5e1", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#c44949" }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddPointsItem} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px dashed #d1d5db", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#3b82f6", fontWeight: 600, width: "100%", justifyContent: "center" }}>
                    <Plus size={14} /> Add option
                  </button>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "#7b7b78" }}>Total: 100 points to distribute</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="editor-inspector__section">
              <span className="editor-inspector__label">Joining instructions</span>
              <div className="editor-toggle">
                <span>Display QR code</span>
                <button
                  type="button"
                  className={`editor-toggle__switch${showQrCode ? " is-on" : ""}`}
                  onClick={() => setShowQrCode((current) => !current)}
                >
                  <span />
                </button>
              </div>
              <div className="editor-toggle">
                <span>Display instructions bar</span>
                <button
                  type="button"
                  className={`editor-toggle__switch${showJoinBar ? " is-on" : ""}`}
                  onClick={() => setShowJoinBar((current) => !current)}
                >
                  <span />
                </button>
              </div>
            </div>
              </>
            ) : null}
          </aside>
        ) : null}

        <aside className="editor-tools">
          {toolPanels.map((panel) => (
            <div key={panel.id} className="editor-tools__panel">
              {panel.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`editor-tools__item${item.active ? " is-active" : ""}`}
                    onClick={() => handleToolPanelAction(item.label)}
                  >
                    <ItemIcon size={22} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
      </div>

      <button type="button" className="editor-help" aria-label="Help">
        <CircleHelp size={20} />
      </button>

      {pendingDeleteIndex !== null ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-modal">
            <button
              type="button"
              className="confirm-modal__close"
              onClick={cancelDeleteSlide}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h3>Are you sure that you want to delete this slide?</h3>
            <p>
              This will permanently delete this slide and any response data will be lost.
            </p>
            <div className="confirm-modal__actions">
              <button type="button" className="confirm-modal__cancel" onClick={cancelDeleteSlide}>
                Cancel
              </button>
              <button type="button" className="confirm-modal__delete" onClick={confirmDeleteSlide}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`presentation-overlay${isPresenting ? " is-visible" : ""}`} aria-hidden={!isPresenting}>
        <div className="presentation-stage">
          <div className={`presentation-brand${presenterControlsVisible ? " is-visible" : ""}`}>
            <LogoMark />
          </div>
          <div className={`presentation-status${presenterControlsVisible ? " is-visible" : ""}`}>
            <span className={`presentation-status__dot${isVotingPaused ? " is-paused" : ""}`} />
            {isVotingPaused ? (
              <span className="presentation-status__text">Voting paused</span>
            ) : participantCount === 0 ? (
              <span className="presentation-status__text">Waiting for participants</span>
            ) : (
              <span className="presentation-status__text">{participantCount} participant{participantCount !== 1 ? "s" : ""}</span>
            )}
          </div>
          {showJoinBar ? (
            <div className="presentation-join">
              <span>Join at {joinHost} | use code</span>
              <strong>{joinCode}</strong>
            </div>
          ) : null}

          <div
            key={`presentation-${activeSlideIndex}-${presentationSlide.type}`}
            className={`presentation-slide presentation-slide--${presentationSlide.type}`}
          >
            {presentationSlide.type === "title" ? (
              <div className="presentation-title">
                <div className="presentation-title__copy">
                  <h1>{presentationSlide.title}</h1>
                  {presentationSlide.objective ? (
                    <p>{presentationSlide.objective}</p>
                  ) : null}
                </div>
                <div className="presentation-title__art" aria-hidden="true">
                  <svg viewBox="0 0 200 140" fill="none">
                    <circle cx="58" cy="95" r="26" stroke="#111" strokeWidth="3" />
                    <circle cx="144" cy="95" r="26" stroke="#111" strokeWidth="3" />
                    <path d="M58 95L92 72L118 95" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                    <path d="M92 72L114 48" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                    <path d="M114 48H136" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="104" cy="34" r="6" fill="#111" />
                    <path d="M104 40L96 58" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                    <path d="M96 58L84 70" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            ) : null}

            {presentationSlide.type === "word-cloud" ? (
              <div className="presentation-wordcloud">
                <h1>{presentationSlide.title}</h1>
                {presentationSlide.objective ? (
                  <p>{presentationSlide.objective}</p>
                ) : null}
                <div
                  className={`presentation-wordcloud__cloud${responsesHidden ? " is-hidden" : ""}`}
                >
                  {wordCloudTerms.map((term, index) => {
                    const classes = [
                      "wc-word--creative",
                      "wc-word--leader",
                      "wc-word--focus",
                      "wc-word--bold",
                      "wc-word--fast",
                      "wc-word--inspiration",
                      "wc-word--transpiration",
                    ];
                    return (
                      <span
                        key={`${term}-${index}`}
                        className={`wc-word ${classes[index % classes.length]}`}
                      >
                        {term}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {presentationSlide.type === "scale" ? (
              <div className={`presentation-scale${responsesHidden ? " is-hidden" : ""}`}>
                <h1>{presentationSlide.title}</h1>
                {presentationSlide.objective ? <p style={{ opacity: 0.6, margin: "0 0 16px" }}>{presentationSlide.objective}</p> : null}
                <div className="presentation-scale__statements">
                  {scaleLabels.map((option, index) => (
                    <div key={option} className="presentation-scale__statement">
                      <div className="presentation-scale__statement-row">
                        <span className="presentation-scale__statement-label">{option}</span>
                        {index === scaleLabels.length - 1 ? (
                          <span className="presentation-scale__statement-skip">0 skips</span>
                        ) : null}
                      </div>
                      <div className="presentation-scale__statement-track" aria-hidden="true" />
                    </div>
                  ))}
                </div>
                <div className="presentation-scale__axis" aria-hidden="true">
                  <span>Strongly disagree</span>
                  <span>Strongly agree</span>
                </div>
              </div>
            ) : null}

            {presentationSlide.type === "pie" ? (
              <div className={`presentation-pie${responsesHidden ? " is-hidden" : ""}`}>
                <h1>{presentationSlide.title}</h1>
                {presentationSlide.objective ? <p style={{ opacity: 0.6, marginBottom: 16, margin: 0 }}>{presentationSlide.objective}</p> : null}
                <div className="presentation-pie__content">
                  <div className="presentation-pie__chart" />
                  <div className="presentation-pie__legend">
                    {pieLegend.map((option, index) => (
                      <div key={option} className="presentation-pie__item">
                        <span className={`presentation-pie__dot presentation-pie__dot--${index}`} />
                        <span className="presentation-pie__label">{option}</span>
                        <span className="presentation-pie__value">{piePercents[index] ?? 0}%</span>
                        <span
                          className={`presentation-pie__bar presentation-pie__bar--${index}`}
                          aria-hidden="true"
                        >
                          <span style={{ width: `${piePercents[index] ?? 0}%` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {presentationSlide.type === "multiple-choice" ? (
              <div className={`presentation-mc${responsesHidden ? " is-hidden" : ""}`}>
                <h1>{presentationSlide.title}</h1>
                <div className="presentation-mc__list">
                  {multipleChoiceLabels.map((option, index) => (
                    <button
                      key={`${presentationSlide.id}-${index}`}
                      type="button"
                      className="presentation-mc__option"
                      onClick={() => handleMultipleChoiceVote(index)}
                      aria-label={`${option} ${multipleChoiceCounts[index] ?? 0} votes`}
                    >
                      <span className="presentation-mc__option-text">{option}</span>
                      <span className="presentation-mc__option-count">
                        {multipleChoiceCounts[index] ?? 0}
                      </span>
                      <span className="presentation-mc__option-bar" aria-hidden="true">
                        <span style={{ width: `${multipleChoicePercents[index] ?? 0}%` }} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {presentationSlide.type === "text" ? (
              presentationSlide.questionType === "open-ended" ? (
                <div className={`presentation-open${responsesHidden ? " is-hidden" : ""}`}>
                  <h1>{presentationSlide.title}</h1>
                  <p>{presentationSlide.objective || "Let your audience respond in full sentences."}</p>
                  <div className="presentation-open__responses">
                    {openEndedResponses.length === 0 ? (
                      <div className="presentation-open__box">
                        <span>Waiting for responses...</span>
                      </div>
                    ) : (
                      <div className="presentation-open__grid">
                        {openEndedResponses.map((response, index) => (
                          <div key={index} className="presentation-open__card">
                            {response}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="presentation-text" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center", padding: 40 }}>
                  <h1 style={{ fontSize: "clamp(24px, 4vw, 48px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  {presentationSlide.objective ? <p style={{ fontSize: 18, opacity: 0.7, margin: 0 }}>{presentationSlide.objective}</p> : null}
                  <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 600 }}>
                    {(presentationSlide.choices ?? []).map((choice, i) => (
                      <span key={i} style={{ padding: "10px 20px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 12, fontSize: 16, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.08)" }}>
                        {choice}
                      </span>
                    ))}
                  </div>
                  <p style={{ marginTop: 16, fontSize: 14, opacity: 0.5 }}>Participants can respond on their device</p>
                </div>
              )
            ) : null}

            {presentationSlide.type === "ranking" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const labels = presentationSlide.choices ?? [];
              const rankColors = ["#4B62F0", "#E8587A", "#4B62F0", "#E8A838", "#4B62F0", "#E8587A", "#3BBEAB", "#E8A838"];
              const rankScores: Record<string, number> = {};
              labels.forEach((l) => { rankScores[l] = 0; });
              responses.forEach((r) => {
                try {
                  const order = JSON.parse(r);
                  if (Array.isArray(order)) order.forEach((idx: number, rank: number) => {
                    const label = labels[idx];
                    if (label) rankScores[label] += labels.length - rank;
                  });
                } catch {}
              });
              const sorted = Object.entries(rankScores).sort((a, b) => b[1] - a[1]);
              const maxScore = Math.max(1, ...sorted.map(([,v]) => v));
              const hasResponses = responses.length > 0;
              return (
                <div className={`presentation-ranking${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 0, padding: "48px 48px 32px", width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(26px,4vw,42px)", marginBottom: 4, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center" }}>{presentationSlide.title || "Ranking"}</h1>
                  {presentationSlide.objective ? <p style={{ opacity: 0.6, margin: "0 0 24px", fontSize: 18, textAlign: "center" }}>{presentationSlide.objective}</p> : <div style={{ height: 24 }} />}
                  <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 6 }}>
                    {(hasResponses ? sorted : labels.map((l) => [l, 0] as [string, number])).map(([label, score], i) => {
                      const barWidth = hasResponses ? Math.max(8, (Number(score) / maxScore) * 100) : Math.max(8, 90 - i * 15);
                      return (
                        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)", padding: "0 2px" }}>{label}</span>
                          <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ width: `${barWidth}%`, height: "100%", borderRadius: 3, background: rankColors[i % rankColors.length], transition: "width 800ms cubic-bezier(0.34,1.56,0.64,1)" }} />
                          </div>
                        </div>
                      );
                    })}
                    {sorted.length === 0 && labels.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: 40 }}>Waiting for rankings...</div>}
                  </div>
                  <div style={{ marginTop: 20, fontSize: 14, opacity: 0.5 }}>{responses.length} response{responses.length !== 1 ? "s" : ""}</div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "qna" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              return (
                <div className={`presentation-qna${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  <p style={{ opacity: 0.6, margin: "0 0 24px", fontSize: 18 }}>{presentationSlide.objective || "Collect questions from the audience."}</p>
                  <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", gap: 12, maxHeight: 500, overflowY: "auto" }}>
                    {responses.length === 0 ? (
                      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: 48, border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 16 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
                        <div style={{ fontSize: 18 }}>Waiting for questions...</div>
                        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 8 }}>Participants can submit questions on their devices</div>
                      </div>
                    ) : responses.map((q, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", background: "rgba(255,255,255,0.08)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>💬</span>
                        <span style={{ fontSize: 17, lineHeight: 1.5, flex: 1 }}>{q}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, fontSize: 14, opacity: 0.5 }}>{responses.length} question{responses.length !== 1 ? "s" : ""}</div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "guess-number" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const correctNumber = presentationSlide.correctNumber ?? 7;
              const guessMin = presentationSlide.guessMin ?? 0;
              const guessMax = presentationSlide.guessMax ?? 100;
              const showAnswer = !responsesHidden;
              const guesses = responses.map((r: string) => parseFloat(r)).filter((n: number) => !isNaN(n));
              const avg = guesses.length > 0 ? guesses.reduce((a: number, b: number) => a + b, 0) / guesses.length : 0;
              const exactMatches = guesses.filter((n: number) => n === correctNumber).length;
              const range = guessMax - guessMin || 1;
              const bucketCount = Math.min(range, 30);
              const bucketSize = range / bucketCount;
              const buckets: { min: number; max: number; count: number }[] = [];
              for (let i = 0; i < bucketCount; i++) buckets.push({ min: guessMin + i * bucketSize, max: guessMin + (i + 1) * bucketSize, count: 0 });
              for (const n of guesses) { const clamped = Math.max(guessMin, Math.min(guessMax, n)); const idx = Math.min(Math.floor((clamped - guessMin) / bucketSize), bucketCount - 1); buckets[idx].count++; }
              const maxBucket = Math.max(1, ...buckets.map((b) => b.count));
              const barColors = ["#6b5cff", "#f472b6", "#34d399", "#fbbf24", "#60a5fa"];
              return (
                <div className={`presentation-guess${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  {presentationSlide.objective ? <p style={{ opacity: 0.6, margin: "0 0 20px", fontSize: 18 }}>{presentationSlide.objective}</p> : null}
                  <div style={{ display: "flex", gap: 28, marginBottom: 24 }}>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, color: "#6b5cff" }}>{guesses.length}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>guesses</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, color: "#6b5cff" }}>{avg.toFixed(1)}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>average</div></div>
                    {showAnswer && guesses.length > 0 && (<>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, color: "#10b981" }}>{correctNumber}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>answer</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, color: "#fbbf24" }}>{exactMatches}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>correct</div></div>
                    </>)}
                  </div>
                  <div style={{ position: "relative", width: "100%", maxWidth: 700, height: 200, display: "flex", alignItems: "flex-end", gap: 2, marginBottom: 8 }}>
                    {buckets.map((bucket, i) => {
                      const height = (bucket.count / maxBucket) * 100;
                      const isCorrectBucket = correctNumber >= bucket.min && correctNumber < bucket.max;
                      return (<div key={i} style={{ flex: 1, height: `${Math.max(height, bucket.count > 0 ? 2 : 0)}%`, background: showAnswer && isCorrectBucket ? "#10b981" : barColors[i % barColors.length], borderRadius: "3px 3px 0 0", opacity: 0.8, transition: "height 0.4s ease, background 0.4s ease", position: "relative" }} />);
                    })}
                    {showAnswer && guesses.length > 0 && (
                      <div style={{ position: "absolute", left: `${((correctNumber - guessMin) / range) * 100}%`, top: 0, bottom: 0, width: 3, background: "#10b981", transform: "translateX(-50%)", zIndex: 2, borderRadius: 2 }}>
                        <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{correctNumber}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 700, fontSize: 12, color: "rgba(255,255,255,0.4)" }}><span>{guessMin}</span><span>{guessMax}</span></div>
                  {guesses.length === 0 && <div style={{ color: "rgba(255,255,255,0.5)", padding: 24, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 8 }}>🔢</div><div>Waiting for guesses...</div></div>}
                </div>
              );
            })() : null}

            {presentationSlide.type === "hundred-points" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const labels = presentationSlide.choices ?? [];
              const totals: Record<string, number> = {};
              labels.forEach((l) => { totals[l] = 0; });
              responses.forEach((r) => {
                try {
                  const vals = JSON.parse(r);
                  if (vals && typeof vals === "object") Object.entries(vals).forEach(([k, v]) => { if (totals[k] !== undefined) totals[k] += Number(v); });
                } catch {}
              });
              const maxVal = Math.max(1, ...Object.values(totals));
              const colors = ["#6b5cff", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#fb923c"];
              return (
                <div className={`presentation-hundred${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  {presentationSlide.objective ? <p style={{ opacity: 0.6, margin: "0 0 20px", fontSize: 18 }}>{presentationSlide.objective}</p> : null}
                  <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", gap: 12 }}>
                    {labels.map((label, i) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ width: 140, fontSize: 15, fontWeight: 600, textAlign: "right", flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }}>
                          <div style={{ width: `${(totals[label] / maxVal) * 100}%`, height: "100%", borderRadius: 8, background: colors[i % colors.length], transition: "width 600ms ease" }} />
                        </div>
                        <span style={{ width: 50, fontSize: 15, fontWeight: 700, textAlign: "left" }}>{totals[label]}</span>
                      </div>
                    ))}
                    {labels.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: 40 }}>No options configured</div>}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 14, opacity: 0.5 }}>{responses.length} response{responses.length !== 1 ? "s" : ""}</div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "grid-2x2" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const dots: Array<{x: number; y: number}> = [];
              responses.forEach((r) => { try { const p = JSON.parse(r); if (p && typeof p.x === "number") dots.push({x: p.x, y: p.y}); } catch {} });
              const xLabel = presentationSlide.gridXLabel ?? "X Axis";
              const yLabel = presentationSlide.gridYLabel ?? "Y Axis";
              return (
                <div className={`presentation-grid${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  <div style={{ position: "relative", width: "min(500px, 80vw)", height: "min(500px, 60vh)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.15)" }} />
                    <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.15)" }} />
                    <span style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", fontSize: 13, opacity: 0.6 }}>{xLabel} →</span>
                    <span style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: 13, opacity: 0.6 }}>↑ {yLabel}</span>
                    {dots.map((d, i) => (
                      <div key={i} style={{ position: "absolute", left: `${d.x * 50}%`, top: `${d.y * 50}%`, width: 14, height: 14, borderRadius: "50%", background: "#6b5cff", border: "2px solid #fff", transform: "translate(-50%, -50%)", transition: "all 300ms ease" }} />
                    ))}
                  </div>
                  <div style={{ marginTop: 20, fontSize: 14, opacity: 0.5 }}>{dots.length} response{dots.length !== 1 ? "s" : ""}</div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "pin-image" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const pins: Array<{x: number; y: number}> = [];
              responses.forEach((r) => { try { const p = JSON.parse(r); if (p && typeof p.x === "number") pins.push({x: p.x, y: p.y}); } catch {} });
              return (
                <div className={`presentation-pin${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 12 }}>{presentationSlide.title}</h1>
                  <div style={{ position: "relative", width: "min(600px, 80vw)", height: "min(400px, 55vh)", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.1)" }}>
                    {presentationSlide.imageUrl ? <img src={presentationSlide.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 18 }}>Image area</div>}
                    {pins.map((p, i) => (
                      <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -100%)" }}>
                        <svg width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#ef4444"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.5 }}>{pins.length} pin{pins.length !== 1 ? "s" : ""} placed</div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "select-answer" ? (() => {
              const counts = liveResults[presentationSlide.id]?.counts ?? [];
              const labels = presentationSlide.choices ?? [];
              const total = counts.reduce((s, v) => s + v, 0) || 1;
              const correctIdx = presentationSlide.correctAnswerIndex;
              return (
                <div className={`presentation-quiz${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><span style={{ fontSize: 14, color: "#fbbf24", fontWeight: 700, background: "rgba(251,191,36,0.15)", padding: "4px 14px", borderRadius: 20 }}>⚡ {presentationSlide.quizPoints ?? 1000} points</span></div>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", gap: 10 }}>
                    {labels.map((label, i) => {
                      const pct = Math.round((counts[i] ?? 0) / total * 100);
                      const isCorrect = correctIdx === i;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: isCorrect ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", borderRadius: 14, border: isCorrect ? "2px solid #34d399" : "2px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isCorrect ? "rgba(52,211,153,0.12)" : "rgba(107,92,255,0.12)", transition: "width 500ms ease" }} />
                          <span style={{ position: "relative", width: 30, height: 30, borderRadius: "50%", background: isCorrect ? "#34d399" : "rgba(255,255,255,0.15)", color: isCorrect ? "#111" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                          <span style={{ position: "relative", flex: 1, fontSize: 17, fontWeight: 600 }}>{label}</span>
                          <span style={{ position: "relative", fontSize: 15, fontWeight: 700, opacity: 0.8 }}>{counts[i] ?? 0}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "type-answer" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const correct = presentationSlide.correctAnswers ?? [];
              return (
                <div className={`presentation-typequiz${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><span style={{ fontSize: 14, color: "#fbbf24", fontWeight: 700, background: "rgba(251,191,36,0.15)", padding: "4px 14px", borderRadius: 20 }}>⚡ {presentationSlide.quizPoints ?? 1000} points</span></div>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  {correct.length > 0 && <div style={{ fontSize: 16, color: "#34d399", fontWeight: 600, background: "rgba(52,211,153,0.12)", padding: "8px 20px", borderRadius: 12, border: "1px solid rgba(52,211,153,0.3)" }}>✓ Correct: {correct.join(", ")}</div>}
                  <div style={{ width: "100%", maxWidth: 600, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 16 }}>
                    {responses.map((r, i) => {
                      const isRight = correct.some((c) => c.toLowerCase().trim() === r.toLowerCase().trim());
                      return (
                        <div key={i} style={{ padding: "10px 18px", borderRadius: 12, background: isRight ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${isRight ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`, fontSize: 15 }}>{r}</div>
                      );
                    })}
                    {responses.length === 0 && <div style={{ color: "rgba(255,255,255,0.5)", padding: 40 }}>Waiting for answers...</div>}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 14, opacity: 0.5 }}>{responses.length} answer{responses.length !== 1 ? "s" : ""}</div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "image-choice" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const imgOpts = presentationSlide.imageOptions ?? [];
              const labels = presentationSlide.choices ?? [];
              const voteCounts: Record<string, number> = {};
              (imgOpts.length > 0 ? imgOpts : labels).forEach((o, i) => { voteCounts[typeof o === "string" ? String(i) : o.id] = 0; });
              responses.forEach((r) => { if (voteCounts[r] !== undefined) voteCounts[r]++; });
              const total = Math.max(1, Object.values(voteCounts).reduce((a, b) => a + b, 0));
              const colors = ["#6b5cff", "#f472b6", "#34d399", "#fbbf24", "#60a5fa"];
              return (
                <div className={`presentation-imgchoice${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 12 }}>{presentationSlide.title}</h1>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(imgOpts.length || labels.length || 2, 4)}, 1fr)`, gap: 16, maxWidth: 800, width: "100%" }}>
                    {(imgOpts.length > 0 ? imgOpts : labels.map((l, i) => ({id: String(i), url: "", label: l}))).map((opt, i) => {
                      const c = voteCounts[opt.id] ?? 0;
                      return (
                        <div key={opt.id} style={{ borderRadius: 14, overflow: "hidden", border: "2px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
                          <div style={{ width: "100%", paddingBottom: "70%", background: opt.url ? `url(${opt.url}) center/cover` : "rgba(255,255,255,0.08)", position: "relative" }}>
                            <span style={{ position: "absolute", top: 8, right: 8, background: colors[i % colors.length], color: "#fff", borderRadius: 20, padding: "2px 12px", fontSize: 14, fontWeight: 700 }}>{c}</span>
                          </div>
                          <div style={{ padding: "10px 14px" }}><div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div><div style={{ fontSize: 12, opacity: 0.6 }}>{Math.round(c / total * 100)}%</div></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "reactions" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const emojiCounts: Record<string, number> = {};
              responses.forEach((r) => { try { const p = JSON.parse(r); if (p?.emoji) emojiCounts[p.emoji] = (emojiCounts[p.emoji] || 0) + 1; } catch { if (r.length <= 4) emojiCounts[r] = (emojiCounts[r] || 0) + 1; } });
              const sorted = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]);
              return (
                <div className={`presentation-reactions${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
                    {sorted.length === 0 ? (
                      <div style={{ color: "rgba(255,255,255,0.5)", padding: 40, textAlign: "center" }}>
                        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
                        <div style={{ fontSize: 18 }}>Waiting for reactions...</div>
                      </div>
                    ) : sorted.map(([emoji, count]) => (
                      <div key={emoji} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 64 }}>{emoji}</span>
                        <span style={{ fontSize: 24, fontWeight: 700, color: "#6b5cff" }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "quick-form" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const fields = presentationSlide.formFields ?? [];
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 32px", background: "rgba(255,255,255,0.06)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: 48 }}>📝</span>
                    <div><span style={{ fontSize: 42, fontWeight: 700 }}>{responses.length}</span><div style={{ fontSize: 16, opacity: 0.6 }}>submission{responses.length !== 1 ? "s" : ""}</div></div>
                  </div>
                  {fields.length > 0 && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>{fields.map((f) => <span key={f.id} style={{ padding: "6px 16px", borderRadius: 20, background: "rgba(255,255,255,0.08)", fontSize: 14 }}>{f.label}</span>)}</div>}
                </div>
              );
            })() : null}

            {presentationSlide.type === "comments" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              return (
                <div className={`presentation-comments${responsesHidden ? " is-hidden" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 20 }}>{presentationSlide.title}</h1>
                  <div style={{ width: "100%", maxWidth: 650, display: "flex", flexDirection: "column", gap: 10, maxHeight: 500, overflowY: "auto" }}>
                    {responses.length === 0 ? (
                      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: 48 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                        <div style={{ fontSize: 18 }}>No comments yet</div>
                      </div>
                    ) : responses.map((msg, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: ["#6b5cff","#f472b6","#34d399","#fbbf24","#60a5fa"][i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>👤</div>
                        <div style={{ padding: "12px 18px", background: "rgba(255,255,255,0.08)", borderRadius: "0 16px 16px 16px", fontSize: 16, lineHeight: 1.5, maxWidth: "85%", wordBreak: "break-word" }}>{msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "gather-names" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const colors = ["#6b5cff", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#fb923c"];
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 4 }}>{presentationSlide.title}</h1>
                  <div style={{ fontSize: 16, opacity: 0.6, marginBottom: 16 }}>{responses.length} participant{responses.length !== 1 ? "s" : ""} joined</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 800 }}>
                    {responses.length === 0 ? (
                      <div style={{ color: "rgba(255,255,255,0.5)", padding: 40 }}>Waiting for participants to join...</div>
                    ) : responses.map((name, i) => (
                      <span key={i} style={{ padding: "10px 22px", borderRadius: 24, background: `${colors[i % colors.length]}20`, border: `1px solid ${colors[i % colors.length]}60`, fontSize: 16, fontWeight: 600 }}>{name}</span>
                    ))}
                  </div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "leaderboard" ? (() => {
              const responses = liveResults[presentationSlide.id]?.responses ?? [];
              const medals = ["#FFD700", "#C0C0C0", "#CD7F32"];
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 48, width: "100%" }}>
                  <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 12 }}>{presentationSlide.title}</h1>
                  <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 8 }}>
                    {responses.length === 0 ? (
                      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: 40 }}>No scores yet</div>
                    ) : responses.slice(0, 10).map((name, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", background: i < 3 ? `${medals[i]}15` : "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                        <span style={{ width: 34, height: 34, borderRadius: "50%", background: i < 3 ? medals[i] : "rgba(255,255,255,0.15)", color: i < 3 ? "#111" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ flex: 1, fontSize: 18, fontWeight: i < 3 ? 700 : 500 }}>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "timer" ? (() => {
              const dur = presentationSlide.timerDuration ?? 60;
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                  <div style={{ fontSize: 96, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em" }}>
                    {Math.floor(dur / 60)}:{(dur % 60).toString().padStart(2, "0")}
                  </div>
                  <div style={{ width: "min(400px, 70vw)", height: 10, borderRadius: 5, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: 5, background: "#3b82f6" }} />
                  </div>
                  <p style={{ fontSize: 16, opacity: 0.5 }}>Timer will count down on participant devices</p>
                </div>
              );
            })() : null}

            {presentationSlide.type === "instructions" ? (() => {
              const steps = presentationSlide.instructionSteps ?? ["Go to inzphire.com", "Enter the code shown on screen"];
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 48, width: "100%" }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,44px)", marginBottom: 12 }}>{presentationSlide.title}</h1>
                  <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
                    {steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <span style={{ width: 40, height: 40, borderRadius: "50%", background: "#6b5cff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 20, lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : null}

            {presentationSlide.type === "content" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, width: "100%", textAlign: "center" }}>
                <h1 style={{ fontSize: "clamp(28px,5vw,56px)", marginBottom: 8 }}>{presentationSlide.title}</h1>
                {presentationSlide.objective ? <p style={{ fontSize: 20, opacity: 0.7, margin: 0, maxWidth: 700, lineHeight: 1.6 }}>{presentationSlide.objective}</p> : null}
                {presentationSlide.contentHtml ? <div style={{ marginTop: 20, fontSize: 18, lineHeight: 1.7, maxWidth: 700 }} dangerouslySetInnerHTML={{ __html: presentationSlide.contentHtml }} /> : null}
              </div>
            ) : null}
          </div>

          <div className={`presentation-qr${showQrCode ? " is-visible" : ""}`}>
            <div className="presentation-qr__code" aria-hidden="true">
              {qrDataUrl ? (
                <img className="presentation-qr__img" src={qrDataUrl} alt="" />
              ) : (
                <div className="presentation-qr__matrix">
                  {qrMatrix.map((row, rowIndex) =>
                    row.map((cell, cellIndex) => (
                      <span
                        key={`presentation-qr-${rowIndex}-${cellIndex}`}
                        className={cell ? "is-on" : undefined}
                      />
                    )),
                  )}
                </div>
              )}
            </div>
            <div className="presentation-qr__meta">
              <span>{joinHost}</span>
              <strong>{joinCode}</strong>
            </div>
            <div className="presentation-qr__status">Waiting for participants</div>
          </div>
        </div>

        <div className={`presentation-nav${presenterControlsVisible ? " is-visible" : ""}`}>
          <button type="button" className="presentation-nav__icon" onClick={handlePresentationPrev}>
            <ArrowLeft size={16} />
          </button>
          <button type="button" className="presentation-nav__icon" onClick={toggleJoinInstructions}>
            <Lightbulb size={16} />
          </button>
          {activeSlideIndex >= presentationSlides.length - 1 ? (
            <button type="button" className="presentation-nav__end" onClick={handleExitPresentation}>
              End presentation
              <XCircle size={16} />
            </button>
          ) : (
            <button type="button" className="presentation-nav__next" onClick={handlePresentationNext}>
              Next slide
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className={`presentation-toolbar${presenterControlsVisible ? " is-visible" : ""}`}>
          <button
            type="button"
            className="presentation-toolbar__button"
            onClick={toggleFullscreen}
          >
            <Maximize2 size={16} />
            <span className="presentation-tooltip">
              {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} <span>F</span>
            </span>
          </button>
          <button type="button" className="presentation-toolbar__button" onClick={handleClearResults}>
            <RotateCcw size={16} />
            <span className="presentation-tooltip">Clear results</span>
          </button>
          <button
            type="button"
            className={`presentation-toolbar__button${showHotkeys ? " is-active" : ""}`}
            onClick={() => setShowHotkeys((value) => !value)}
          >
            <Keyboard size={16} />
            <span className="presentation-tooltip">Open hotkeys overview</span>
          </button>
          <button type="button" className="presentation-toolbar__button" onClick={() => pushToast("Timer coming soon.", "default")}>
            <Timer size={16} />
            <span className="presentation-tooltip">Timer</span>
          </button>
          <button type="button" className="presentation-toolbar__button" onClick={() => pushToast("Search coming soon.", "default")}>
            <Search size={16} />
            <span className="presentation-tooltip">Search</span>
          </button>
          <button
            type="button"
            className={`presentation-toolbar__button${showQrCode ? " is-active" : ""}`}
            onClick={() => setShowQrCode((value) => !value)}
          >
            <QrCode size={16} />
            <span className="presentation-tooltip">QR code</span>
          </button>
          <button type="button" className={`presentation-toolbar__button${isVotingPaused ? " is-active" : ""}`} onClick={toggleVotingPause}>
            {isVotingPaused ? <Play size={16} /> : <Pause size={16} />}
            <span className="presentation-tooltip">{isVotingPaused ? "Resume voting" : "Pause voting"}</span>
          </button>
          <button
            type="button"
            className="presentation-toolbar__button"
            onClick={() => setParticipantCount((prev) => prev + 1)}
          >
            <Users size={16} />
            <span className="presentation-tooltip">Add participant</span>
          </button>
          <button
            type="button"
            className={`presentation-toolbar__button${!responsesHidden ? " is-active" : ""}`}
            onClick={() => setResponsesHidden(false)}
          >
            <LayoutGrid size={16} />
            <span className="presentation-tooltip">Show results</span>
          </button>
          <button
            type="button"
            className="presentation-toolbar__button"
            onClick={() => setResponsesHidden((value) => !value)}
          >
            {responsesHidden ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="presentation-tooltip">Hide responses</span>
          </button>
        </div>

        <div className={`presentation-side${presenterControlsVisible ? " is-visible" : ""}`}>
          <button type="button" className="presentation-side__icon">
            <FilePenLine size={18} />
          </button>
          <button type="button" className="presentation-side__icon">
            <MessageSquareText size={18} />
          </button>
        </div>

        <div className={`presentation-profile${presenterControlsVisible ? " is-visible" : ""}`}>
          <span>{user.initials}!</span>
        </div>

        <div className={`presentation-scroll-hint${presenterControlsVisible ? " is-visible" : ""}`}>
          Press <span className="presentation-scroll-hint__key">ENTER</span> to stop scrolling
        </div>

        {showHotkeys ? (
          <div className="presentation-hotkeys" role="dialog" aria-modal="true">
            <button
              type="button"
              className="presentation-hotkeys__close"
              onClick={() => setShowHotkeys(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <h3>Hotkeys</h3>
            <ul>
              <li><span>Next slide</span><kbd>→</kbd> <kbd>Space</kbd></li>
              <li><span>Previous slide</span><kbd>←</kbd></li>
              <li><span>Fullscreen</span><kbd>F</kbd></li>
              <li><span>Pause/Resume voting</span><kbd>P</kbd></li>
              <li><span>Hide responses</span><kbd>H</kbd></li>
              <li><span>Toggle join info</span><kbd>I</kbd></li>
              <li><span>Hotkeys</span><kbd>K</kbd></li>
              <li><span>Exit</span><kbd>Esc</kbd></li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
