import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDashboard } from "../../core/dashboard-context";
import type { SearchResult } from "../../core/types";
import Icon from "./Icon";

const resultKindLabels: Record<SearchResult["kind"], string> = {
  page: "Page",
  feature: "Feature",
  template: "Template",
  presentation: "Presentation",
  learning: "Guide",
};

export default function GlobalSearch() {
  const {
    searchOpen,
    setSearchOpen,
    getSearchResults,
    createPresentationFromFeature,
    createPresentationFromTemplate,
    pushToast,
  } = useDashboard();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    if (searchOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) {
    return null;
  }

  const results = getSearchResults(query);

  function handleSelect(result: SearchResult) {
    if (result.kind === "page" && result.route) {
      navigate(result.route);
      setSearchOpen(false);
      return;
    }

    if (result.kind === "feature") {
      createPresentationFromFeature(result.id);
      navigate("/app/my-presentations");
      setSearchOpen(false);
      return;
    }

    if (result.kind === "template") {
      createPresentationFromTemplate(result.id);
      navigate("/app/my-presentations");
      setSearchOpen(false);
      return;
    }

    if (result.kind === "presentation" && result.route) {
      navigate(result.route);
      setSearchOpen(false);
      return;
    }

    pushToast(`${result.title} opened`, "default");
    setSearchOpen(false);
  }

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      onClick={() => setSearchOpen(false)}
    >
      <div className="search-panel" onClick={(event) => event.stopPropagation()}>
        <div className="search-panel__input">
          <Icon name="search" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search presentations, folders, pages..."
          />
          <button type="button" onClick={() => setSearchOpen(false)}>
            Esc
          </button>
        </div>

        <div className="search-panel__results">
          {results.length === 0 ? (
            <div className="search-empty">
              <p>No results found for “{query}”.</p>
              <span>Try a page name, template, or presentation title.</span>
            </div>
          ) : (
            results.map((result) => (
              <button
                key={`${result.kind}-${result.id}`}
                type="button"
                className="search-result"
                onClick={() => handleSelect(result)}
              >
                <div>
                  <p>{result.title}</p>
                  <span>{result.subtitle}</span>
                </div>
                <strong>{resultKindLabels[result.kind]}</strong>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
