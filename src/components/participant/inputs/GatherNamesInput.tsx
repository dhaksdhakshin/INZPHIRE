import React, { useState, useCallback } from "react";
import type { InputProps } from "./InputProps";

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
        <input className="p-input__field" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} disabled={disabled || submitted} />
        <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || submitted || !name.trim()} style={{ minHeight: 44, paddingInline: 20 }}>
          Join
        </button>
      </div>
    </div>
  );
}
export default GatherNamesInput;