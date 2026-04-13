import React, { useState, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import type { InputProps } from "./InputProps";

export function HundredPointsInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const options = slideData.options ?? [];
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    options.forEach((opt) => { init[opt] = 0; });
    return init;
  });

  const totalUsed = Object.values(values).reduce((sum, v) => sum + v, 0);
  const remaining = 100 - totalUsed;

  const adjust = useCallback((option: string, delta: number) => {
    if (disabled || submitted) return;
    setValues((prev) => {
      const newVal = Math.max(0, Math.min(100, prev[option] + delta));
      const newTotal = totalUsed - prev[option] + newVal;
      if (newTotal > 100) return prev;
      return { ...prev, [option]: newVal };
    });
  }, [disabled, submitted, totalUsed]);

  const handleSubmit = useCallback(() => {
    if (totalUsed !== 100) return;
    onSubmit({ type: "points", values });
  }, [totalUsed, values, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint" style={{ fontWeight: 600 }}>Points remaining: {remaining}</p>
      <div className="p-input__options">
        {options.map((option) => (
          <div key={option} className="p-input__points-row" style={{ minHeight: 44 }}>
            <span style={{ flex: 1, fontSize: 14 }}>{option}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="p-input__rank-btn" onClick={() => adjust(option, -5)} disabled={disabled || submitted || values[option] <= 0} style={{ minHeight: 36, minWidth: 36, padding: 0 }}>
                <Minus size={16} />
              </button>
              <span style={{ width: 32, textAlign: "center", fontWeight: 700 }}>{values[option]}</span>
              <button className="p-input__rank-btn" onClick={() => adjust(option, 5)} disabled={disabled || submitted || remaining <= 0} style={{ minHeight: 36, minWidth: 36, padding: 0 }}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || submitted || totalUsed !== 100} style={{ minHeight: 44, width: "100%", marginTop: 12 }}>
        {totalUsed === 100 ? "Submit" : `Allocate all 100 points (${remaining} left)`}
      </button>
    </div>
  );
}
export default HundredPointsInput;