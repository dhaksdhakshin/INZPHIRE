import React, { useState, useCallback } from "react";
import type { InputProps } from "./InputProps";

export function QuickFormInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const fields = slideData.formFields ?? [];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => { init[f.id] = ""; });
    return init;
  });

  const handleChange = useCallback((fieldId: string, val: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    const allFilled = fields.every((f) => values[f.id]?.trim());
    if (!allFilled) return;
    onSubmit({ type: "form", fields: values });
  }, [fields, values, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fields.map((field) => (
          <div key={field.id}>
            <label className="p-input__hint" style={{ display: "block", marginBottom: 4 }}>{field.label}</label>
            <input className="p-input__field" type={field.type === "phone" ? "tel" : field.type} placeholder={field.label} value={values[field.id] ?? ""} onChange={(e) => handleChange(field.id, e.target.value)} disabled={disabled || submitted} style={{ minHeight: 44 }} />
          </div>
        ))}
      </div>
      <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || submitted || fields.some((f) => !values[f.id]?.trim())} style={{ minHeight: 44, width: "100%", marginTop: 16 }}>
        Submit
      </button>
    </div>
  );
}
export default QuickFormInput;