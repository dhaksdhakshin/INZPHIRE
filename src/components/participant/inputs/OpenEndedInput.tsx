import React, { useState, useCallback } from "react";
import type { InputProps } from "./InputProps";

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
        <p className="p-input__hint">{value.length}/{maxLen}</p>
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

export default OpenEndedInput;