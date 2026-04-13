import React from "react";
import type { InputProps } from "./InputProps";

export function InstructionsInput({ slideData }: InputProps) {
  const steps = slideData.instructionSteps ?? [];

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      {steps.length > 0 && (
        <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((step, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", minHeight: 44 }}>
              <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", backgroundColor: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                {i + 1}
              </span>
              <span style={{ paddingTop: 3, lineHeight: 1.5 }}>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
export default InstructionsInput;