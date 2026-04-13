import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Send,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  MapPin,
  Clock,
  Trophy,
  CheckCircle,
  Loader2,
} from "lucide-react";
import type { SlideData, SlideType } from "../../core/types";

export interface InputProps {
  slideData: SlideData;
  onSubmit: (payload: any) => void;
  disabled?: boolean;
  submitted?: boolean;
}

export function WordCloudInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [value, setValue] = useState("");
  const maxLen = slideData.maxResponseLength ?? 25;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit({ type: "text", value: trimmed });
    setValue("");
  }, [value, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      {slideData.subtitle && <p className="p-input__hint">{slideData.subtitle}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="p-input__field"
          type="text"
          maxLength={maxLen}
          placeholder="Type your word or phrase..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={disabled}
        />
        <button
          className="p-input__submit"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Send size={18} />
        </button>
      </div>
      <p className="p-input__hint">
        {value.length}/{maxLen}
      </p>
    </div>
  );
}

export function MultipleChoiceInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const options = slideData.options ?? [];

  const handleSelect = useCallback(
    (index: number) => {
      if (disabled || submitted) return;
      setSelected(index);
      onSubmit({ type: "choice", index });
    },
    [disabled, submitted, onSubmit]
  );

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div className="p-input__options">
        {options.map((option, i) => (
          <button
            key={i}
            className={`p-input__option${selected === i ? " p-input__option--selected" : ""}`}
            onClick={() => handleSelect(i)}
            disabled={disabled || submitted}
            style={{ minHeight: 44 }}
          >
            <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OpenEndedInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [value, setValue] = useState("");
  const maxLen = slideData.maxResponseLength ?? 500;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit({ type: "text", value: trimmed });
  }, [value, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      {slideData.subtitle && <p className="p-input__hint">{slideData.subtitle}</p>}
      <textarea
        className="p-input__textarea"
        maxLength={maxLen}
        rows={4}
        placeholder="Type your response..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled || submitted}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="p-input__hint">
          {value.length}/{maxLen}
        </p>
        <button
          className="p-input__submit"
          onClick={handleSubmit}
          disabled={disabled || submitted || !value.trim()}
          style={{ minHeight: 44, paddingInline: 20 }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export function ScalesInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const min = slideData.scaleMin ?? 1;
  const max = slideData.scaleMax ?? 10;
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handleSelect = useCallback(
    (num: number) => {
      if (disabled || submitted) return;
      setSelected(num);
      onSubmit({ type: "scale", value: num });
    },
    [disabled, submitted, onSubmit]
  );

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="p-input__hint">{slideData.scaleMinLabel ?? "Low"}</span>
        <span className="p-input__hint">{slideData.scaleMaxLabel ?? "High"}</span>
      </div>
      <div className="p-input__scale">
        {numbers.map((num) => (
          <button
            key={num}
            className={`p-input__scale-num${selected === num ? " p-input__scale-num--selected" : ""}`}
            onClick={() => handleSelect(num)}
            disabled={disabled || submitted}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RankingInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const options = slideData.options ?? [];
  const [order, setOrder] = useState<number[]>(options.map((_, i) => i));

  const move = useCallback(
    (index: number, direction: -1 | 1) => {
      const newOrder = [...order];
      const swapIndex = index + direction;
      if (swapIndex < 0 || swapIndex >= newOrder.length) return;
      [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
      setOrder(newOrder);
    },
    [order]
  );

  const handleSubmit = useCallback(() => {
    onSubmit({ type: "ranking", order });
  }, [order, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint">Rank from top (1) to bottom</p>
      <div className="p-input__options">
        {order.map((optIndex, rankIndex) => (
          <div key={optIndex} className="p-input__rank-item" style={{ minHeight: 44 }}>
            <span style={{ fontWeight: 600, width: 24, textAlign: "center" }}>{rankIndex + 1}</span>
            <span style={{ flex: 1 }}>{options[optIndex]}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button
                className="p-input__rank-btn"
                onClick={() => move(rankIndex, -1)}
                disabled={disabled || submitted || rankIndex === 0}
                style={{ minHeight: 22, minWidth: 32, padding: 0 }}
              >
                <ChevronUp size={14} />
              </button>
              <button
                className="p-input__rank-btn"
                onClick={() => move(rankIndex, 1)}
                disabled={disabled || submitted || rankIndex === order.length - 1}
                style={{ minHeight: 22, minWidth: 32, padding: 0 }}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="p-input__submit"
        onClick={handleSubmit}
        disabled={disabled || submitted}
        style={{ minHeight: 44, width: "100%", marginTop: 12 }}
      >
        Submit Ranking
      </button>
    </div>
  );
}

export function HundredPointsInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const options = slideData.options ?? [];
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    options.forEach((opt) => {
      init[opt] = 0;
    });
    return init;
  });

  const totalUsed = Object.values(values).reduce((sum, v) => sum + v, 0);
  const remaining = 100 - totalUsed;

  const adjust = useCallback(
    (option: string, delta: number) => {
      if (disabled || submitted) return;
      setValues((prev) => {
        const newVal = Math.max(0, Math.min(100, prev[option] + delta));
        const newTotal = totalUsed - prev[option] + newVal;
        if (newTotal > 100) return prev;
        return { ...prev, [option]: newVal };
      });
    },
    [disabled, submitted, totalUsed]
  );

  const handleSubmit = useCallback(() => {
    if (totalUsed !== 100) return;
    onSubmit({ type: "points", values });
  }, [totalUsed, values, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint" style={{ fontWeight: 600 }}>
        Points remaining: {remaining}
      </p>
      <div className="p-input__options">
        {options.map((option) => (
          <div key={option} className="p-input__points-row" style={{ minHeight: 44 }}>
            <span style={{ flex: 1, fontSize: 14 }}>{option}</span>
            <div className="p-input__points-adj" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="p-input__rank-btn"
                onClick={() => adjust(option, -5)}
                disabled={disabled || submitted || values[option] <= 0}
                style={{ minHeight: 36, minWidth: 36, padding: 0 }}
              >
                <Minus size={16} />
              </button>
              <span style={{ width: 32, textAlign: "center", fontWeight: 700 }}>{values[option]}</span>
              <button
                className="p-input__rank-btn"
                onClick={() => adjust(option, 5)}
                disabled={disabled || submitted || remaining <= 0}
                style={{ minHeight: 36, minWidth: 36, padding: 0 }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="p-input__submit"
        onClick={handleSubmit}
        disabled={disabled || submitted || totalUsed !== 100}
        style={{ minHeight: 44, width: "100%", marginTop: 12 }}
      >
        {totalUsed === 100 ? "Submit" : `Allocate all 100 points (${remaining} left)`}
      </button>
    </div>
  );
}

export function TwoByTwoInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);
  const options = slideData.options ?? [];

  const handleSelect = useCallback(
    (x: number, y: number) => {
      if (disabled || submitted) return;
      setSelected({ x, y });
    },
    [disabled, submitted]
  );

  const handleSubmit = useCallback(() => {
    if (!selected) return;
    onSubmit({ type: "grid", x: selected.x, y: selected.y });
  }, [selected, onSubmit]);

  const quadrants = [
    { x: 0, y: 0, label: "Top-Left" },
    { x: 1, y: 0, label: "Top-Right" },
    { x: 0, y: 1, label: "Bottom-Left" },
    { x: 1, y: 1, label: "Bottom-Right" },
  ];

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="p-input__hint">{slideData.gridYLabel ?? "Y Axis"}</span>
        <span className="p-input__hint" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 4,
          aspectRatio: "1",
          maxHeight: 300,
        }}
      >
        {quadrants.map((q) => (
          <button
            key={`${q.x}-${q.y}`}
            className={`p-input__option${selected?.x === q.x && selected?.y === q.y ? " p-input__option--selected" : ""}`}
            onClick={() => handleSelect(q.x, q.y)}
            disabled={disabled || submitted}
            style={{ minHeight: 80, fontSize: 12 }}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span className="p-input__hint">{slideData.gridXLabel ?? "X Axis"} →</span>
      </div>
      <button
        className="p-input__submit"
        onClick={handleSubmit}
        disabled={disabled || submitted || !selected}
        style={{ minHeight: 44, width: "100%", marginTop: 12 }}
      >
        Submit
      </button>
    </div>
  );
}

export function PinOnImageInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || submitted || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPin({ x, y });
    },
    [disabled, submitted]
  );

  const handleSubmit = useCallback(() => {
    if (!pin) return;
    onSubmit({ type: "pin", x: pin.x, y: pin.y });
  }, [pin, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint">Tap on the image to place your pin</p>
      <div
        ref={containerRef}
        onClick={handleClick}
        style={{
          position: "relative",
          width: "100%",
          minHeight: 220,
          backgroundColor: "#e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
          cursor: disabled || submitted ? "default" : "crosshair",
        }}
      >
        {slideData.imageUrl && (
          <img
            src={slideData.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {pin && (
          <div
            style={{
              position: "absolute",
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <MapPin size={28} color="#ef4444" fill="#ef4444" />
          </div>
        )}
      </div>
      <button
        className="p-input__submit"
        onClick={handleSubmit}
        disabled={disabled || submitted || !pin}
        style={{ minHeight: 44, width: "100%", marginTop: 12 }}
      >
        Submit Pin
      </button>
    </div>
  );
}

export function QaInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit({ type: "qa", question: trimmed });
    setValue("");
  }, [value, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="p-input__field"
          type="text"
          placeholder="Ask a question..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={disabled}
        />
        <button
          className="p-input__submit"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export function TimerInput({ slideData }: InputProps) {
  const [timeLeft, setTimeLeft] = useState(slideData.timerDuration ?? 60);
  const duration = slideData.timerDuration ?? 60;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const pct = (timeLeft / duration) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="p-input" style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        <Clock size={20} />
        <span style={{ fontSize: 32, fontWeight: 700 }}>
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </div>
      <div
        className="p-input__timer-bar"
        style={{
          width: "100%",
          height: 8,
          borderRadius: 4,
          backgroundColor: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: pct > 30 ? "#3b82f6" : "#ef4444",
            borderRadius: 4,
            transition: "width 1s linear",
          }}
        />
      </div>
    </div>
  );
}

export function InstructionsInput({ slideData }: InputProps) {
  const steps = slideData.instructionSteps ?? [];

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      {steps.length > 0 && (
        <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((step, i) => (
            <li
              key={i}
              style={{ display: "flex", gap: 12, alignItems: "flex-start", minHeight: 44 }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {i + 1}
              </span>
              <span style={{ paddingTop: 3, lineHeight: 1.5 }}>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ContentInput({ slideData }: InputProps) {
  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      {slideData.subtitle && <p className="p-input__hint">{slideData.subtitle}</p>}
      {slideData.contentHtml && (
        <div dangerouslySetInnerHTML={{ __html: slideData.contentHtml }} />
      )}
    </div>
  );
}

export function ImageChoiceInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const imageOptions = slideData.imageOptions ?? [];

  const handleSelect = useCallback(
    (imageId: string) => {
      if (disabled || submitted) return;
      setSelected(imageId);
      onSubmit({ type: "image_choice", imageId });
    },
    [disabled, submitted, onSubmit]
  );

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
        }}
      >
        {imageOptions.map((img) => (
          <button
            key={img.id}
            className={`p-input__option${selected === img.id ? " p-input__option--selected" : ""}`}
            onClick={() => handleSelect(img.id)}
            disabled={disabled || submitted}
            style={{ minHeight: 100, padding: 4, display: "flex", flexDirection: "column", gap: 4 }}
          >
            <img
              src={img.url}
              alt={img.label}
              style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 4 }}
            />
            <span style={{ fontSize: 12 }}>{img.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SelectAnswerQuizInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(slideData.quizTimerSeconds ?? 30);
  const options = slideData.options ?? [];
  const duration = slideData.quizTimerSeconds ?? 30;

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  const handleSelect = useCallback(
    (index: number) => {
      if (disabled || submitted || timeLeft <= 0) return;
      setSelected(index);
      onSubmit({ type: "quiz_answer", answer: options[index], index });
    },
    [disabled, submitted, timeLeft, onSubmit, options]
  );

  const pct = (timeLeft / duration) * 100;

  return (
    <div className="p-input">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label className="p-input__label" style={{ marginBottom: 0 }}>
          {slideData.title}
        </label>
        {slideData.quizPoints != null && (
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>
            {slideData.quizPoints} pts
          </span>
        )}
      </div>
      <div
        className="p-input__timer-bar"
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          backgroundColor: "#e5e7eb",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: pct > 30 ? "#3b82f6" : "#ef4444",
            borderRadius: 3,
            transition: "width 1s linear",
          }}
        />
      </div>
      <div className="p-input__options">
        {options.map((option, i) => (
          <button
            key={i}
            className={`p-input__option${selected === i ? " p-input__option--selected" : ""}`}
            onClick={() => handleSelect(i)}
            disabled={disabled || submitted || timeLeft <= 0}
            style={{ minHeight: 44 }}
          >
            <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TypeAnswerQuizInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [value, setValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(slideData.quizTimerSeconds ?? 30);
  const duration = slideData.quizTimerSeconds ?? 30;

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || timeLeft <= 0) return;
    onSubmit({ type: "quiz_answer", answer: trimmed });
  }, [value, timeLeft, onSubmit]);

  const pct = (timeLeft / duration) * 100;

  return (
    <div className="p-input">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label className="p-input__label" style={{ marginBottom: 0 }}>
          {slideData.title}
        </label>
        {slideData.quizPoints != null && (
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>
            {slideData.quizPoints} pts
          </span>
        )}
      </div>
      <div
        className="p-input__timer-bar"
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          backgroundColor: "#e5e7eb",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: pct > 30 ? "#3b82f6" : "#ef4444",
            borderRadius: 3,
            transition: "width 1s linear",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="p-input__field"
          type="text"
          placeholder="Type your answer..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={disabled || submitted || timeLeft <= 0}
        />
        <button
          className="p-input__submit"
          onClick={handleSubmit}
          disabled={disabled || submitted || !value.trim() || timeLeft <= 0}
          style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export function LeaderboardInput({ slideData }: InputProps) {
  return (
    <div className="p-input" style={{ textAlign: "center", padding: 32 }}>
      <Trophy size={40} style={{ margin: "0 auto 16px", color: "#f59e0b" }} />
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint">Waiting for results...</p>
    </div>
  );
}

export function ReactionsInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const emojis = slideData.reactions ?? ["👍", "❤️", "😂", "😮", "👏"];

  const handleReact = useCallback(
    (emoji: string) => {
      if (disabled) return;
      onSubmit({ type: "reaction", emoji });
    },
    [disabled, onSubmit]
  );

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div className="p-input__emoji-row" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={disabled}
            style={{
              minHeight: 52,
              minWidth: 52,
              fontSize: 28,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              backgroundColor: "#fff",
              cursor: disabled ? "default" : "pointer",
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuickFormInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const fields = slideData.formFields ?? [];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      init[f.id] = "";
    });
    return init;
  });

  const handleChange = useCallback((fieldId: string, val: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    const allFilled = fields.every((f) => values[f.id]?.trim());
    if (!allFilled) return;
    onSubmit({ type: "form", fields: values });
  }, [fields, values, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fields.map((field) => (
          <div key={field.id} className="p-input__form-field">
            <label className="p-input__hint" style={{ display: "block", marginBottom: 4 }}>
              {field.label}
            </label>
            <input
              className="p-input__field"
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.label}
              value={values[field.id] ?? ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={disabled || submitted}
              style={{ minHeight: 44 }}
            />
          </div>
        ))}
      </div>
      <button
        className="p-input__submit"
        onClick={handleSubmit}
        disabled={disabled || submitted || fields.some((f) => !values[f.id]?.trim())}
        style={{ minHeight: 44, width: "100%", marginTop: 16 }}
      >
        Submit
      </button>
    </div>
  );
}

export function CommentsInput({ slideData, onSubmit, disabled }: InputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit({ type: "comment", message: trimmed });
    setValue("");
  }, [value, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="p-input__field"
          type="text"
          placeholder="Write a comment..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={disabled}
        />
        <button
          className="p-input__submit"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export function GatherNamesInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [name, setName] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ type: "name", name: trimmed });
  }, [name, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="p-input__field"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={disabled || submitted}
        />
        <button
          className="p-input__submit"
          onClick={handleSubmit}
          disabled={disabled || submitted || !name.trim()}
          style={{ minHeight: 44, paddingInline: 20 }}
        >
          Join
        </button>
      </div>
    </div>
  );
}

const INPUT_COMPONENT_LOOKUP: Record<string, React.ComponentType<InputProps>> = {
  word_cloud: WordCloudInput,
  multiple_choice: MultipleChoiceInput,
  open_ended: OpenEndedInput,
  scales: ScalesInput,
  ranking: RankingInput,
  hundred_points: HundredPointsInput,
  two_by_two: TwoByTwoInput,
  pin_on_image: PinOnImageInput,
  qa: QaInput,
  timer: TimerInput,
  instructions: InstructionsInput,
  content: ContentInput,
  image_choice: ImageChoiceInput,
  select_answer_quiz: SelectAnswerQuizInput,
  type_answer_quiz: TypeAnswerQuizInput,
  leaderboard: LeaderboardInput,
  reactions: ReactionsInput,
  quick_form: QuickFormInput,
  comments: CommentsInput,
  gather_names: GatherNamesInput,
};

export function getParticipantInputComponent(
  slideType: string
): React.ComponentType<InputProps> {
  if (!slideType) return ContentInput;
  
  const key = slideType.toLowerCase();
  return INPUT_COMPONENT_LOOKUP[key] ?? ContentInput;
}
