import React, { useState, useCallback } from "react";
import { Send } from "lucide-react";
import type { InputProps } from "./InputProps";

export function CommentsInput({ slideData, onSubmit, disabled }: InputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit({ type: "comment", message: trimmed });
    setValue("");
  }, [value, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="p-input__field" type="text" placeholder="Write a comment..." value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} disabled={disabled} />
        <button className="p-input__submit" onClick={handleSend} disabled={disabled || !value.trim()} style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
export default CommentsInput;