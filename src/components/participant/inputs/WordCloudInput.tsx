import React, { useState, useCallback } from "react";
import { Send } from "lucide-react";
import type { SlideData } from "../../../core/types";
import type { InputProps } from "./InputProps";

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

export default WordCloudInput;