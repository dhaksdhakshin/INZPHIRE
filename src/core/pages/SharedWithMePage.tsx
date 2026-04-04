import { useState } from "react";

import { useDashboard } from "../dashboard-context";
import EmptyState from "../../components/dashboard/EmptyState";
import PageSearch from "../../components/dashboard/PageSearch";
import PresentationTable from "../../components/dashboard/PresentationTable";

export default function SharedWithMePage() {
  const {
    sharedItems,
    removeSharedItem,
    saveSharedItemCopy,
  } = useDashboard();
  const [query, setQuery] = useState("");

  const filteredSharedItems = sharedItems.filter((item) =>
    `${item.title} ${item.summary} ${item.sharedBy ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <main className="page">
      <section className="page__content">
        <PageSearch
          value={query}
          onChange={setQuery}
          placeholder="Search presentations, folders, and pages"
        />

        <section className="library-section">
          <h1>Shared with me</h1>

          {sharedItems.length === 0 ? (
            <EmptyState
              variant="shared"
              title="Nothing here yet"
              description="Any INZPHIRE shared with you will show up here."
            />
          ) : filteredSharedItems.length === 0 ? (
            <EmptyState
              variant="search"
              title="No matching shared items"
              description={`No shared INZPHIREs matched “${query}”.`}
            />
          ) : (
            <PresentationTable
              mode="shared"
              items={filteredSharedItems}
              onDuplicate={saveSharedItemCopy}
              onDelete={removeSharedItem}
              onSaveCopy={saveSharedItemCopy}
            />
          )}
        </section>
      </section>
    </main>
  );
}
