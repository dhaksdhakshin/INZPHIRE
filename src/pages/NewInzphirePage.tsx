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
} from "lucide-react";
import QRCode from "qrcode";

import { useDashboard } from "../app/dashboard-context";
import type { AiBuilderPreview } from "../app/types";
import FourDotLoader from "../components/dashboard/FourDotLoader";
import LogoMark from "../components/dashboard/LogoMark";
import ScratchMenuIcon from "../components/dashboard/ScratchMenuIcon";

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
type PresentationSlideType = "title" | "word-cloud" | "scale" | "pie" | "text" | "multiple-choice";
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
  ranking: "scale",
  qna: "text",
  "guess-number": "text",
  "points-100": "pie",
  "grid-2x2": "text",
  "pin-image": "text",
  "select-answer": "pie",
  "type-answer": "text",
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
  const joinCode = "7117 9512";
  const publicOrigin = import.meta.env.VITE_PUBLIC_ORIGIN ?? "";
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

  const recordChoiceResult = (slideId: string, choices: string[], index: number) => {
    const results = parseResults(localStorage.getItem(resultsStorageKey));
    const entry = results[slideId] ?? {};
    const counts = ensureMultipleChoiceOptions(choices);
    const nextCounts = normalizeChoiceCounts(counts, entry.counts);
    nextCounts[index] = (nextCounts[index] ?? 0) + 1;
    results[slideId] = {
      ...entry,
      counts: nextCounts,
    };
    localStorage.setItem(resultsStorageKey, JSON.stringify(results));
    setLiveResults(results);
  };

  useEffect(() => {
    const loadResults = () => {
      setLiveResults(parseResults(localStorage.getItem(resultsStorageKey)));
    };
    loadResults();
    const interval = window.setInterval(loadResults, 1800);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === resultsStorageKey) {
        loadResults();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [resultsStorageKey]);

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
      })),
      updatedAt: Date.now(),
    };
    localStorage.setItem(sessionStorageKey, JSON.stringify(snapshot));
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

  const wordCloudDefaults = [
    "creative",
    "leader",
    "focus",
    "bold",
    "fast",
    "inspiration",
    "transpiration",
  ];

  const wordCloudTerms = useMemo(() => {
    if (presentationSlide.type !== "word-cloud") {
      return wordCloudDefaults;
    }
    const responses = liveResults[presentationSlide.id]?.responses ?? [];
    const terms = responses
      .flatMap((response) => response.split(/\s+/))
      .map((term) => term.trim())
      .filter(Boolean);
    if (terms.length === 0) {
      return wordCloudDefaults;
    }
    return terms.slice(-14);
  }, [presentationSlide.id, presentationSlide.type, liveResults]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 240,
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then((url) => {
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
    if (type === "multiple-choice") {
      baseSlide.choices = [...DEFAULT_MULTIPLE_CHOICE_OPTIONS];
      baseSlide.choiceCounts = Array.from({ length: baseSlide.choices.length }, () => 0);
    }
    if (type === "scales") {
      baseSlide.choices = [...scaleOptions];
      baseSlide.choiceCounts = Array.from({ length: baseSlide.choices.length }, () => 0);
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

  const handleDuplicateSlide = (index: number) => {
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
  }, [isPresenting, presentationSlides.length, showJoinBar, showQrCode]);

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
                            handleDuplicateSlide(index);
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
              ) : (
                <article className="editor-generated-slide">
                  {showJoinBar ? (
                    <div className="editor-join-bar">
                      <span>Join at {joinHost} | use code</span>
                      <strong>{joinCode}</strong>
                    </div>
                  ) : null}
                  <div className="editor-join-brand">
                    <LogoMark />
                  </div>
                  <div className="editor-generated-slide__eyebrow">{activeQuestionConfig.label}</div>
                  <h2>{activeQuestionConfig.previewTitle}</h2>
                  <p>{activeQuestionConfig.previewObjective}</p>
                  <footer className="editor-generated-slide__footer">
                    <span>{aiPreview?.title ?? selectedPresentation?.title ?? "Presentation"}</span>
                    <strong>
                      {activeSlideIndex + 1}/{deckSlides.length}
                    </strong>
                  </footer>
                  {qrOverlay}
                </article>
              )
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
                </div>
              ) : null}
            </div>

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
                  <div className="presentation-open__box">
                    <span>Type your response here...</span>
                  </div>
                </div>
              ) : (
                <div className="presentation-text">
                  <h1>{presentationSlide.title}</h1>
                </div>
              )
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
            <MapPin size={16} />
          </button>
          <button type="button" className="presentation-nav__next" onClick={handlePresentationNext}>
            <ArrowRight size={16} />
            Next slide
          </button>
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
          <button type="button" className="presentation-toolbar__button" onClick={() => pushToast("Participants coming soon.", "default")}>
            <Users size={16} />
            <span className="presentation-tooltip">Participants</span>
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
