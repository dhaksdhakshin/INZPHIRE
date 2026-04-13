import React, { useState, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { InputProps } from "./InputProps";

export function RankingInput({ slideData, onSubmit, disabled, submitted }: InputProps) {
  const options = slideData.options ?? [];
  const [order, setOrder] = useState<number[]>(options.map((_, i) => i));

  const move = useCallback((index: number, direction: -1 | 1) => {
    const newOrder = [...order];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setOrder(newOrder);
  }, [order]);

  const handleSubmit = useCallback(() => {
    onSubmit({ type: "ranking", order });
  }, [order, onSubmit]);

  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      <p className="p-input__hint">Rank from top (1) to bottom</p>
      <div className="p-input__options">
        {order.map((optIndex, rankIndex) => (
          <div key={optIndex} className="p-input__rank-item" style={{ minHeight: 44 }}>
            <span style={{ fontWeight: 600, width: 24, textAlign: "center" }}>{rankIndex + 1}</span>
            <span style={{ flex: 1 }}>{options[optIndex]}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button className="p-input__rank-btn" onClick={() => move(rankIndex, -1)} disabled={disabled || submitted || rankIndex === 0} style={{ minHeight: 22, minWidth: 32, padding: 0 }}>
                <ChevronUp size={14} />
              </button>
              <button className="p-input__rank-btn" onClick={() => move(rankIndex, 1)} disabled={disabled || submitted || rankIndex === order.length - 1} style={{ minHeight: 22, minWidth: 32, padding: 0 }}>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="p-input__submit" onClick={handleSubmit} disabled={disabled || submitted} style={{ minHeight: 44, width: "100%", marginTop: 12 }}>
        Submit Ranking
      </button>
    </div>
  );
}
export default RankingInput;