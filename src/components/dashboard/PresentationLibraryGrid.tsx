import { ChevronDown, Ellipsis, Grid2x2, LayoutList, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { FolderItem, Presentation } from "../../app/types";
import LogoMark from "./LogoMark";

interface PresentationLibraryGridProps {
  folders?: FolderItem[];
  items: Presentation[];
  query: string;
  onQueryChange: (nextValue: string) => void;
  onCreatePresentation: () => void;
  onCreateFolder: () => void;
  onDuplicate: (presentationId: string) => void;
  onDelete: (presentationId: string) => void;
}

type SortKey = "modified" | "title";
type ViewMode = "grid" | "list";

function toTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function PresentationLibraryGrid({
  folders = [],
  items,
  query,
  onQueryChange,
  onCreatePresentation,
  onCreateFolder,
  onDuplicate,
  onDelete,
}: PresentationLibraryGridProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>("modified");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const sortedItems = useMemo(() => {
    const clone = [...items];

    clone.sort((a, b) => {
      if (sortKey === "title") {
        return a.title.localeCompare(b.title);
      }

      return toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt);
    });

    return clone;
  }, [items, sortKey]);

  const totalCount = items.length;

  return (
    <section className="presentation-library">
      <div className="presentation-library__header">
        <div className="presentation-library__title-block">
          <h1>My presentations</h1>
          <div className="presentation-library__actions">
            <button type="button" className="pill-button pill-button--dark" onClick={onCreatePresentation}>
              + New
            </button>
            <button type="button" className="pill-button pill-button--soft" onClick={onCreateFolder}>
              + New folder
            </button>
          </div>
        </div>

        <div className="presentation-library__controls">
          <label className="presentation-library__search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search my presentations"
            />
            {query ? (
              <button
                type="button"
                className="presentation-library__search-clear"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : null}
          </label>

          <div className="presentation-library__toolbar">
            <div className="presentation-library__view-toggle" aria-label="View mode">
              <button
                type="button"
                className={viewMode === "grid" ? "is-active" : ""}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid2x2 size={18} />
              </button>
              <button
                type="button"
                className={viewMode === "list" ? "is-active" : ""}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <LayoutList size={18} />
              </button>
            </div>

            <label className="presentation-library__sort">
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                <option value="modified">Last modified</option>
                <option value="title">Title</option>
              </select>
              <ChevronDown size={16} />
            </label>
          </div>
        </div>
      </div>

      <div className="presentation-library__section-head">
        <h2>Presentations ({totalCount})</h2>
      </div>

      <div className={`presentation-card-grid${viewMode === "list" ? " is-list" : ""}`}>
        {sortedItems.map((item) => (
          <article key={item.id} className="presentation-card">
            <button
              type="button"
              className="presentation-card__preview"
              onClick={() =>
                navigate("/app/new", {
                  state: {
                    presentationId: item.id,
                    title: item.title,
                  },
                })
              }
            >
              <div className="presentation-card__preview-brand">
                <LogoMark />
              </div>
              <div className="presentation-card__preview-badge">
                <Grid2x2 size={12} />
              </div>
              <div className="presentation-card__preview-meta">
                <span />
                <span />
              </div>
            </button>

            <div className="presentation-card__body">
              <span className="presentation-card__avatar">D!</span>

              <div className="presentation-card__copy">
                <strong>{item.title}</strong>
                <span>Edited {item.updatedAt}</span>
              </div>

              <div className="presentation-card__menu">
                <button
                  type="button"
                  className="presentation-card__menu-button"
                  aria-label={`Actions for ${item.title}`}
                  onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                >
                  <Ellipsis size={18} />
                </button>

                {openMenuId === item.id ? (
                  <div className="presentation-card__menu-popover">
                    <button
                      type="button"
                      onClick={() => {
                        onDuplicate(item.id);
                        setOpenMenuId(null);
                      }}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(item.id);
                        setOpenMenuId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
