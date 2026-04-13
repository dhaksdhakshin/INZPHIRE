import React, { useState, useCallback, useRef } from "react";
import { MapPin } from "lucide-react";
import type { InputProps } from "./InputProps";

export function PinOnImageInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || submitted || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPin({ x, y });
  }, [disabled, submitted]);

  const handleSubmit = useCallback(() => {
    if (!pin) return;
    onSubmit({ type: "pin", x: pin.x, y: pin.y });
  }, [pin, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint">Tap on the image to place your pin</p>
      <div ref={containerRef} onClick={handleClick} style={{ position: "relative", width: "100%", minHeight: 220, backgroundColor: "#e5e7eb", borderRadius: 8, overflow: "hidden", cursor: disabled || submitted ? "default" : "crosshair" }}>
        {slideData.imageUrl && <img src={slideData.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        {pin && (
          <div style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -100%)" }}>
            <MapPin size={28} color="#ef4444" fill="#ef4444" />
          </div>
        )}
      </div>
      <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || submitted || !pin} style={{ minHeight: 44, width: "100%", marginTop: 12 }}>
        Submit Pin
      </button>
    </div>
  );
}
export default PinOnImageInput;