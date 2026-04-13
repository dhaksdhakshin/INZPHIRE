import React, { useState, useCallback, useEffect } from "react";
import type { InputProps } from "./InputProps";

export function SelectAnswerQuizInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(slideData.quizTimerSeconds ?? 30);
  const options = slideData.options ?? [];
  const duration = slideData.quizTimerSeconds ?? 30;

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  const handleSelect = useCallback((index: number) => {
    if (disabled || submitted || timeLeft <= 0) return;
    setSelected(index);
    onSubmit({ type: "quiz_answer", answer: options[index], index });
  }, [disabled, submitted, timeLeft, onSubmit, options]);

  const pct = (timeLeft / duration) * 100;

  return (
    <div className="p-input">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label className="p-input__label" style={{ marginBottom: 0 }}>{slideData.title}</label>
        {slideData.quizPoints != null && <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{slideData.quizPoints} pts</span>}
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: "#e5e7eb", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct > 30 ? "#3b82f6" : "#ef4444", borderRadius: 3, transition: "width 1s linear" }} />
      </div>
      <div className="p-input__options">
        {options.map((option, i) => (
          <button key={i} className={`p-input__option${selected === i ? " p-input__option--selected" : ""}`} onClick={() => handleSelect(i)} disabled={disabled || submitted || timeLeft <= 0} style={{ minHeight: 44 }}>
            <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
export default SelectAnswerQuizInput;