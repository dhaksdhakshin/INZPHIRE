import React, { useMemo } from "react";
import {
  Clock,
  MessageCircle,
  ThumbsUp,
  Trophy,
  MapPin,
  Hash,
  ChevronRight,
  Star,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";

interface RendererProps {
  slideData: any;
  results: any;
  theme?: any;
}

const THEME_COLORS = [
  "#5C6BC0",
  "#26A69A",
  "#EF5350",
  "#FFA726",
  "#AB47BC",
  "#42A5F5",
  "#66BB6A",
  "#EC407A",
  "#8D6E63",
  "#78909C",
];

function getThemeColor(index: number, theme?: any): string {
  if (theme?.colors?.length) {
    return theme.colors[index % theme.colors.length];
  }
  return THEME_COLORS[index % THEME_COLORS.length];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function WordCloudRenderer({ slideData, results, theme }: RendererProps) {
  const words = useMemo(() => {
    const responses: any[] = results?.responses ?? [];
    const freq: Record<string, number> = {};

    for (const r of responses) {
      const payload = r.data ?? r;
      const text: string =
        payload.type === "text"
          ? payload.value
          : typeof payload === "string"
            ? payload
            : "";
      if (!text) continue;
      const tokens = text
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 1);
      for (const token of tokens) {
        freq[token] = (freq[token] || 0) + 1;
      }
    }

    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);

    if (sorted.length === 0) return [];

    const maxCount = sorted[0][1];
    const minCount = sorted[sorted.length - 1][1];
    const range = maxCount - minCount || 1;

    return sorted.map(([word, count], i) => {
      const norm = (count - minCount) / range;
      const fontSize = Math.round(14 + norm * 52);
      const angle = seededRandom(i * 7 + 3) > 0.7 ? (seededRandom(i * 13) > 0.5 ? -12 : 12) : 0;
      const x = seededRandom(i * 17 + 5) * 70 + 5;
      const y = seededRandom(i * 23 + 11) * 70 + 5;
      const color = getThemeColor(i, theme);
      const opacity = 0.7 + norm * 0.3;

      return { word, count, fontSize, angle, x, y, color, opacity };
    });
  }, [results, theme]);

  if (words.length === 0) {
    return (
      <div className="r-wordcloud" style={{ position: "relative", width: "100%", height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
        Waiting for responses...
      </div>
    );
  }

  return (
    <div className="r-wordcloud" style={{ position: "relative", width: "100%", height: 400, overflow: "hidden" }}>
      {words.map((w, i) => (
        <span
          key={i}
          className="r-wordcloud__word"
          style={{
            position: "absolute",
            left: `${w.x}%`,
            top: `${w.y}%`,
            fontSize: w.fontSize,
            fontWeight: w.fontSize > 30 ? 700 : 500,
            color: w.color,
            opacity: w.opacity,
            transform: `rotate(${w.angle}deg)`,
            whiteSpace: "nowrap",
            cursor: "default",
            userSelect: "none",
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
}

export function MultipleChoiceRenderer({ slideData, results, theme }: RendererProps) {
  const options: string[] = slideData?.options ?? [];
  const counts: number[] = results?.counts ?? [];
  const total = counts.reduce((a: number, b: number) => a + b, 0) || 1;
  const maxCount = Math.max(...counts, 1);

  if (options.length === 0) {
    return (
      <div className="r-bar-chart" style={{ padding: 24, color: "#999" }}>
        No options configured
      </div>
    );
  }

  const leadingIndex = counts.indexOf(Math.max(...counts));

  return (
    <div className="r-bar-chart" style={{ width: "100%", padding: 16 }}>
      {options.map((option, i) => {
        const count = counts[i] || 0;
        const pct = ((count / total) * 100).toFixed(1);
        const barWidth = (count / maxCount) * 100;
        const isLeading = i === leadingIndex && count > 0;
        const color = getThemeColor(i, theme);

        return (
          <div className="r-bar-chart__row" key={i} style={{ marginBottom: 14 }}>
            <div className="r-bar-chart__label" style={{ marginBottom: 4, fontSize: 14, fontWeight: isLeading ? 700 : 400, display: "flex", justifyContent: "space-between" }}>
              <span>{option}</span>
              <span style={{ marginLeft: 12, color: "#666", flexShrink: 0 }}>
                {count} ({pct}%)
              </span>
            </div>
            <div style={{ background: "#E0E0E0", borderRadius: 6, height: 28, overflow: "hidden" }}>
              <div
                className="r-bar-chart__bar"
                style={{
                  width: `${barWidth}%`,
                  height: "100%",
                  background: isLeading ? color : `${color}99`,
                  borderRadius: 6,
                  transition: "width 0.6s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 8,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: count > 0 ? 32 : 0,
                }}
              >
                {count > 0 ? `${pct}%` : ""}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>
        Total responses: {total}
      </div>
    </div>
  );
}

export function OpenEndedRenderer({ slideData, results, theme }: RendererProps) {
  const responses: any[] = results?.responses ?? [];

  if (responses.length === 0) {
    return (
      <div className="r-responses" style={{ padding: 24, color: "#999" }}>
        Waiting for responses...
      </div>
    );
  }

  return (
    <div className="r-responses" style={{ width: "100%", padding: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
      {responses.map((r, i) => {
        const payload = r.data ?? r;
        const text: string =
          payload.type === "text"
            ? payload.value
            : typeof payload === "string"
              ? payload
              : "";
        if (!text) return null;
        return (
          <div
            key={i}
            className="r-responses__item"
            style={{
              background: "#f5f5f5",
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 14,
              maxWidth: "100%",
              wordBreak: "break-word",
              borderLeft: `3px solid ${getThemeColor(i, theme)}`,
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}

export function ScalesRenderer({ slideData, results, theme }: RendererProps) {
  const responses: any[] = results?.responses ?? [];
  const scaleMin = slideData?.scaleMin ?? 1;
  const scaleMax = slideData?.scaleMax ?? 10;
  const range = scaleMax - scaleMin || 1;

  const { avg, distribution } = useMemo(() => {
    if (responses.length === 0) return { avg: 0, distribution: [] as number[] };

    let sum = 0;
    const buckets: Record<number, number> = {};
    for (let i = scaleMin; i <= scaleMax; i++) buckets[i] = 0;

    for (const r of responses) {
      const payload = r.data ?? r;
      const val: number = payload.type === "scale" ? payload.value : typeof payload === "number" ? payload : 0;
      sum += val;
      if (buckets[val] !== undefined) buckets[val]++;
    }

    return {
      avg: sum / responses.length,
      distribution: Object.values(buckets),
    };
  }, [responses, scaleMin, scaleMax]);

  const maxDist = Math.max(...distribution, 1);
  const avgPct = ((avg - scaleMin) / range) * 100;
  const accentColor = getThemeColor(0, theme);

  return (
    <div className="r-scale" style={{ width: "100%", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#666" }}>
        <span>{slideData?.scaleMinLabel ?? scaleMin}</span>
        <span>{slideData?.scaleMaxLabel ?? scaleMax}</span>
      </div>

      <div
        className="r-scale__track"
        style={{
          position: "relative",
          width: "100%",
          height: 40,
          background: "#E8E8E8",
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
        }}
      >
        {distribution.map((count, i) => {
          const height = (count / maxDist) * 100;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                padding: "0 1px",
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: `${height}%`,
                  background: accentColor,
                  borderRadius: 3,
                  minHeight: count > 0 ? 4 : 0,
                  opacity: 0.7,
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        className="r-scale__avg"
        style={{
          position: "relative",
          height: 24,
          marginTop: 8,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${avgPct}%`,
            transform: "translateX(-50%)",
            background: accentColor,
            color: "#fff",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Avg: {avg.toFixed(1)}
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 13, color: "#888" }}>
        {responses.length} responses
      </div>
    </div>
  );
}

export function RankingRenderer({ slideData, results, theme }: RendererProps) {
  const options: string[] = slideData?.options ?? [];
  const responses: any[] = results?.responses ?? [];

  const ranked = useMemo(() => {
    if (options.length === 0 || responses.length === 0)
      return options.map((label, i) => ({ label, score: 0, rank: i + 1 }));

    const scores: Record<number, number> = {};
    options.forEach((_, i) => (scores[i] = 0));

    for (const r of responses) {
      const payload = r.data ?? r;
      const order: number[] = payload.type === "ranking" ? payload.order : [];
      for (let pos = 0; pos < order.length; pos++) {
        const idx = order[pos];
        if (scores[idx] !== undefined) {
          scores[idx] += options.length - pos;
        }
      }
    }

    return Object.entries(scores)
      .map(([idx, score]) => ({
        label: options[Number(idx)] || `Option ${Number(idx) + 1}`,
        score,
        rank: 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }, [options, responses]);

  const maxScore = Math.max(...ranked.map((r) => r.score), 1);

  return (
    <div className="r-ranking" style={{ width: "100%", padding: 16 }}>
      {ranked.map((item, i) => {
        const barWidth = (item.score / maxScore) * 100;
        const color = getThemeColor(i, theme);
        return (
          <div
            key={i}
            className="r-ranking__item"
            style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 12 }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: i === 0 ? color : "#e0e0e0",
                color: i === 0 ? "#fff" : "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {item.rank}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
              <div style={{ background: "#E8E8E8", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    background: color,
                    borderRadius: 4,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: 13, color: "#666", flexShrink: 0, minWidth: 50, textAlign: "right" }}>
              {item.score} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HundredPointsRenderer({ slideData, results, theme }: RendererProps) {
  const options: string[] = slideData?.options ?? [];
  const responses: any[] = results?.responses ?? [];

  const totals = useMemo(() => {
    const scores: Record<string, number> = {};
    options.forEach((_, i) => (scores[i] = 0));

    for (const r of responses) {
      const payload = r.data ?? r;
      const values: Record<string, number> = payload.type === "points" ? payload.values : {};
      for (const [key, val] of Object.entries(values)) {
        if (scores[key] !== undefined) scores[key] += val;
      }
    }

    return Object.entries(scores)
      .map(([idx, total]) => ({
        label: options[Number(idx)] || `Option ${Number(idx) + 1}`,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [options, responses]);

  const maxTotal = Math.max(...totals.map((t) => t.total), 1);

  return (
    <div className="r-points" style={{ width: "100%", padding: 16 }}>
      {totals.map((item, i) => {
        const barWidth = (item.total / maxTotal) * 100;
        const color = getThemeColor(i, theme);
        return (
          <div className="r-points__row" key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="r-points__bar" style={{ flex: 1, background: "#E8E8E8", borderRadius: 6, height: 24, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    background: color,
                    borderRadius: 6,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color, minWidth: 50, textAlign: "right" }}>
                {item.total}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TwoByTwoRenderer({ slideData, results, theme }: RendererProps) {
  const responses: any[] = results?.responses ?? [];
  const items = slideData?.options ?? [];
  const xLabel = slideData?.gridXLabel ?? "X Axis";
  const yLabel = slideData?.gridYLabel ?? "Y Axis";

  const dots = useMemo(() => {
    const points: Array<{ x: number; y: number; itemId?: string; color: string }> = [];

    for (const r of responses) {
      const payload = r.data ?? r;
      if (payload.type === "grid") {
        points.push({
          x: payload.x,
          y: payload.y,
          itemId: payload.itemId,
          color: getThemeColor(0, theme),
        });
      }
    }

    return points;
  }, [responses, theme]);

  const itemAverages = useMemo(() => {
    if (items.length === 0) return [];
    const buckets: Record<string, { xs: number[]; ys: number[] }> = {};
    items.forEach((_: string, i: number) => (buckets[i] = { xs: [], ys: [] }));

    for (const d of dots) {
      const key = d.itemId ?? "0";
      if (buckets[key]) {
        buckets[key].xs.push(d.x);
        buckets[key].ys.push(d.y);
      }
    }

    return Object.entries(buckets)
      .filter(([, v]) => v.xs.length > 0)
      .map(([idx, v]) => ({
        label: items[Number(idx)] || `Item ${Number(idx) + 1}`,
        avgX: v.xs.reduce((a, b) => a + b, 0) / v.xs.length,
        avgY: v.ys.reduce((a, b) => a + b, 0) / v.ys.length,
        color: getThemeColor(Number(idx), theme),
        count: v.xs.length,
      }));
  }, [dots, items, theme]);

  return (
    <div className="r-grid" style={{ width: "100%", padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 4, fontSize: 13, color: "#666" }}>{yLabel}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: 13,
            color: "#666",
            textAlign: "center",
          }}
        >
          {xLabel}
        </div>
        <div
          className="r-grid__plot"
          style={{
            position: "relative",
            flex: 1,
            height: 320,
            background: "#fafafa",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              borderTop: "1px dashed #ddd",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              borderLeft: "1px dashed #ddd",
            }}
          />
          {itemAverages.map((item, i) => (
            <div
              key={i}
              className="r-grid__dot"
              style={{
                position: "absolute",
                left: `${item.avgX}%`,
                top: `${100 - item.avgY}%`,
                transform: "translate(-50%, -50%)",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: item.color,
                border: "2px solid #fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
              title={`${item.label} (${item.avgX.toFixed(0)}, ${item.avgY.toFixed(0)}) - ${item.count} responses`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PinOnImageRenderer({ slideData, results, theme }: RendererProps) {
  const imageUrl: string = slideData?.imageUrl ?? "";
  const responses: any[] = results?.responses ?? [];

  const pins = useMemo(() => {
    return responses.map((r, i) => {
      const payload = r.data ?? r;
      return {
        x: payload.x ?? (payload.type === "pin" ? payload.x : 50),
        y: payload.y ?? (payload.type === "pin" ? payload.y : 50),
      };
    });
  }, [responses]);

  const clusters = useMemo(() => {
    if (pins.length < 50) return null;
    const gridSize = 5;
    const grid: Record<string, number> = {};
    for (const pin of pins) {
      const gx = Math.floor((pin.x / 100) * gridSize);
      const gy = Math.floor((pin.y / 100) * gridSize);
      const key = `${gx},${gy}`;
      grid[key] = (grid[key] || 0) + 1;
    }
    return Object.entries(grid).map(([key, count]) => {
      const [gx, gy] = key.split(",").map(Number);
      return {
        x: ((gx + 0.5) / gridSize) * 100,
        y: ((gy + 0.5) / gridSize) * 100,
        count,
      };
    });
  }, [pins]);

  const accentColor = getThemeColor(0, theme);

  return (
    <div className="r-pin" style={{ width: "100%", padding: 16 }}>
      <div
        className="r-pin__image"
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "60%",
          background: "#f0f0f0",
          borderRadius: 8,
          overflow: "hidden",
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!imageUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: 14,
            }}
          >
            No image configured
          </div>
        )}
        {clusters
          ? clusters.map((c, i) => (
              <div
                key={i}
                className="r-pin__marker"
                style={{
                  position: "absolute",
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  transform: "translate(-50%, -50%)",
                  background: accentColor,
                  color: "#fff",
                  borderRadius: "50%",
                  width: Math.min(24 + c.count, 48),
                  height: Math.min(24 + c.count, 48),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {c.count}
              </div>
            ))
          : pins.map((pin, i) => (
              <div
                key={i}
                className="r-pin__marker"
                style={{
                  position: "absolute",
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <MapPin size={22} color={accentColor} fill={accentColor} strokeWidth={1.5} />
              </div>
            ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>
        {pins.length} pin{pins.length !== 1 ? "s" : ""} placed
      </div>
    </div>
  );
}

export function QaRenderer({ slideData, results, theme }: RendererProps) {
  const questions: any[] = results?.questions ?? results?.responses ?? [];

  const sorted = useMemo(() => {
    return [...questions]
      .map((q) => ({
        id: q.id ?? Math.random().toString(),
        text: q.text ?? q.data?.question ?? (typeof q.data === "string" ? q.data : ""),
        likes: q.likes ?? 0,
        isAnswered: q.isAnswered ?? false,
      }))
      .filter((q) => q.text)
      .sort((a, b) => b.likes - a.likes);
  }, [questions]);

  if (sorted.length === 0) {
    return (
      <div className="r-qa" style={{ padding: 24, color: "#999" }}>
        No questions yet
      </div>
    );
  }

  return (
    <div className="r-qa" style={{ width: "100%", padding: 16 }}>
      {sorted.map((q, i) => (
        <div
          key={q.id}
          className="r-qa__question"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "12px 0",
            borderBottom: i < sorted.length - 1 ? "1px solid #eee" : "none",
            opacity: q.isAnswered ? 0.5 : 1,
          }}
        >
          <div className="r-qa__likes" style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
            <ThumbsUp size={16} color={q.likes > 0 ? getThemeColor(0, theme) : "#ccc"} />
            <span style={{ fontSize: 13, fontWeight: 600, color: q.likes > 0 ? getThemeColor(0, theme) : "#999" }}>
              {q.likes}
            </span>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5, flex: 1 }}>{q.text}</div>
        </div>
      ))}
    </div>
  );
}

export function TimerRenderer({ slideData, results, theme }: RendererProps) {
  const duration: number = slideData?.timerDuration ?? 60;
  const timeLeft: number = results?.timeLeft ?? duration;
  const pct = (timeLeft / duration) * 100;
  const accentColor = getThemeColor(0, theme);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="r-timer" style={{ width: "100%", padding: 24, textAlign: "center" }}>
      <div
        className="r-timer__display"
        style={{
          fontSize: 96,
          fontWeight: 800,
          fontFamily: "monospace",
          color: timeLeft <= 10 ? "#EF5350" : accentColor,
          animation: timeLeft <= 10 && timeLeft > 0 ? "r-timer-pulse 1s ease-in-out infinite" : "none",
          letterSpacing: 4,
        }}
      >
        {display}
      </div>
      <div style={{ margin: "24px auto 0", width: "80%", maxWidth: 400, height: 8, background: "#E8E8E8", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: timeLeft <= 10 ? "#EF5350" : accentColor,
            borderRadius: 4,
            transition: "width 1s linear",
          }}
        />
      </div>
      <style>{`
        @keyframes r-timer-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

export function LeaderboardRenderer({ slideData, results, theme }: RendererProps) {
  const entries: any[] = results?.entries ?? results?.leaderboard ?? [];

  const top10 = useMemo(() => {
    return [...entries]
      .map((e) => ({
        name: e.participantName ?? "Anonymous",
        score: e.totalScore ?? e.score ?? 0,
        correct: e.correctCount ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [entries]);

  if (top10.length === 0) {
    return (
      <div className="r-leaderboard" style={{ padding: 24, color: "#999", textAlign: "center" }}>
        <Trophy size={48} strokeWidth={1} style={{ marginBottom: 8, opacity: 0.3 }} />
        <div>No scores yet</div>
      </div>
    );
  }

  const medals = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <div className="r-leaderboard" style={{ width: "100%", padding: 16 }}>
      {top10.map((entry, i) => {
        const isTop3 = i < 3;
        return (
          <div
            key={i}
            className="r-leaderboard__row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              background: isTop3 ? `${medals[i]}15` : "transparent",
              borderRadius: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: isTop3 ? medals[i] : "#e0e0e0",
                color: isTop3 ? "#fff" : "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: isTop3 ? 700 : 400 }}>{entry.name}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: getThemeColor(0, theme) }}>{entry.score}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReactionsRenderer({ slideData, results, theme }: RendererProps) {
  const reactions: any[] = results?.responses ?? [];

  const grouped = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reactions) {
      const payload = r.data ?? r;
      const emoji: string = payload.type === "reaction" ? payload.emoji : payload.emoji ?? "";
      if (emoji) counts[emoji] = (counts[emoji] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [reactions]);

  if (grouped.length === 0) {
    return (
      <div className="r-reactions" style={{ padding: 24, color: "#999" }}>
        Waiting for reactions...
      </div>
    );
  }

  return (
    <div className="r-reactions" style={{ width: "100%", padding: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
        {grouped.map(([emoji, count], i) => (
          <div
            key={i}
            className="r-reactions__emoji"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 48 }}>{emoji}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: getThemeColor(i, theme) }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InstructionsRenderer({ slideData, results, theme }: RendererProps) {
  const steps: string[] = slideData?.instructionSteps ?? [];
  const accentColor = getThemeColor(0, theme);

  if (steps.length === 0) {
    return (
      <div className="r-instructions" style={{ padding: 24, color: "#999" }}>
        No instructions configured
      </div>
    );
  }

  return (
    <div className="r-instructions" style={{ width: "100%", padding: 24 }}>
      {steps.map((step, i) => (
        <div
          key={i}
          className="r-instructions__step"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: accentColor,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.6, paddingTop: 4 }}>{step}</div>
        </div>
      ))}
    </div>
  );
}

export function ContentRenderer({ slideData, results, theme }: RendererProps) {
  const html: string = slideData?.contentHtml ?? "";

  if (!html) {
    return (
      <div style={{ padding: 24, color: "#999" }}>
        No content configured
      </div>
    );
  }

  return (
    <div
      style={{ width: "100%", padding: 24, lineHeight: 1.7, fontSize: 16 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ImageChoiceRenderer({ slideData, results, theme }: RendererProps) {
  const imageOptions: Array<{ id: string; url: string; label: string }> = slideData?.imageOptions ?? [];
  const responses: any[] = results?.responses ?? [];

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    imageOptions.forEach((opt) => (c[opt.id] = 0));
    for (const r of responses) {
      const payload = r.data ?? r;
      const id: string = payload.type === "image_choice" ? payload.imageId : payload.imageId ?? "";
      if (c[id] !== undefined) c[id]++;
    }
    return c;
  }, [imageOptions, responses]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  if (imageOptions.length === 0) {
    return (
      <div className="r-image-choice" style={{ padding: 24, color: "#999" }}>
        No image options configured
      </div>
    );
  }

  return (
    <div className="r-image-choice" style={{ width: "100%", padding: 16, display: "grid", gridTemplateColumns: `repeat(${Math.min(imageOptions.length, 3)}, 1fr)`, gap: 16 }}>
      {imageOptions.map((opt, i) => {
        const count = counts[opt.id] || 0;
        const pct = ((count / total) * 100).toFixed(1);
        const color = getThemeColor(i, theme);
        return (
          <div
            key={opt.id}
            className="r-image-choice__item"
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "2px solid #e0e0e0",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100%",
                paddingBottom: "70%",
                backgroundImage: `url(${opt.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                background: opt.url ? undefined : "#f0f0f0",
              }}
            />
            <div style={{ padding: "8px 12px", background: "#fff" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color }}>
                {count} votes ({pct}%)
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: color,
                color: "#fff",
                borderRadius: 16,
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CommentsRenderer({ slideData, results, theme }: RendererProps) {
  const comments: any[] = results?.comments ?? results?.responses ?? [];

  const messages = useMemo(() => {
    return comments
      .map((c) => ({
        id: c.id ?? Math.random().toString(),
        message: c.message ?? c.data?.message ?? "",
        participantId: c.participantId ?? "unknown",
        createdAt: c.createdAt ?? new Date().toISOString(),
      }))
      .filter((m) => m.message)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [comments]);

  if (messages.length === 0) {
    return (
      <div className="r-comments" style={{ padding: 24, color: "#999" }}>
        No comments yet
      </div>
    );
  }

  return (
    <div className="r-comments" style={{ width: "100%", padding: 16, maxHeight: 480, overflowY: "auto" }}>
      {messages.map((m, i) => (
        <div
          key={m.id}
          className="r-comments__message"
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 14,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: getThemeColor(i, theme),
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {m.participantId.slice(0, 2).toUpperCase()}
          </div>
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: "0 12px 12px 12px",
              padding: "10px 14px",
              fontSize: 14,
              lineHeight: 1.5,
              maxWidth: "80%",
              wordBreak: "break-word",
            }}
          >
            {m.message}
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickFormRenderer({ slideData, results, theme }: RendererProps) {
  const fields: Array<{ id: string; label: string; type: string }> = slideData?.formFields ?? [];
  const responses: any[] = results?.responses ?? [];
  const accentColor = getThemeColor(0, theme);

  return (
    <div className="r-form" style={{ width: "100%", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <FileText size={24} color={accentColor} />
        <span style={{ fontSize: 20, fontWeight: 700 }}>{responses.length}</span>
        <span style={{ fontSize: 15, color: "#666" }}>submissions</span>
      </div>
      {fields.length > 0 && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Form fields:</div>
          {fields.map((field, i) => (
            <div key={field.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <ChevronRight size={14} color={accentColor} />
              <span style={{ fontSize: 14 }}>{field.label}</span>
              <span style={{ fontSize: 12, color: "#aaa", marginLeft: 4 }}>({field.type})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GatherNamesRenderer({ slideData, results, theme }: RendererProps) {
  const responses: any[] = results?.responses ?? [];

  const names = useMemo(() => {
    return responses
      .map((r) => {
        const payload = r.data ?? r;
        if (payload.type === "name") return payload.name;
        if (payload.participantName) return payload.participantName;
        return "";
      })
      .filter(Boolean);
  }, [responses]);

  if (names.length === 0) {
    return (
      <div className="r-names" style={{ padding: 24, color: "#999" }}>
        Waiting for names...
      </div>
    );
  }

  return (
    <div className="r-names" style={{ width: "100%", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Users size={20} color={getThemeColor(0, theme)} />
        <span style={{ fontSize: 15, color: "#666" }}>{names.length} name{names.length !== 1 ? "s" : ""} collected</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {names.map((name, i) => (
          <div
            key={i}
            className="r-names__item"
            style={{
              background: `${getThemeColor(i % THEME_COLORS.length, theme)}18`,
              border: `1px solid ${getThemeColor(i % THEME_COLORS.length, theme)}40`,
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuessNumberRenderer({ slideData, results, theme }: RendererProps) {
  const responses: any[] = results?.responses ?? [];
  const correctNumber: number = slideData?.correctNumber ?? 7;
  const guessMin: number = slideData?.guessMin ?? 0;
  const guessMax: number = slideData?.guessMax ?? 100;
  const showAnswer: boolean = slideData?.showResults ?? false;

  const { guesses, histogram, closestGuess, exactMatches } = useMemo(() => {
    const nums: number[] = [];
    for (const r of responses) {
      const payload = r.data ?? r;
      const val: number = payload.type === "guess_number" ? payload.value : typeof payload === "number" ? payload : 0;
      nums.push(val);
    }

    if (nums.length === 0) {
      return { guesses: nums, histogram: [], closestGuess: null, exactMatches: 0 };
    }

    const range = guessMax - guessMin || 1;
    const bucketCount = Math.min(range, 30);
    const bucketSize = range / bucketCount;
    const buckets: { min: number; max: number; count: number }[] = [];

    for (let i = 0; i < bucketCount; i++) {
      buckets.push({
        min: guessMin + i * bucketSize,
        max: guessMin + (i + 1) * bucketSize,
        count: 0,
      });
    }

    let exactCount = 0;
    let closest: number | null = null;
    let closestDist = Infinity;

    for (const n of nums) {
      const clamped = Math.max(guessMin, Math.min(guessMax, n));
      const bucketIdx = Math.min(Math.floor((clamped - guessMin) / bucketSize), bucketCount - 1);
      buckets[bucketIdx].count++;

      if (n === correctNumber) exactCount++;
      const dist = Math.abs(n - correctNumber);
      if (dist < closestDist) {
        closestDist = dist;
        closest = n;
      }
    }

    return { guesses: nums, histogram: buckets, closestGuess: closest, exactMatches: exactCount };
  }, [responses, guessMin, guessMax, correctNumber]);

  const maxBucket = Math.max(...histogram.map((b) => b.count), 1);
  const accentColor = getThemeColor(0, theme);

  if (responses.length === 0) {
    return (
      <div className="r-guess" style={{ padding: 24, color: "#999", textAlign: "center" }}>
        <Hash size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        Waiting for guesses...
      </div>
    );
  }

  const avg = guesses.length > 0 ? guesses.reduce((a, b) => a + b, 0) / guesses.length : 0;

  return (
    <div className="r-guess" style={{ width: "100%", padding: 16 }}>
      {/* Stats bar */}
      <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: accentColor }}>{guesses.length}</div>
          <div style={{ fontSize: 12, color: "#888" }}>guesses</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: accentColor }}>{avg.toFixed(1)}</div>
          <div style={{ fontSize: 12, color: "#888" }}>average</div>
        </div>
        {showAnswer && (
          <>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#10B981" }}>{correctNumber}</div>
              <div style={{ fontSize: 12, color: "#888" }}>answer</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>{exactMatches}</div>
              <div style={{ fontSize: 12, color: "#888" }}>correct</div>
            </div>
          </>
        )}
      </div>

      {/* Histogram */}
      <div style={{ position: "relative", width: "100%", height: 200, display: "flex", alignItems: "flex-end", gap: 2, marginBottom: 8 }}>
        {histogram.map((bucket, i) => {
          const height = (bucket.count / maxBucket) * 100;
          const isCorrectBucket = correctNumber >= bucket.min && correctNumber < bucket.max;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${height}%`,
                background: showAnswer && isCorrectBucket ? "#10B981" : accentColor,
                borderRadius: "3px 3px 0 0",
                minHeight: bucket.count > 0 ? 4 : 0,
                opacity: showAnswer && isCorrectBucket ? 1 : 0.7,
                transition: "height 0.4s ease, background 0.4s ease",
                position: "relative",
              }}
              title={`${Math.round(bucket.min)}-${Math.round(bucket.max)}: ${bucket.count} guesses`}
            >
              {bucket.count > 0 && histogram.length <= 20 && (
                <span style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#666", whiteSpace: "nowrap" }}>
                  {bucket.count}
                </span>
              )}
            </div>
          );
        })}

        {/* Correct number indicator line */}
        {showAnswer && (
          <div
            style={{
              position: "absolute",
              left: `${((correctNumber - guessMin) / (guessMax - guessMin)) * 100}%`,
              top: 0,
              bottom: 0,
              width: 3,
              background: "#10B981",
              transform: "translateX(-50%)",
              zIndex: 2,
              borderRadius: 2,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#10B981",
                color: "#fff",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {correctNumber}
            </div>
          </div>
        )}
      </div>

      {/* Axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
        <span>{guessMin}</span>
        <span>{guessMax}</span>
      </div>
    </div>
  );
}

const RENDERER_MAP: Record<string, React.ComponentType<RendererProps>> = {
  word_cloud: WordCloudRenderer,
  multiple_choice: MultipleChoiceRenderer,
  open_ended: OpenEndedRenderer,
  scales: ScalesRenderer,
  ranking: RankingRenderer,
  hundred_points: HundredPointsRenderer,
  two_by_two: TwoByTwoRenderer,
  pin_on_image: PinOnImageRenderer,
  qa: QaRenderer,
  timer: TimerRenderer,
  leaderboard: LeaderboardRenderer,
  reactions: ReactionsRenderer,
  instructions: InstructionsRenderer,
  content: ContentRenderer,
  image_choice: ImageChoiceRenderer,
  select_answer_quiz: MultipleChoiceRenderer,
  type_answer_quiz: OpenEndedRenderer,
  quick_form: QuickFormRenderer,
  comments: CommentsRenderer,
  gather_names: GatherNamesRenderer,
  guess_number: GuessNumberRenderer,
};

export function getSlideRenderer(slideType: string): React.ComponentType<RendererProps> {
  return RENDERER_MAP[slideType] ?? ContentRenderer;
}
