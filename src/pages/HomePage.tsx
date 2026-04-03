import { useNavigate } from "react-router-dom";

import { useDashboard } from "../app/dashboard-context";
import DiscoverySections from "../components/dashboard/DiscoverySections";
import PageSearch from "../components/dashboard/PageSearch";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const {
    user,
    importPresentation,
  } = useDashboard();
  const [query, setQuery] = useState("");

  function handleCreateBlank() {
    navigate("/app/new");
  }

  function handleCreateAi() {
    navigate("/app/start-with-ai");
  }

  function handleImport() {
    importPresentation();
    navigate("/app/my-presentations");
  }

  return (
    <main className="page">
      <section className="page__content">
        <h1>Welcome {user.name}</h1>
        <PageSearch
          value={query}
          onChange={setQuery}
          placeholder="Search presentations, folders, and pages"
        />
        <DiscoverySections
          query={query}
          showLearning
          showActions
          onNewPresentation={handleCreateBlank}
          onCreateWithAi={handleCreateAi}
          onImportPresentation={handleImport}
        />
      </section>
    </main>
  );
}
