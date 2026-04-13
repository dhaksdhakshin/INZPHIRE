import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import type { InputProps } from "./InputProps";

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
        <span style={{ fontSize: 32, fontWeight: 700 }}>{mins}:{secs.toString().padStart(2, "0")}</span>
      </div>
      <div style={{ width: "100%", height: 8, borderRadius: 4, backgroundColor: "#e5e7eb", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct > 30 ? "#3b82f6" : "#ef4444", borderRadius: 4, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}
export default TimerInput;