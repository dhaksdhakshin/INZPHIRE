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
