interface FourDotLoaderProps {
  compact?: boolean;
}

export default function FourDotLoader({ compact = false }: FourDotLoaderProps) {
  return (
    <div
      className={`four-dot-loader${compact ? " four-dot-loader--compact" : ""}`}
      aria-label="Loading"
      aria-live="polite"
      role="status"
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
