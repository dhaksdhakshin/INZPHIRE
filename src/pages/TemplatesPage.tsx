import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDashboard } from "../app/dashboard-context";

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

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { templateCards, createPresentationFromTemplate, pushToast } = useDashboard();
  const [activeFilter, setActiveFilter] = useState(templateFilters[0].id);

  const filteredTemplates = useMemo(() => {
    const filter = templateFilters.find((item) => item.id === activeFilter);
    if (!filter) {
      return templateCards;
    }

    return templateCards.filter((template) => {
      const haystack = `${template.title} ${template.prompt} ${template.description}`.toLowerCase();
      return filter.match.some((keyword) => haystack.includes(keyword));
    });
  }, [activeFilter, templateCards]);

  return (
    <main className="page">
      <section className="page__content templates-page">
        <header className="templates-page__header">
          <div>
            <span className="templates-page__eyebrow">Templates</span>
            <h1>INZPHIRE templates</h1>
          </div>
          <div className="templates-page__tabs">
            <button type="button" className="templates-page__tab is-active">
              INZPHIRE templates
            </button>
          </div>
        </header>

        <div className="templates-page__filters">
          {templateFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`pill-button pill-button--soft${
                activeFilter === filter.id ? " is-active" : ""
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="template-grid">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="template-card"
              onClick={() => {
                createPresentationFromTemplate(template.id);
                pushToast(`Template "${template.title}" added`, "success");
                navigate("/app/my-presentations");
              }}
            >
              <div
                className="template-card__hero"
                style={{ backgroundColor: template.accent }}
              >
                <p>{template.prompt}</p>
              </div>
              <div className="template-card__body">
                <strong>{template.title}</strong>
                <span>{template.slides} slides</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
