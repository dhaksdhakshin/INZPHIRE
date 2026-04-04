import { X } from "lucide-react";

import type { FeatureTemplateCard, FeatureTemplateCategory } from "../../core/types";

interface FeatureTemplateModalProps {
  category: FeatureTemplateCategory;
  onClose: () => void;
  onSelect: (template: FeatureTemplateCard) => void;
}

export default function FeatureTemplateModal({
  category,
  onClose,
  onSelect,
}: FeatureTemplateModalProps) {
  return (
    <div className="feature-modal" role="dialog" aria-label="Template selection">
      <button type="button" className="feature-modal__scrim" onClick={onClose} aria-label="Close" />

      <section className="feature-modal__panel">
        <header className="feature-modal__header">
          <h3>Start from scratch or a template</h3>
          <button type="button" className="feature-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="feature-modal__section">
          <h4>{category.title}</h4>
          <p>{category.description}</p>

          <div className="feature-modal__grid">
            {category.templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`feature-modal__card${template.isBlank ? " is-blank" : ""}`}
                onClick={() => onSelect(template)}
              >
                <div
                  className="feature-modal__card-preview"
                  style={{
                    background: template.background,
                    color: template.textColor ?? "#1f1f1f",
                    borderColor: template.borderColor ?? "transparent",
                  }}
                >
                  {template.isBlank ? (
                    <span className="feature-modal__plus">+</span>
                  ) : (
                    <span className="feature-modal__prompt">{template.prompt}</span>
                  )}
                </div>
                <span className="feature-modal__card-title">{template.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
