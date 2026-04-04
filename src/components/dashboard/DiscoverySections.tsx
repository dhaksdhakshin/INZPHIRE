import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, PencilLine, Smartphone } from "lucide-react";

import { useDashboard } from "../../core/dashboard-context";
import FeatureGlyph from "./FeatureGlyph";
import FeatureTemplateModal from "./FeatureTemplateModal";
import FourDotLoader from "./FourDotLoader";
import Icon from "./Icon";

interface DiscoverySectionsProps {
  query: string;
  showLearning: boolean;
  showActions: boolean;
  onNewPresentation: () => void;
  onCreateWithAi: () => void;
  onImportPresentation: () => void;
}

export default function DiscoverySections({
  query,
  showLearning,
  showActions,
  onNewPresentation,
  onCreateWithAi,
  onImportPresentation,
}: DiscoverySectionsProps) {
  const {
    featureTemplates,
    featureTemplateLibrary,
    templateCards,
    learningResources,
    createPresentationFromFeature,
    createPresentationFromTemplate,
    pushToast,
  } = useDashboard();
  const navigate = useNavigate();
  const [isNewButtonLoading, setIsNewButtonLoading] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const newMenuRef = useRef<HTMLDivElement | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFeatures = featureTemplates.filter((item) =>
    item.title.toLowerCase().includes(normalizedQuery),
  );
  const filteredTemplates = templateCards.filter((item) => {
    const haystack = `${item.title} ${item.prompt} ${item.description}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
  const filteredLearning = learningResources.filter((item) =>
    `${item.title} ${item.meta} ${item.description}`
      .toLowerCase()
      .includes(normalizedQuery),
  );

  useEffect(() => {
    if (!isNewButtonLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onNewPresentation();
    }, 680);

    return () => window.clearTimeout(timeoutId);
  }, [isNewButtonLoading, onNewPresentation]);

  useEffect(() => {
    if (!isNewMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!newMenuRef.current) {
        return;
      }
      if (!newMenuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isNewMenuOpen]);

  function handleNewMenuSelect(type: "quiz" | "survey") {
    setIsNewMenuOpen(false);
    if (type === "quiz") {
      pushToast("New quiz created", "success");
      navigate("/app/new", {
        state: {
          title: "New quiz",
          templateType: "select-answer",
        },
      });
      return;
    }

    pushToast("New survey created", "success");
    navigate("/app/new", {
      state: {
        title: "New survey",
        templateType: "open-ended",
      },
    });
  }

  return (
    <div className="discovery-stack">
      {activeFeatureId && featureTemplateLibrary[activeFeatureId] ? (
        <FeatureTemplateModal
          category={featureTemplateLibrary[activeFeatureId]}
          onClose={() => setActiveFeatureId(null)}
          onSelect={(template) => {
            const created = createPresentationFromFeature(activeFeatureId);
            pushToast(
              template.isBlank
                ? `${featureTemplateLibrary[activeFeatureId].title} created`
                : `${template.title} selected`,
              "success",
            );
            setActiveFeatureId(null);
            navigate("/app/new", {
              state: {
                presentationId: created?.id,
                title: template.title,
                templateType: activeFeatureId,
                templatePrompt: template.prompt,
                templateIsBlank: template.isBlank,
              },
            });
          }}
        />
      ) : null}
      {showActions ? (
        <div className="action-row">
          <div className="pill-split" ref={newMenuRef}>
            <button
              type="button"
              className={`pill-button pill-button--dark pill-button--split pill-button--split-main${
                isNewButtonLoading ? " is-loading" : ""
              }`}
              onClick={() => setIsNewButtonLoading(true)}
              disabled={isNewButtonLoading}
            >
              <span className="pill-button__label-wrap">
                <span className="pill-button__label">New</span>
                <span className="pill-button__loader-wrap">
                  <FourDotLoader compact />
                </span>
              </span>
            </button>
            <button
              type="button"
              className="pill-button pill-button--dark pill-button--split-toggle"
              aria-haspopup="menu"
              aria-expanded={isNewMenuOpen}
              onClick={() => setIsNewMenuOpen((current) => !current)}
              disabled={isNewButtonLoading}
            >
              <ChevronDown size={16} />
            </button>
            {isNewMenuOpen ? (
              <div className="pill-split__menu" role="menu">
                <button
                  type="button"
                  className="pill-split__item"
                  role="menuitem"
                  onClick={() => handleNewMenuSelect("quiz")}
                >
                  <span className="pill-split__icon">
                    <PencilLine size={16} strokeWidth={1.8} />
                  </span>
                  New quiz
                </button>
                <button
                  type="button"
                  className="pill-split__item"
                  role="menuitem"
                  onClick={() => handleNewMenuSelect("survey")}
                >
                  <span className="pill-split__icon">
                    <Smartphone size={16} strokeWidth={1.8} />
                  </span>
                  New survey
                </button>
              </div>
            ) : null}
          </div>
          <button type="button" className="pill-button pill-button--outline" onClick={onCreateWithAi}>
            <Icon name="sparkles" size={15} />
            Start with AI
          </button>
          <button
            type="button"
            className="pill-button pill-button--outline"
            onClick={onImportPresentation}
          >
            <Icon name="upload" size={15} />
            Import presentation
          </button>
        </div>
      ) : null}

      <section className="content-section content-section--features">
        <div className="section-heading">
          <h2>Popular features</h2>
        </div>
        <div className="feature-grid">
          {filteredFeatures.map((feature) => (
            <button
              key={feature.id}
              type="button"
              className="feature-card"
              onClick={() => {
                setActiveFeatureId(feature.id);
              }}
            >
              <span className="feature-card__icon-wrap">
                <FeatureGlyph feature={feature} />
              </span>
              <span className="feature-card__label">{feature.title}</span>
            </button>
          ))}
        </div>
      </section>

      {showLearning ? (
        <section className="content-section">
          <div className="section-heading">
            <h2>Get to know INZPHIRE</h2>
          </div>
          <div className="learning-grid">
            {filteredLearning.map((resource) => (
              <button
                key={resource.id}
                type="button"
                className="learning-card"
                onClick={() => pushToast(`${resource.title} opened`, "default")}
              >
                <span className="learning-card__icon" aria-hidden="true">
                  <Icon name={resource.icon} size={18} />
                </span>
                <strong>{resource.title}</strong>
                <span>{resource.meta}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>Popular templates</h2>
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/app/templates")}
          >
            See all templates
          </button>
        </div>

        <div className="template-grid">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="template-card"
              onClick={() => {
                createPresentationFromTemplate(template.id);
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
    </div>
  );
}
