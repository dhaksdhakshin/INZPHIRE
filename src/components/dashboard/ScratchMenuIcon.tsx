import type { CSSProperties } from "react";

type ScratchMenuIconName =
  | "multiple-choice"
  | "word-cloud"
  | "open-ended"
  | "scales"
  | "ranking"
  | "qna"
  | "guess-number"
  | "points-100"
  | "grid-2x2"
  | "quick-form"
  | "pin-image"
  | "select-answer"
  | "type-answer"
  | "text"
  | "image"
  | "video"
  | "instructions"
  | "image-choice"
  | "reactions"
  | "comments"
  | "gather-names"
  | "timer"
  | "leaderboard"
  | "content"
  | "hundred-points"
  | "two-by-two";

interface ScratchMenuIconProps {
  name: ScratchMenuIconName;
  className?: string;
  size?: number;
  style?: CSSProperties;
}

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function ScratchMenuIcon({
  name,
  className,
  size = 16,
  style,
}: ScratchMenuIconProps) {
  switch (name) {
    case "multiple-choice":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M4 19h16" />
          <path d="M8 19v-6" />
          <path d="M12 19v-10" />
          <path d="M16 19v-4" />
        </svg>
      );
    case "word-cloud":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <circle cx="9" cy="9" r="2.4" />
          <circle cx="15" cy="9" r="2.4" />
          <circle cx="9" cy="15" r="2.4" />
          <circle cx="15" cy="15" r="2.4" />
          <circle cx="12" cy="12" r="1.3" />
        </svg>
      );
    case "open-ended":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M6 6h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4 3v-3H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          <path d="M8 10h8" />
          <path d="M8 13h6" />
        </svg>
      );
    case "scales":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M12 5v14" />
          <path d="M6 8h12" />
          <path d="M6 8l-3 5h6l-3-5Z" />
          <path d="M18 8l-3 5h6l-3-5Z" />
        </svg>
      );
    case "ranking":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <circle cx="5" cy="7" r="1.1" />
          <circle cx="5" cy="12" r="1.1" />
          <circle cx="5" cy="17" r="1.1" />
          <path d="M9 7h11" />
          <path d="M9 12h11" />
          <path d="M9 17h11" />
        </svg>
      );
    case "qna":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M12 5a7 7 0 0 1 7 7 7 7 0 0 1-7 7H8l-3 2.5V19a7 7 0 0 1-1-3.9A7 7 0 0 1 12 5Z" />
          <path d="M10.2 10.4a2.2 2.2 0 1 1 3.6 1.8c-.7.5-1.1.9-1.2 1.6" />
          <circle cx="12" cy="15.8" r="0.7" />
        </svg>
      );
    case "guess-number":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M9 5L7 19" />
          <path d="M15 5l-2 14" />
          <path d="M5 9h14" />
          <path d="M4 15h14" />
        </svg>
      );
    case "points-100":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M8 5h8v4a4 4 0 0 1-8 0V5Z" />
          <path d="M6 7H4a3.5 3.5 0 0 0 3.5 3.5" />
          <path d="M18 7h2a3.5 3.5 0 0 1-3.5 3.5" />
          <path d="M12 13v3" />
          <path d="M9 19h6" />
        </svg>
      );
    case "grid-2x2":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <rect x="4" y="4" width="7" height="7" rx="1.2" />
          <rect x="13" y="4" width="7" height="7" rx="1.2" />
          <rect x="4" y="13" width="7" height="7" rx="1.2" />
          <rect x="13" y="13" width="7" height="7" rx="1.2" />
        </svg>
      );
    case "quick-form":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M4 20h6" />
          <path d="M6 16l9-9 3 3-9 9H6Z" />
        </svg>
      );
    case "pin-image":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2.2" />
        </svg>
      );
    case "select-answer":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <path d="M4 6l2 2 3-3" />
          <path d="M4 12l2 2 3-3" />
        </svg>
      );
    case "type-answer":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M7 6h10" />
          <path d="M12 6v12" />
          <path d="M7 18h10" />
        </svg>
      );
    case "text":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M5 6h14" />
          <path d="M12 6v12" />
        </svg>
      );
    case "image":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M4 16l4-4 4 4 4-3 4 3" />
        </svg>
      );
    case "video":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M7 6l11 6-11 6Z" />
        </svg>
      );
    case "instructions":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <rect x="4" y="4" width="6" height="6" rx="1.2" />
          <rect x="14" y="4" width="6" height="6" rx="1.2" />
          <rect x="4" y="14" width="6" height="6" rx="1.2" />
          <rect x="14" y="14" width="6" height="6" rx="1.2" />
        </svg>
      );
    case "image-choice":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <circle cx="7" cy="7" r="1.5" />
          <circle cx="17" cy="7" r="1.5" />
        </svg>
      );
    case "reactions":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "comments":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M6 6h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4 3v-3H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          <path d="M8 10h8" />
          <path d="M8 13h5" />
        </svg>
      );
    case "gather-names":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <circle cx="9" cy="7" r="3" />
          <path d="M3 19a6 6 0 0 1 12 0" />
          <path d="M15 5l3 3 5-5" />
        </svg>
      );
    case "timer":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2.5" />
          <path d="M10 2h4" />
        </svg>
      );
    case "leaderboard":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M8 21V11H4v10" />
          <path d="M14 21V7h-4v14" />
          <path d="M20 21v-8h-4v8" />
        </svg>
      );
    case "content":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 8h8" />
          <path d="M8 12h6" />
          <path d="M8 16h4" />
        </svg>
      );
    case "hundred-points":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <path d="M8 5h8v4a4 4 0 0 1-8 0V5Z" />
          <path d="M6 7H4a3.5 3.5 0 0 0 3.5 3.5" />
          <path d="M18 7h2a3.5 3.5 0 0 1-3.5 3.5" />
          <path d="M12 13v3" />
          <path d="M9 19h6" />
        </svg>
      );
    case "two-by-two":
      return (
        <svg {...baseProps} className={className} width={size} height={size} style={style}>
          <rect x="4" y="4" width="7" height="7" rx="1.2" />
          <rect x="13" y="4" width="7" height="7" rx="1.2" />
          <rect x="4" y="13" width="7" height="7" rx="1.2" />
          <rect x="13" y="13" width="7" height="7" rx="1.2" />
        </svg>
      );
    default:
      return null;
  }
}
