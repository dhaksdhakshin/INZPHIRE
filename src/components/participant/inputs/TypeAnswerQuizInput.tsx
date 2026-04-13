import React, { useState, useCallback, useEffect } from "react";
import { Send } from "lucide-react";
import type { InputProps } from "./InputProps";

export function TypeAnswerQuizInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [value, setValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(slideData.quizTimerSeconds ?? 30);
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

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || timeLeft <= 0) return;
    onSubmit({ type: "quiz_answer", answer: trimmed });
  }, [value, timeLeft, onSubmit]);

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
      <div style={{ display: "flex", gap: 8 }}>
        <input className="p-input__field" type="text" placeholder="Type your answer..." value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} disabled={disabled || submitted || timeLeft <= 0} />
        <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || submitted || !value.trim() || timeLeft <= 0} style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
export default TypeAnswerQuizInput;