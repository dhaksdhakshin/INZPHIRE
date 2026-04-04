import type { FeatureTemplate } from "../../core/types";

interface FeatureGlyphProps {
  feature: FeatureTemplate;
}

export default function FeatureGlyph({ feature }: FeatureGlyphProps) {
  switch (feature.shape) {
    case "word-cloud":
      return (
        <svg viewBox="0 0 120 120" className="feature-glyph" aria-hidden="true">
          <g fill={feature.color}>
            <circle cx="44" cy="40" r="20" />
            <circle cx="76" cy="40" r="20" />
            <circle cx="44" cy="72" r="20" />
            <circle cx="76" cy="72" r="20" />
          </g>
        </svg>
      );
    case "poll":
      return (
        <svg viewBox="0 0 120 120" className="feature-glyph" aria-hidden="true">
          <path
            d="M20 86V58H48V30H76V86H20Z"
            fill={feature.color}
          />
        </svg>
      );
    case "open-ended":
      return (
        <svg viewBox="0 0 120 120" className="feature-glyph" aria-hidden="true">
          <path
            d="M34 84V52C34 26 54 20 70 20C91 20 104 35 104 58C104 75 91 84 74 84H34Z"
            fill={feature.color}
          />
        </svg>
      );
    case "scales":
      return (
        <svg viewBox="0 0 120 120" className="feature-glyph" aria-hidden="true">
          <path d="M30 18H90V64L60 90L30 64V18Z" fill={feature.color} />
        </svg>
      );
    case "ranking":
      return (
        <svg viewBox="0 0 120 120" className="feature-glyph" aria-hidden="true">
          <path d="M28 84V22H92V50H60V84H28Z" fill={feature.color} />
          <path d="M60 84V50H92V84H60Z" fill={feature.color} />
        </svg>
      );
    case "pin-on-image":
      return (
        <svg viewBox="0 0 120 120" className="feature-glyph" aria-hidden="true">
          <path
            d="M60 14C39 14 25 30 25 50C25 61 31 72 39 84L60 116L81 84C89 72 95 61 95 50C95 30 81 14 60 14Z"
            fill={feature.color}
          />
          <circle cx="60" cy="46" r="11" fill="#F3F4FA" />
        </svg>
      );
    default:
      return null;
  }
}
