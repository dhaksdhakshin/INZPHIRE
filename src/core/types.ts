export type RouteId =
  | "home"
  | "my-presentations"
  | "shared-with-me"
  | "workspace-presentations"
  | "shared-templates"
  | "templates"
  | "integrations"
  | "academy"
  | "help"
  | "trash";

export type IconName =
  | "home"
  | "presentation"
  | "users"
  | "layout"
  | "copy"
  | "grid"
  | "plug"
  | "graduation"
  | "help"
  | "trash"
  | "search"
  | "sparkles"
  | "upload"
  | "folder"
  | "play"
  | "more"
  | "menu"
  | "info"
  | "plus"
  | "bell";

export type SlideType =
  | "word_cloud"
  | "multiple_choice"
  | "open_ended"
  | "scales"
  | "ranking"
  | "hundred_points"
  | "two_by_two"
  | "pin_on_image"
  | "qa"
  | "timer"
  | "instructions"
  | "content"
  | "image_choice"
  | "select_answer_quiz"
  | "type_answer_quiz"
  | "leaderboard"
  | "reactions"
  | "quick_form"
  | "comments"
  | "gather_names"
  | "guess_number";

export const ALL_SLIDE_TYPES: SlideType[] = [
  "word_cloud",
  "multiple_choice",
  "open_ended",
  "scales",
  "ranking",
  "hundred_points",
  "two_by_two",
  "pin_on_image",
  "qa",
  "timer",
  "instructions",
  "content",
  "image_choice",
  "select_answer_quiz",
  "type_answer_quiz",
  "leaderboard",
  "reactions",
  "quick_form",
  "comments",
  "gather_names",
  "guess_number",
];

export const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
  word_cloud: "Word Cloud",
  multiple_choice: "Multiple Choice",
  open_ended: "Open Ended",
  scales: "Scales",
  ranking: "Ranking",
  hundred_points: "100 Points",
  two_by_two: "2x2 Grid",
  pin_on_image: "Pin on Image",
  qa: "Q&A",
  timer: "Timer",
  instructions: "Instructions",
  content: "Content Slide",
  image_choice: "Image Choice",
  select_answer_quiz: "Select Answer Quiz",
  type_answer_quiz: "Type Answer Quiz",
  leaderboard: "Leaderboard",
  reactions: "Reactions",
  quick_form: "Quick Form",
  comments: "Comments",
  gather_names: "Gather Names",
  guess_number: "Guess the Number",
};

export const SLIDE_TYPE_CATEGORY: Record<SlideType, "question" | "quiz" | "interaction" | "content"> = {
  word_cloud: "question",
  multiple_choice: "question",
  open_ended: "question",
  scales: "question",
  ranking: "question",
  hundred_points: "question",
  two_by_two: "question",
  pin_on_image: "question",
  qa: "interaction",
  timer: "interaction",
  instructions: "content",
  content: "content",
  image_choice: "question",
  select_answer_quiz: "quiz",
  type_answer_quiz: "quiz",
  leaderboard: "quiz",
  reactions: "interaction",
  quick_form: "interaction",
  comments: "interaction",
  gather_names: "interaction",
  guess_number: "question",
};

export interface SlideData {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
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
  orderIndex: number;
  skipped?: boolean;
  showResults?: boolean;
}

export interface ResponseData {
  slideId: string;
  sessionId: string;
  participantId: string;
  participantName?: string;
  data: ResponsePayload;
  createdAt: string;
}

export type ResponsePayload =
  | { type: "text"; value: string }
  | { type: "choice"; index: number }
  | { type: "scale"; value: number }
  | { type: "ranking"; order: number[] }
  | { type: "points"; values: Record<string, number> }
  | { type: "grid"; x: number; y: number; itemId?: string }
  | { type: "pin"; x: number; y: number }
  | { type: "qa"; question: string }
  | { type: "image_choice"; imageId: string }
  | { type: "quiz_answer"; answer: string; index?: number }
  | { type: "reaction"; emoji: string }
  | { type: "comment"; message: string }
  | { type: "form"; fields: Record<string, string> }
  | { type: "name"; name: string }
  | { type: "guess_number"; value: number };

export interface LeaderboardEntry {
  participantId: string;
  participantName: string;
  totalScore: number;
  correctCount: number;
}

export interface QaQuestion {
  id: string;
  text: string;
  likes: number;
  isAnswered: boolean;
  participantId: string;
  createdAt: string;
}

export interface CommentMessage {
  id: string;
  participantId: string;
  message: string;
  createdAt: string;
}

export interface NavItem {
  id: RouteId;
  label: string;
  href: string;
  icon: IconName;
  group: "primary" | "team" | "secondary";
  isDesigned?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  teamName: string;
  participantUsage: number;
  participantLimit: number;
}

export interface FeatureTemplate {
  id: string;
  title: string;
  color: string;
  shape:
    | "word-cloud"
    | "poll"
    | "open-ended"
    | "scales"
    | "ranking"
    | "pin-on-image";
  icon: IconName;
  deckTitle: string;
  description: string;
  slides: number;
}

export interface FeatureTemplateCard {
  id: string;
  title: string;
  prompt: string;
  background: string;
  textColor?: string;
  borderColor?: string;
  isBlank?: boolean;
}

export interface FeatureTemplateCategory {
  id: string;
  title: string;
  description: string;
  templates: FeatureTemplateCard[];
}

export interface LearningResource {
  id: string;
  title: string;
  meta: string;
  icon: IconName;
  description: string;
}

export interface TemplateCard {
  id: string;
  title: string;
  slides: number;
  accent: string;
  prompt: string;
  description: string;
}

export type PresentationSource =
  | "blank"
  | "ai"
  | "import"
  | "feature"
  | "template"
  | "shared-copy";

export interface Presentation {
  id: string;
  title: string;
  creator: string;
  slides: number;
  updatedAt: string;
  results: number;
  summary: string;
  source: PresentationSource;
  featureId?: string;
  templateId?: string;
  sharedBy?: string;
}

export interface FolderItem {
  id: string;
  title: string;
  itemCount: number;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  tone: "default" | "success" | "danger";
}

export interface PlaceholderPageCopy {
  title: string;
  description: string;
}

export interface SearchResult {
  id: string;
  kind: "page" | "feature" | "template" | "presentation" | "learning";
  title: string;
  subtitle: string;
  route?: string;
}

export interface AiBuilderSlide {
  title: string;
  objective: string;
  interaction: string;
}

export interface AiBuilderPreview {
  title: string;
  summary: string;
  audience: string;
  themeSuggestion: string;
  slides: AiBuilderSlide[];
}

export interface AiBuilderMessage {
  role: "assistant" | "user";
  content: string;
}

export interface AiBuilderResponse {
  assistantMessage: string;
  preview: AiBuilderPreview | null;
}
