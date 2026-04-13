import React, { useCallback } from "react";
import type { InputProps } from "./InputProps";

export function ReactionsInput({ slideData, onSubmit, disabled }: InputProps) {
  const emojis = slideData.reactions ?? ["👍", "❤️", "😂", "😮", "👏"];

  const handleReact = useCallback((emoji: string) => {
    if (disabled) return;
    onSubmit({ type: "reaction", emoji });
  }, [disabled, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {emojis.map((emoji) => (
          <button key={emoji} onClick={() => handleReact(emoji)} disabled={disabled} style={{ minHeight: 52, minWidth: 52, fontSize: 28, border: "1px solid #e5e7eb", borderRadius: 12, backgroundColor: "#fff", cursor: disabled ? "default" : "pointer" }}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
export default ReactionsInput;