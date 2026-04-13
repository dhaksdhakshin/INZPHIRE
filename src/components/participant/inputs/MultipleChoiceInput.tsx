import React, { useState, useCallback } from "react";
import type { InputProps } from "./InputProps";

export function MultipleChoiceInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const options = slideData.options ?? [];

  const handleSelect = useCallback(
    (index: number) => {
      if (disabled || submitted) return;
      setSelected(index);
      onSubmit({ type: "choice", index });
    },
    [disabled, submitted, onSubmit]
  );

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div className="p-input__options">
        {options.map((option, i) => (
          <button
            key={i}
            className={`p-input__option${selected === i ? " p-input__option--selected" : ""}`}
            onClick={() => handleSelect(i)}
            disabled={disabled || submitted}
            style={{ minHeight: 44 }}
          >
            <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MultipleChoiceInput;