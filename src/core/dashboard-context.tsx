import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  featureTemplateLibrary as defaultFeatureTemplateLibrary,
  featureTemplates,
  learningResources,
  navItems,
  templateCards as defaultTemplateCards,
  userProfile,
} from "./data";
import type {
  AiBuilderPreview,
  FeatureTemplate,
  FeatureTemplateCategory,
  FolderItem,
  LearningResource,
  NavItem,
  Presentation,
  PresentationSource,
  SearchResult,
  TemplateCard,
  ToastMessage,
  UserProfile,
} from "./types";

const STORAGE_KEY = "inzphire-clone-state-v3";

interface PersistedDashboardState {
  folders: FolderItem[];
  presentations: Presentation[];
  sharedItems: Presentation[];
}

interface CreatePresentationOptions {
  title: string;
  slides: number;
  summary: string;
  source: PresentationSource;
  featureId?: string;
  templateId?: string;
  sharedBy?: string;
}

interface DashboardContextValue {
  user: UserProfile;
  navItems: NavItem[];
  featureTemplates: FeatureTemplate[];
  featureTemplateLibrary: Record<string, FeatureTemplateCategory>;
  learningResources: LearningResource[];
  templateCards: TemplateCard[];
  folders: FolderItem[];
  presentations: Presentation[];
  sharedItems: Presentation[];
  accountMenuOpen: boolean;
  searchOpen: boolean;
  signedOut: boolean;
  toasts: ToastMessage[];
  setAccountMenuOpen: (value: boolean) => void;
  setSearchOpen: (value: boolean) => void;
  createBlankPresentation: (title?: string) => Presentation;
  createAiPresentation: () => Presentation;
  createAiPresentationFromPreview: (preview: AiBuilderPreview) => Presentation;
  importPresentation: () => Presentation;
  createPresentationFromFeature: (featureId: string) => Presentation | null;
  createPresentationFromTemplate: (templateId: string) => Presentation | null;
  createFolder: () => FolderItem;
  duplicatePresentation: (presentationId: string) => Presentation | null;
  deletePresentation: (presentationId: string) => void;
  deleteFolder: (folderId: string) => void;
  sharePresentationToInbox: (presentationId: string) => Presentation | null;
  saveSharedItemCopy: (presentationId: string) => Presentation | null;
  removeSharedItem: (presentationId: string) => void;
  logOut: () => void;
  restoreSession: () => void;
  dismissToast: (toastId: string) => void;
  pushToast: (message: string, tone?: ToastMessage["tone"]) => void;
  getSearchResults: (query: string) => SearchResult[];
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function loadPersistedState(): PersistedDashboardState {
  if (typeof window === "undefined") {
    return { folders: [], presentations: [], sharedItems: [] };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { folders: [], presentations: [], sharedItems: [] };
  }

  try {
    const parsed = JSON.parse(raw) as PersistedDashboardState;

    return {
      folders: parsed.folders ?? [],
      presentations: parsed.presentations ?? [],
      sharedItems: parsed.sharedItems ?? [],
    };
  } catch {
    return { folders: [], presentations: [], sharedItems: [] };
  }
}

export function DashboardProvider({ children }: PropsWithChildren) {
  const persisted = loadPersistedState();
  const [folders, setFolders] = useState<FolderItem[]>(persisted.folders);
  const [presentations, setPresentations] = useState<Presentation[]>(persisted.presentations);
  const [sharedItems, setSharedItems] = useState<Presentation[]>(persisted.sharedItems);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [featureTemplateLibrary, setFeatureTemplateLibrary] = useState<
    Record<string, FeatureTemplateCategory>
  >(defaultFeatureTemplateLibrary);
  const [templateCards, setTemplateCards] = useState<TemplateCard[]>(defaultTemplateCards);

  useEffect(() => {
    const controller = new AbortController();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/templates` : "/api/templates";

    async function loadTemplates() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          featureTemplateLibrary?: Record<string, FeatureTemplateCategory>;
          templateCards?: TemplateCard[];
        };

        if (payload.featureTemplateLibrary) {
          setFeatureTemplateLibrary(payload.featureTemplateLibrary);
        }
        if (payload.templateCards) {
          setTemplateCards(payload.templateCards);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    loadTemplates();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: PersistedDashboardState = {
      folders,
      presentations,
      sharedItems,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [folders, presentations, sharedItems]);

  function pushToast(message: string, tone: ToastMessage["tone"] = "default") {
    const toastId = createId("toast");
    setToasts((current) => [...current, { id: toastId, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== toastId));
    }, 3200);
  }

  function dismissToast(toastId: string) {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }

  function createPresentation(options: CreatePresentationOptions) {
    const createdPresentation: Presentation = {
      id: createId("presentation"),
      title: options.title,
      creator: "me",
      slides: options.slides,
      updatedAt: formatDateLabel(new Date()),
      results: Math.floor(Math.random() * 24),
      summary: options.summary,
      source: options.source,
      featureId: options.featureId,
      templateId: options.templateId,
      sharedBy: options.sharedBy,
    };

    setPresentations((current) => [createdPresentation, ...current]);
    return createdPresentation;
  }

  function createBlankPresentation(title?: string) {
    const count = presentations.length + 1;
    const created = createPresentation({
      title: title ?? `New INZPHIRE ${count}`,
      slides: 4,
      summary: "Blank starter deck with room for interactive slides.",
      source: "blank",
    });

    pushToast(`Created ${created.title}`, "success");
    return created;
  }

  function createAiPresentation() {
    const created = createPresentation({
      title: "AI kickoff workshop",
      slides: 7,
      summary: "Auto-generated prompts for a workshop opening and decision flow.",
      source: "ai",
    });

    pushToast("Started a new deck from AI", "success");
    return created;
  }

  function createAiPresentationFromPreview(preview: AiBuilderPreview) {
    const created = createPresentation({
      title: preview.title,
      slides: preview.slides.length,
      summary: preview.summary,
      source: "ai",
    });

    pushToast(`Created ${preview.title} from AI`, "success");
    return created;
  }

  function importPresentation() {
    const created = createPresentation({
      title: "Imported presentation",
      slides: 9,
      summary: "Imported slide deck prepared for interactive upgrades.",
      source: "import",
    });

    pushToast("Presentation imported into My presentations", "success");
    return created;
  }

  function createPresentationFromFeature(featureId: string) {
    const feature = featureTemplates.find((entry) => entry.id === featureId);
    if (!feature) {
      return null;
    }

    const created = createPresentation({
      title: feature.deckTitle,
      slides: feature.slides,
      summary: feature.description,
      source: "feature",
      featureId: feature.id,
    });

    pushToast(`${feature.title} starter added to My presentations`, "success");
    return created;
  }

  function createPresentationFromTemplate(templateId: string) {
    const template = templateCards.find((entry) => entry.id === templateId);
    if (!template) {
      return null;
    }

    const created = createPresentation({
      title: template.title,
      slides: template.slides,
      summary: template.description,
      source: "template",
      templateId: template.id,
    });

    pushToast(`Template "${template.title}" copied to My presentations`, "success");
    return created;
  }

  function createFolder() {
    const folder: FolderItem = {
      id: createId("folder"),
      title: `New folder ${folders.length + 1}`,
      itemCount: 0,
      updatedAt: formatDateLabel(new Date()),
    };

    setFolders((current) => [folder, ...current]);
    pushToast(`Created ${folder.title}`, "success");
    return folder;
  }

  function duplicatePresentation(presentationId: string) {
    const original = presentations.find((item) => item.id === presentationId);
    if (!original) {
      return null;
    }

    const duplicated = createPresentation({
      title: `${original.title} (Copy)`,
      slides: original.slides,
      summary: original.summary,
      source: original.source,
      featureId: original.featureId,
      templateId: original.templateId,
    });

    pushToast(`Duplicated ${original.title}`, "success");
    return duplicated;
  }

  function deletePresentation(presentationId: string) {
    const existing = presentations.find((item) => item.id === presentationId);
    setPresentations((current) => current.filter((item) => item.id !== presentationId));
    if (existing) {
      pushToast(`Deleted ${existing.title}`, "danger");
    }
  }

  function deleteFolder(folderId: string) {
    const existing = folders.find((item) => item.id === folderId);
    setFolders((current) => current.filter((item) => item.id !== folderId));
    if (existing) {
      pushToast(`Deleted ${existing.title}`, "danger");
    }
  }

  function sharePresentationToInbox(presentationId: string) {
    const existing = presentations.find((item) => item.id === presentationId);
    if (!existing) {
      return null;
    }

    const sharedItem: Presentation = {
      ...existing,
      id: createId("shared"),
      updatedAt: formatDateLabel(new Date()),
      sharedBy: userProfile.teamName,
    };

    setSharedItems((current) => [sharedItem, ...current]);
    pushToast(`Shared ${existing.title} to the inbox demo`, "success");
    return sharedItem;
  }

  function saveSharedItemCopy(presentationId: string) {
    const existing = sharedItems.find((item) => item.id === presentationId);
    if (!existing) {
      return null;
    }

    const copied = createPresentation({
      title: `${existing.title} (Saved copy)`,
      slides: existing.slides,
      summary: existing.summary,
      source: "shared-copy",
    });

    pushToast(`Saved a copy of ${existing.title}`, "success");
    return copied;
  }

  function removeSharedItem(presentationId: string) {
    const existing = sharedItems.find((item) => item.id === presentationId);
    setSharedItems((current) => current.filter((item) => item.id !== presentationId));
    if (existing) {
      pushToast(`Removed ${existing.title} from Shared with me`, "danger");
    }
  }

  function logOut() {
    setAccountMenuOpen(false);
    setSignedOut(true);
  }

  function restoreSession() {
    setSignedOut(false);
    pushToast("Signed back into the dashboard demo", "success");
  }

  function getSearchResults(query: string) {
    const normalized = query.trim().toLowerCase();
    const pages: SearchResult[] = navItems.map((item) => ({
      id: item.id,
      kind: "page",
      title: item.label,
      subtitle: "Navigate to page",
      route: item.href,
    }));

    const featureResults: SearchResult[] = featureTemplates.map((feature) => ({
      id: feature.id,
      kind: "feature",
      title: feature.title,
      subtitle: feature.description,
    }));

    const templateResults: SearchResult[] = templateCards.map((template) => ({
      id: template.id,
      kind: "template",
      title: template.title,
      subtitle: `${template.slides} slides`,
    }));

    const presentationResults: SearchResult[] = [...presentations, ...sharedItems].map(
      (presentation) => ({
        id: presentation.id,
        kind: "presentation",
        title: presentation.title,
        subtitle: presentation.sharedBy
          ? `Shared by ${presentation.sharedBy}`
          : `${presentation.slides} slides`,
        route: presentation.sharedBy ? "/app/shared-with-me" : "/app/my-presentations",
      }),
    );

    const learningResults: SearchResult[] = learningResources.map((entry) => ({
      id: entry.id,
      kind: "learning",
      title: entry.title,
      subtitle: entry.meta,
    }));

    const allResults = [
      ...pages,
      ...featureResults,
      ...templateResults,
      ...presentationResults,
      ...learningResults,
    ];

    if (!normalized) {
      return allResults.slice(0, 8);
    }

    return allResults.filter((result) => {
      return (
        result.title.toLowerCase().includes(normalized) ||
        result.subtitle.toLowerCase().includes(normalized)
      );
    });
  }

  const value: DashboardContextValue = {
    user: userProfile,
    navItems,
    featureTemplates,
    featureTemplateLibrary,
    learningResources,
    templateCards,
    folders,
    presentations,
    sharedItems,
    accountMenuOpen,
    searchOpen,
    signedOut,
    toasts,
    setAccountMenuOpen,
    setSearchOpen,
    createBlankPresentation,
    createAiPresentation,
    createAiPresentationFromPreview,
    importPresentation,
    createPresentationFromFeature,
    createPresentationFromTemplate,
    createFolder,
    duplicatePresentation,
    deletePresentation,
    deleteFolder,
    sharePresentationToInbox,
    saveSharedItemCopy,
    removeSharedItem,
    logOut,
    restoreSession,
    dismissToast,
    pushToast,
    getSearchResults,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }

  return context;
}
