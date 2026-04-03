interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant: "presentations" | "shared" | "search";
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant,
}: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state--${variant}`}>
      <div className="empty-state__illustration" aria-hidden="true">
        <span className="empty-state__planet" />
        <span className="empty-state__ring" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="pill-button pill-button--dark" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
