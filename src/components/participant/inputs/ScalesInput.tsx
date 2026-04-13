import React, { useState, useCallback } from "react";
import type { InputProps } from "./InputProps";

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

export default ScalesInput;