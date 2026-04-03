import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDashboard } from "../app/dashboard-context";
import EmptyState from "../components/dashboard/EmptyState";
import PresentationLibraryGrid from "../components/dashboard/PresentationLibraryGrid";

export default function MyPresentationsPage() {
  const navigate = useNavigate();
  const {
    folders,
    presentations,
    createFolder,
    duplicatePresentation,
    deleteFolder,
    deletePresentation,
  } = useDashboard();
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFolders = folders.filter((folder) =>
    folder.title.toLowerCase().includes(normalizedQuery),
  );
  const filteredPresentations = presentations.filter((presentation) =>
    `${presentation.title} ${presentation.summary}`
      .toLowerCase()
      .includes(normalizedQuery),
  );

  const hasItems = folders.length + presentations.length > 0;
  const hasFilteredItems = filteredFolders.length + filteredPresentations.length > 0;

  function handleCreateBlank() {
    navigate("/app/new");
  }

  return (
    <main className="page">
      <section className="page__content">
        {!hasItems ? (
          <section className="library-section">
            <h1>My presentations</h1>
            <EmptyState
              variant="presentations"
              title="No presentations here yet!"
              description="Start creating interactive and engaging presentations to include your audience."
              actionLabel="New"
              onAction={handleCreateBlank}
            />
          </section>
        ) : !hasFilteredItems ? (
          <section className="library-section">
            <h1>My presentations</h1>
            <EmptyState
              variant="search"
              title="No matching presentations"
              description={`No folders or presentations matched “${query}”.`}
            />
          </section>
        ) : (
          <PresentationLibraryGrid
            folders={filteredFolders}
            items={filteredPresentations}
            query={query}
            onQueryChange={setQuery}
            onCreatePresentation={handleCreateBlank}
            onCreateFolder={createFolder}
            onDuplicate={duplicatePresentation}
            onDelete={(itemId) => {
              const isFolder = filteredFolders.some((folder) => folder.id === itemId);
              if (isFolder) {
                deleteFolder(itemId);
                return;
              }

              deletePresentation(itemId);
            }}
          />
        )}
      </section>
    </main>
  );
}
