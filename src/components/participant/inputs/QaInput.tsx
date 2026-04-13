import React, { useState, useCallback } from "react";
import { Send } from "lucide-react";
import type { InputProps } from "./InputProps";

export function QaInput({ slideData, onSubmit, disabled }: InputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit({ type: "qa", question: trimmed });
    setValue("");
  }, [value, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="p-input__field" type="text" placeholder="Ask a question..." value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} disabled={disabled} />
        <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || !value.trim()} style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
export default QaInput;