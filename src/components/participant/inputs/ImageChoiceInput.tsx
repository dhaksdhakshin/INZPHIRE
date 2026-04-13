import React, { useState, useCallback } from "react";
import type { InputProps } from "./InputProps";

export function ImageChoiceInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const imageOptions = slideData.imageOptions ?? [];

  const handleSelect = useCallback((imageId: string) => {
    if (disabled || submitted) return;
    setSelected(imageId);
    onSubmit({ type: "image_choice", imageId });
  }, [disabled, submitted, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {imageOptions.map((img) => (
          <button key={img.id} className={`p-input__option${selected === img.id ? " p-input__option--selected" : ""}`} onClick={() => handleSelect(img.id)} disabled={disabled || submitted} style={{ minHeight: 100, padding: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <img src={img.url} alt={img.label} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 4 }} />
            <span style={{ fontSize: 12 }}>{img.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default ImageChoiceInput;