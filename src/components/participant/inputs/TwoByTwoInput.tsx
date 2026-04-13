import React, { useState, useCallback } from "react";
import type { InputProps } from "./InputProps";

export function TwoByTwoInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);
  const options = slideData.options ?? [];

  const handleSelect = useCallback((x: number, y: number) => {
    if (disabled || submitted) return;
    setSelected({ x, y });
  }, [disabled, submitted]);

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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 4, aspectRatio: "1", maxHeight: 300 }}>
        {quadrants.map((q) => (
          <button key={`${q.x}-${q.y}`} className={`p-input__option${selected?.x === q.x && selected?.y === q.y ? " p-input__option--selected" : ""}`} onClick={() => handleSelect(q.x, q.y)} disabled={disabled || submitted} style={{ minHeight: 80, fontSize: 12 }}>
            {q.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span className="p-input__hint">{slideData.gridXLabel ?? "X Axis"} →</span>
      </div>
      <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || submitted || !selected} style={{ minHeight: 44, width: "100%", marginTop: 12 }}>
        Submit
      </button>
    </div>
  );
}
export default TwoByTwoInput;