import React from "react";
import { Trophy } from "lucide-react";
import type { InputProps } from "./InputProps";

export function LeaderboardInput({ slideData }: InputProps) {
  return (
    <div className="p-input" style={{ textAlign: "center", padding: 32 }}>
      <Trophy size={40} style={{ margin: "0 auto 16px", color: "#f59e0b" }} />
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint">Waiting for results...</p>
    </div>
  );
}
export default LeaderboardInput;