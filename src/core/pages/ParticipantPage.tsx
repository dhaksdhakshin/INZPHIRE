import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ThumbsUp, Send, ChevronUp, ChevronDown, Plus, Minus, MapPin, Clock, Trophy, Check } from "lucide-react";
import type { SlideData, SlideType, ResponsePayload } from "../types";

type SessionSlide = {
  id: string;
  title: string;
  objective: string;
  interaction: string;
  type: string;
  questionType?: string;
  choices?: string[];
  options?: string[];
  imageUrl?: string;
  imageOptions?: Array<{ id: string; url: string; label: string }>;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  gridXLabel?: string;
  gridYLabel?: string;
  timerDuration?: number;
  quizPoints?: number;
  quizTimerSeconds?: number;
  correctAnswers?: string[];
  correctAnswerIndex?: number;
  formFields?: Array<{ id: string; label: string; type: "email" | "text" | "phone" }>;
  contentHtml?: string;
  instructionSteps?: string[];
  reactions?: string[];
  maxResponseLength?: number;
  maxResponses?: number;
  correctNumber?: number;
  guessMin?: number;
  guessMax?: number;
};

type SessionSnapshot = {
  code: string;
  slideIndex: number;
  slides: SessionSlide[];
  updatedAt: number;
};

const DEFAULT_CODE = "7117 9512";
const POLL_INTERVAL = 800;

const formatJoinCode = (code: string) => {
  const digits = code.replace(/\s+/g, "");
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`.trim();
};

const parseSession = (raw: string | null): SessionSnapshot | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
};

const getParticipantId = (): string => {
  if (typeof window === "undefined") return "anon";
  const key = "inzphire-participant-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, id);
  }
  return id;
};

const TYPE_MAP: Record<string, SlideType> = {
  "word-cloud": "word_cloud", word_cloud: "word_cloud",
  "multiple-choice": "multiple_choice", multiple_choice: "multiple_choice",
  "open-ended": "open_ended", open_ended: "open_ended",
  scales: "scales", scale: "scales",
  ranking: "ranking",
  "points-100": "hundred_points", "hundred-points": "hundred_points", hundred_points: "hundred_points",
  "grid-2x2": "two_by_two", "2x2": "two_by_two", "two-by-two": "two_by_two", two_by_two: "two_by_two",
  "pin-image": "pin_on_image", pin_on_image: "pin_on_image",
  qna: "qa", qa: "qa",
  "image-choice": "image_choice", image_choice: "image_choice",
  "select-answer": "select_answer_quiz", select_answer: "select_answer_quiz", select_answer_quiz: "select_answer_quiz",
  "type-answer": "type_answer_quiz", type_answer: "type_answer_quiz", type_answer_quiz: "type_answer_quiz",
  "guess-number": "guess_number", guess_number: "guess_number",
  timer: "timer", instructions: "instructions", content: "content",
  leaderboard: "leaderboard", reactions: "reactions",
  "quick-form": "quick_form", quick_form: "quick_form",
  comments: "comments", "gather-names": "gather_names", gather_names: "gather_names",
};

const resolveSlideType = (slide: SessionSlide): SlideType => {
  if (slide.questionType) { const qt = slide.questionType.toLowerCase(); if (TYPE_MAP[qt]) return TYPE_MAP[qt]; }
  if (slide.type) { const t = slide.type.toLowerCase(); if (TYPE_MAP[t]) return TYPE_MAP[t]; }
  if (slide.interaction) {
    const sig = slide.interaction.toLowerCase();
    if (sig.includes("word") || sig.includes("text bomb")) return "word_cloud";
    if (sig.includes("multiple") || sig.includes("poll")) return "multiple_choice";
    if (sig.includes("open") || sig.includes("free")) return "open_ended";
    if (sig.includes("scale") || sig.includes("rate")) return "scales";
    if (sig.includes("rank")) return "ranking";
    if (sig.includes("point")) return "hundred_points";
    if (sig.includes("grid") || sig.includes("2x2")) return "two_by_two";
    if (sig.includes("pin")) return "pin_on_image";
    if (sig.includes("q&a") || sig.includes("question")) return "qa";
    if (sig.includes("select answer")) return "select_answer_quiz";
    if (sig.includes("type answer")) return "type_answer_quiz";
    if (sig.includes("leaderboard") || sig.includes("score")) return "leaderboard";
    if (sig.includes("reaction") || sig.includes("emoji")) return "reactions";
    if (sig.includes("form") || sig.includes("email")) return "quick_form";
    if (sig.includes("comment") || sig.includes("chat")) return "comments";
    if (sig.includes("name")) return "gather_names";
    if (sig.includes("timer") || sig.includes("countdown")) return "timer";
    if (sig.includes("instruction")) return "instructions";
    if (sig.includes("image choice")) return "image_choice";
  }
  return "content";
};

const toSlideData = (slide: SessionSlide): SlideData => ({
  id: slide.id || `slide-${Date.now()}`,
  type: resolveSlideType(slide),
  title: slide.title || "Question",
  subtitle: slide.objective || "",
  options: slide.options ?? slide.choices ?? [],
  imageUrl: slide.imageUrl || "",
  imageOptions: slide.imageOptions ?? [],
  scaleMin: slide.scaleMin ?? 1,
  scaleMax: slide.scaleMax ?? 10,
  scaleMinLabel: slide.scaleMinLabel || "Low",
  scaleMaxLabel: slide.scaleMaxLabel || "High",
  gridXLabel: slide.gridXLabel || "X",
  gridYLabel: slide.gridYLabel || "Y",
  timerDuration: slide.timerDuration ?? 60,
  quizPoints: slide.quizPoints ?? 1000,
  quizTimerSeconds: slide.quizTimerSeconds ?? 30,
  correctAnswers: slide.correctAnswers ?? [],
  correctAnswerIndex: slide.correctAnswerIndex,
  formFields: slide.formFields ?? [],
  contentHtml: slide.contentHtml || "",
  instructionSteps: slide.instructionSteps ?? ["Go to inzphire.com", "Enter the code shown on screen"],
  reactions: slide.reactions ?? ["👍", "❤️", "😂", "😮", "👏"],
  maxResponseLength: slide.maxResponseLength ?? 25,
  maxResponses: slide.maxResponses ?? 5,
  correctNumber: slide.correctNumber ?? 7,
  guessMin: slide.guessMin ?? 0,
  guessMax: slide.guessMax ?? 100,
  orderIndex: 0,
});

const getEndpointForType = (slideType: SlideType): string => {
  switch (slideType) {
    case "qa": return "qa";
    case "comments": return "comments";
    case "reactions": return "reactions";
    case "gather_names": return "participants";
    default: return "responses";
  }
};

const S: Record<string, React.CSSProperties> = {
  card: { padding: "24px", background: "#ffffff", borderRadius: "16px", border: "2px solid #e5e7eb", minHeight: "200px", width: "100%", boxSizing: "border-box" as const },
  label: { display: "block", fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "12px" },
  hint: { fontSize: "14px", color: "#6b7280", margin: "0 0 12px" },
  input: { width: "100%", minHeight: "48px", padding: "12px 16px", border: "2px solid #d1d5db", borderRadius: "12px", fontSize: "16px", outline: "none", background: "#fff", color: "#111", boxSizing: "border-box" as const },
  textarea: { width: "100%", minHeight: "100px", padding: "12px 16px", border: "2px solid #d1d5db", borderRadius: "12px", fontSize: "16px", outline: "none", resize: "vertical" as const, background: "#fff", color: "#111", fontFamily: "inherit", boxSizing: "border-box" as const },
  btn: { minHeight: "48px", padding: "0 24px", borderRadius: "999px", background: "#6b5cff", color: "#fff", fontSize: "16px", fontWeight: 600, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 150ms ease, transform 100ms ease" },
  btnDisabled: { minHeight: "48px", padding: "0 24px", borderRadius: "999px", background: "#9ca3af", color: "#fff", fontSize: "16px", fontWeight: 600, border: "none", cursor: "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  option: { display: "flex", alignItems: "center", minHeight: "52px", padding: "14px 18px", border: "2px solid #d1d5db", borderRadius: "14px", background: "#fff", fontSize: "16px", color: "#111", cursor: "pointer", width: "100%", textAlign: "left" as const, transition: "all 150ms ease" },
  optionSelected: { display: "flex", alignItems: "center", minHeight: "52px", padding: "14px 18px", border: "2px solid #6b5cff", borderRadius: "14px", background: "#f0eeff", fontSize: "16px", color: "#111", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "left" as const, transition: "all 150ms ease" },
  row: { display: "flex", gap: "8px", width: "100%" },
  col: { display: "flex", flexDirection: "column" as const, gap: "10px", width: "100%" },
  confirmBanner: { display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "14px", background: "#ecfdf5", border: "2px solid #10b981", color: "#065f46", fontSize: "15px", fontWeight: 600, marginTop: "12px", animation: "fadeInUp 300ms ease" },
};

function SubmitConfirmation() {
  return (
    <div style={S.confirmBanner}>
      <Check size={20} color="#10b981" />
      Response submitted!
    </div>
  );
}

function SlideInput({ slide, onSubmit, submitted }: { slide: SlideData; onSubmit: (p: ResponsePayload) => void; submitted: boolean }) {
  const [val, setVal] = useState("");
  const [sel, setSel] = useState<number | string | null>(null);
  const [order, setOrder] = useState<number[]>(() => (slide.options ?? []).map((_, i) => i));
  const [pts, setPts] = useState<Record<string, number>>(() => { const o: Record<string, number> = {}; (slide.options ?? []).forEach((x) => { o[x] = 0; }); return o; });
  const [formVals, setFormVals] = useState<Record<string, string>>(() => { const o: Record<string, string> = {}; (slide.formFields ?? []).forEach((f) => { o[f.id] = ""; }); return o; });
  const [gridSel, setGridSel] = useState<{ x: number; y: number } | null>(null);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [timerLeft, setTimerLeft] = useState(slide.timerDuration ?? 60);
  const [quizLeft, setQuizLeft] = useState(slide.quizTimerSeconds ?? 30);
  const opts = slide.options ?? [];
  const disabled = submitted;

  useEffect(() => { setVal(""); setSel(null); setOrder((slide.options ?? []).map((_, i) => i)); setPts(() => { const o: Record<string, number> = {}; (slide.options ?? []).forEach((x) => { o[x] = 0; }); return o; }); setFormVals(() => { const o: Record<string, string> = {}; (slide.formFields ?? []).forEach((f) => { o[f.id] = ""; }); return o; }); setGridSel(null); setPin(null); setTimerLeft(slide.timerDuration ?? 60); setQuizLeft(slide.quizTimerSeconds ?? 30); }, [slide.id, slide.type]);

  useEffect(() => { if (slide.type !== "timer") return; if (timerLeft <= 0) return; const t = setInterval(() => setTimerLeft((p) => Math.max(0, p - 1)), 1000); return () => clearInterval(t); }, [slide.type, timerLeft]);

  useEffect(() => { if (!["select_answer_quiz", "type_answer_quiz"].includes(slide.type)) return; if (submitted || quizLeft <= 0) return; const t = setInterval(() => setQuizLeft((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000); return () => clearInterval(t); }, [slide.type, submitted, quizLeft]);

  const moveRank = (idx: number, dir: number) => {
    const sw = idx + dir;
    if (sw < 0 || sw >= order.length) return;
    const n = [...order];
    [n[idx], n[sw]] = [n[sw], n[idx]];
    setOrder(n);
  };

  const adjustPts = (key: string, delta: number) => {
    const total = Object.values(pts).reduce((s, v) => s + v, 0);
    const cur = pts[key] ?? 0;
    const nv = Math.max(0, Math.min(100, cur + delta));
    if (total - cur + nv > 100) return;
    setPts((p) => ({ ...p, [key]: nv }));
  };

  const timerPct = timerLeft / (slide.timerDuration ?? 60) * 100;
  const quizPct = quizLeft / (slide.quizTimerSeconds ?? 30) * 100;
  const totalPts = Object.values(pts).reduce((s, v) => s + v, 0);
  const remainPts = 100 - totalPts;

  switch (slide.type) {
    case "word_cloud":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          {slide.subtitle && <div style={S.hint}>{slide.subtitle}</div>}
          <div style={S.row}>
            <input style={S.input} type="text" maxLength={slide.maxResponseLength ?? 25} placeholder="Type your word..." value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onSubmit({ type: "text", value: val.trim() }); setVal(""); } }} disabled={disabled} />
            <button style={val.trim() ? S.btn : S.btnDisabled} onClick={() => { if (val.trim()) { onSubmit({ type: "text", value: val.trim() }); setVal(""); } }} disabled={disabled || !val.trim()}><Send size={18} /></button>
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{val.length}/{slide.maxResponseLength ?? 25}</div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "multiple_choice":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={S.col}>
            {opts.map((opt, i) => (
              <button key={i} style={sel === i ? S.optionSelected : S.option} onClick={() => { if (disabled) return; setSel(i); onSubmit({ type: "choice", index: i }); }} disabled={disabled}>
                <span style={{ fontWeight: 600, marginRight: 12, color: "#6b5cff", minWidth: 24 }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
            {opts.length === 0 && <div style={{ color: "#9ca3af", padding: 16, textAlign: "center" }}>No options configured</div>}
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "open_ended":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          {slide.subtitle && <div style={S.hint}>{slide.subtitle}</div>}
          <textarea style={S.textarea as any} rows={4} placeholder="Type your response..." value={val} onChange={(e) => setVal(e.target.value)} disabled={disabled} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{val.length}/500</span>
            <button style={val.trim() && !disabled ? S.btn : S.btnDisabled} onClick={() => { if (val.trim()) onSubmit({ type: "text", value: val.trim() }); }} disabled={disabled || !val.trim()}>Submit</button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "scales":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>{slide.scaleMinLabel ?? "Low"}</span>
            <span style={{ fontSize: 13, color: "#6b7280" }}>{slide.scaleMaxLabel ?? "High"}</span>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {Array.from({ length: (slide.scaleMax ?? 10) - (slide.scaleMin ?? 1) + 1 }, (_, i) => (slide.scaleMin ?? 1) + i).map((n) => (
              <button key={n} style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: sel === n ? "2px solid #6b5cff" : "2px solid #d1d5db", background: sel === n ? "#6b5cff" : "#fff", color: sel === n ? "#fff" : "#111", fontSize: 16, fontWeight: 600, cursor: disabled ? "default" : "pointer", transition: "all 150ms ease" }} onClick={() => { if (disabled) return; setSel(n); onSubmit({ type: "scale", value: n }); }} disabled={disabled}>{n}</button>
            ))}
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "ranking":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={{ fontSize: 14, color: "#6b7280", margin: "0 0 16px" }}>Drag to reorder — top is #1</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {order.map((optIdx, rankIdx) => (
              <div key={optIdx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 14, background: "#fff", minHeight: 56, transition: "all 150ms ease", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#6b5cff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{rankIdx + 1}</span>
                <span style={{ flex: 1, fontSize: 16, color: "#111", fontWeight: 500 }}>{opts[optIdx] ?? `Item ${optIdx + 1}`}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <button style={{ width: 36, height: 28, border: "1px solid #e5e7eb", borderRadius: 8, background: rankIdx === 0 ? "#f9fafb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: rankIdx === 0 ? "default" : "pointer", opacity: rankIdx === 0 ? 0.3 : 1, transition: "all 150ms" }} onClick={() => moveRank(rankIdx, -1)} disabled={disabled || rankIdx === 0}><ChevronUp size={16} /></button>
                  <button style={{ width: 36, height: 28, border: "1px solid #e5e7eb", borderRadius: 8, background: rankIdx === order.length - 1 ? "#f9fafb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: rankIdx === order.length - 1 ? "default" : "pointer", opacity: rankIdx === order.length - 1 ? 0.3 : 1, transition: "all 150ms" }} onClick={() => moveRank(rankIdx, 1)} disabled={disabled || rankIdx === order.length - 1}><ChevronDown size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, width: "100%" }}>
            <button style={{ ...(disabled ? S.btnDisabled : S.btn), width: "100%", minHeight: 52, fontSize: 17, borderRadius: 14 }} onClick={() => onSubmit({ type: "ranking", order })} disabled={disabled}>Submit Ranking</button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "hundred_points":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: remainPts === 0 ? "#10b981" : "#6b5cff", marginBottom: 12 }}>Points remaining: {remainPts}</div>
          <div style={S.col}>
            {opts.map((opt) => (
              <div key={opt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "2px solid #d1d5db", borderRadius: 12, background: "#fff" }}>
                <span style={{ flex: 1, fontSize: 14, color: "#111" }}>{opt}</span>
                <button style={{ width: 36, height: 36, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => adjustPts(opt, -5)} disabled={disabled || (pts[opt] ?? 0) <= 0}><Minus size={16} /></button>
                <span style={{ width: 32, textAlign: "center", fontWeight: 700, fontSize: 16, color: "#111" }}>{pts[opt] ?? 0}</span>
                <button style={{ width: 36, height: 36, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => adjustPts(opt, 5)} disabled={disabled || remainPts <= 0}><Plus size={16} /></button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button style={totalPts === 100 && !disabled ? S.btn : S.btnDisabled} onClick={() => { if (totalPts === 100) onSubmit({ type: "points", values: pts }); }} disabled={disabled || totalPts !== 100}>{totalPts === 100 ? "Submit" : `Allocate all 100 points (${remainPts} left)`}</button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "two_by_two":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, color: "#6b7280" }}>{slide.gridYLabel ?? "Y Axis"}</span><span style={{ fontSize: 13, color: "#6b7280" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 6, maxHeight: 280 }}>
            {[{ x: 0, y: 0, l: "Top-Left" }, { x: 1, y: 0, l: "Top-Right" }, { x: 0, y: 1, l: "Bottom-Left" }, { x: 1, y: 1, l: "Bottom-Right" }].map((q) => (
              <button key={q.l} style={gridSel?.x === q.x && gridSel?.y === q.y ? S.optionSelected : { ...S.option, minHeight: 80, fontSize: 14, justifyContent: "center" }} onClick={() => { if (disabled) return; setGridSel({ x: q.x, y: q.y }); }} disabled={disabled}>{q.l}</button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{slide.gridXLabel ?? "X Axis"} →</div>
          <div style={{ marginTop: 8 }}>
            <button style={gridSel && !disabled ? S.btn : S.btnDisabled} onClick={() => { if (gridSel) onSubmit({ type: "grid", x: gridSel.x, y: gridSel.y }); }} disabled={disabled || !gridSel}>Submit</button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "pin_on_image":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={S.hint}>Tap to place your pin</div>
          <div onClick={(e) => { if (disabled) return; const r = e.currentTarget.getBoundingClientRect(); setPin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }} style={{ position: "relative", width: "100%", minHeight: 220, backgroundColor: "#e5e7eb", borderRadius: 8, overflow: "hidden", cursor: disabled ? "default" : "crosshair" }}>
            {slide.imageUrl && <img src={slide.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            {!slide.imageUrl && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, color: "#9ca3af" }}>Tap anywhere to place pin</div>}
            {pin && <div style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -100%)" }}><MapPin size={28} color="#ef4444" fill="#ef4444" /></div>}
          </div>
          <div style={{ marginTop: 8 }}>
            <button style={pin && !disabled ? S.btn : S.btnDisabled} onClick={() => { if (pin) onSubmit({ type: "pin", x: pin.x, y: pin.y }); }} disabled={disabled || !pin}>Submit Pin</button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "qa":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={S.row}>
            <input style={S.input} type="text" placeholder="Ask a question..." value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onSubmit({ type: "qa", question: val.trim() }); setVal(""); } }} disabled={disabled} />
            <button style={val.trim() ? S.btn : S.btnDisabled} onClick={() => { if (val.trim()) { onSubmit({ type: "qa", question: val.trim() }); setVal(""); } }} disabled={disabled || !val.trim()}><Send size={18} /></button>
          </div>
        </div>
      );

    case "timer": {
      const m = Math.floor(timerLeft / 60);
      const s = timerLeft % 60;
      return (
        <div style={{ ...S.card, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}><Clock size={24} color="#3b82f6" /><span style={{ fontSize: 36, fontWeight: 700, color: "#111" }}>{m}:{s.toString().padStart(2, "0")}</span></div>
          <div style={{ width: "100%", height: 8, borderRadius: 4, backgroundColor: "#e5e7eb", overflow: "hidden" }}><div style={{ height: "100%", width: `${timerPct}%`, backgroundColor: timerPct > 30 ? "#3b82f6" : "#ef4444", borderRadius: 4, transition: "width 1s linear" }} /></div>
        </div>
      );
    }

    case "instructions":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={S.col}>
            {(slide.instructionSteps ?? ["Go to inzphire.com", "Enter the code shown on screen"]).map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: "50%", backgroundColor: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{i + 1}</span>
                <span style={{ fontSize: 15, color: "#374151", lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "content":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          {slide.subtitle && <div style={S.hint}>{slide.subtitle}</div>}
          {slide.contentHtml && <div style={{ color: "#374151", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: slide.contentHtml }} />}
          {!slide.contentHtml && <div style={{ color: "#9ca3af", textAlign: "center", padding: 24 }}>Content slide</div>}
        </div>
      );

    case "image_choice":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          {(slide.imageOptions ?? []).length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {(slide.imageOptions ?? []).map((img) => (
                <button key={img.id} style={sel === img.id ? S.optionSelected : { ...S.option, minHeight: 100, padding: 4, flexDirection: "column" as const }} onClick={() => { if (disabled) return; setSel(img.id); onSubmit({ type: "image_choice", imageId: img.id }); }} disabled={disabled}>
                  <img src={img.url} alt={img.label} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 4 }} />
                  <span style={{ fontSize: 12 }}>{img.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {opts.map((opt, i) => (
                <button key={i} style={sel === i ? S.optionSelected : { ...S.option, minHeight: 80, justifyContent: "center", flexDirection: "column" as const }} onClick={() => { if (disabled) return; setSel(i); onSubmit({ type: "image_choice", imageId: String(i) }); }} disabled={disabled}>
                  <div style={{ width: 60, height: 60, borderRadius: 8, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, fontSize: 24 }}>🖼️</div>
                  <span style={{ fontSize: 13 }}>{opt}</span>
                </button>
              ))}
            </div>
          )}
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "select_answer_quiz":
      return (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={S.label}>{slide.title}</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{slide.quizPoints ?? 1000} pts</span>
          </div>
          <div style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: "#e5e7eb", overflow: "hidden", marginBottom: 12 }}><div style={{ height: "100%", width: `${quizPct}%`, backgroundColor: quizPct > 30 ? "#3b82f6" : "#ef4444", borderRadius: 3, transition: "width 1s linear" }} /></div>
          <div style={S.col}>
            {opts.map((opt, i) => (
              <button key={i} style={sel === i ? S.optionSelected : S.option} onClick={() => { if (disabled || quizLeft <= 0) return; setSel(i); onSubmit({ type: "quiz_answer", answer: opt, index: i }); }} disabled={disabled || quizLeft <= 0}>
                <span style={{ fontWeight: 600, marginRight: 12, color: "#6b5cff" }}>{String.fromCharCode(65 + i)}</span>{opt}
              </button>
            ))}
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "type_answer_quiz":
      return (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={S.label}>{slide.title}</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{slide.quizPoints ?? 1000} pts</span>
          </div>
          <div style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: "#e5e7eb", overflow: "hidden", marginBottom: 12 }}><div style={{ height: "100%", width: `${quizPct}%`, backgroundColor: quizPct > 30 ? "#3b82f6" : "#ef4444", borderRadius: 3, transition: "width 1s linear" }} /></div>
          <div style={S.row}>
            <input style={S.input} type="text" placeholder="Type your answer..." value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim() && quizLeft > 0) { onSubmit({ type: "quiz_answer", answer: val.trim() }); } }} disabled={disabled || quizLeft <= 0} />
            <button style={val.trim() && quizLeft > 0 ? S.btn : S.btnDisabled} onClick={() => { if (val.trim() && quizLeft > 0) onSubmit({ type: "quiz_answer", answer: val.trim() }); }} disabled={disabled || !val.trim() || quizLeft <= 0}><Send size={18} /></button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "leaderboard":
      return (
        <div style={{ ...S.card, textAlign: "center" }}>
          <Trophy size={48} style={{ color: "#f59e0b", margin: "0 auto 12px" }} />
          <div style={S.label}>{slide.title}</div>
          <div style={S.hint}>Waiting for results...</div>
        </div>
      );

    case "reactions": {
      const emojis = slide.reactions ?? ["👍", "❤️", "😂", "😮", "👏"];
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {emojis.map((em) => (
              <button key={em} onClick={() => { if (!disabled) onSubmit({ type: "reaction", emoji: em }); }} disabled={disabled} style={{ minHeight: 56, minWidth: 56, fontSize: 30, border: "2px solid #d1d5db", borderRadius: 14, background: "#fff", cursor: disabled ? "default" : "pointer", transition: "transform 100ms ease" }}>{em}</button>
            ))}
          </div>
        </div>
      );
    }

    case "quick_form": {
      const fields = slide.formFields ?? [{ id: "email", label: "Email", type: "email" as const }, { id: "name", label: "Name", type: "text" as const }];
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={S.col}>
            {fields.map((f) => (
              <div key={f.id}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{f.label}</label>
                <input style={S.input} type={f.type === "phone" ? "tel" : f.type} placeholder={f.label} value={formVals[f.id] ?? ""} onChange={(e) => setFormVals((p) => ({ ...p, [f.id]: e.target.value }))} disabled={disabled} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button style={!disabled ? S.btn : S.btnDisabled} onClick={() => { onSubmit({ type: "form", fields: formVals }); }} disabled={disabled}>Submit</button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );
    }

    case "comments":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={S.row}>
            <input style={S.input} type="text" placeholder="Write a comment..." value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onSubmit({ type: "comment", message: val.trim() }); setVal(""); } }} disabled={disabled} />
            <button style={val.trim() ? S.btn : S.btnDisabled} onClick={() => { if (val.trim()) { onSubmit({ type: "comment", message: val.trim() }); setVal(""); } }} disabled={disabled || !val.trim()}><Send size={18} /></button>
          </div>
        </div>
      );

    case "gather_names":
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={S.row}>
            <input style={S.input} type="text" placeholder="Enter your name" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) onSubmit({ type: "name", name: val.trim() }); }} disabled={disabled} />
            <button style={val.trim() ? S.btn : S.btnDisabled} onClick={() => { if (val.trim()) onSubmit({ type: "name", name: val.trim() }); }} disabled={disabled || !val.trim()}>Join</button>
          </div>
          {submitted && <SubmitConfirmation />}
        </div>
      );

    case "guess_number": {
      const min = slide.guessMin ?? 0;
      const max = slide.guessMax ?? 100;
      const numVal = parseFloat(val);
      const isValid = !isNaN(numVal) && numVal >= min && numVal <= max;
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          {slide.subtitle && <div style={S.hint}>{slide.subtitle}</div>}
          <div style={{ fontSize: 14, color: "#6b7280", margin: "0 0 12px" }}>Pick a number between {min} and {max}</div>
          {/* Slider */}
          <div style={{ padding: "8px 0" }}>
            <input
              type="range"
              min={min}
              max={max}
              value={isNaN(numVal) ? min : numVal}
              onChange={(e) => setVal(e.target.value)}
              disabled={disabled}
              style={{ width: "100%", height: 8, accentColor: "#F97316", cursor: disabled ? "default" : "pointer" }}
            />
          </div>
          <div style={S.row}>
            <input style={S.input} type="number" min={min} max={max} placeholder={`Enter a number (${min}-${max})`} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && isValid) onSubmit({ type: "guess_number", value: numVal }); }} disabled={disabled} />
            <button style={isValid && !disabled ? S.btn : S.btnDisabled} onClick={() => { if (isValid) onSubmit({ type: "guess_number", value: numVal }); }} disabled={disabled || !isValid}>Submit</button>
          </div>
          {isValid && <div style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#F97316", marginTop: 12 }}>{numVal}</div>}
          {submitted && <SubmitConfirmation />}
        </div>
      );
    }

    default:
      return (
        <div style={S.card}>
          <div style={S.label}>{slide.title}</div>
          <div style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>Type: {slide.type}</div>
        </div>
      );
  }
}

export default function ParticipantPage() {
  const { code: routeCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get("code");
  const [joinCode] = useState(formatJoinCode(routeCode || queryCode || DEFAULT_CODE));
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [liked, setLiked] = useState(false);
  const participantId = useMemo(() => getParticipantId(), []);

  useEffect(() => {
    let alive = true;
    const loadSession = async () => {
      try {
        const res = await fetch(`/api/sync?code=${joinCode}&type=session`);
        if (!alive) return;
        if (res.ok) {
          const json = await res.json();
          const data = json.data;
          if (data) {
            const parsed = typeof data === "string" ? parseSession(data) : (data as SessionSnapshot);
            if (parsed) setSession(parsed);
          }
        }
      } catch { /* network error, keep polling */ }
    };
    loadSession();
    const interval = window.setInterval(loadSession, POLL_INTERVAL);
    return () => { alive = false; clearInterval(interval); };
  }, [joinCode]);

  useEffect(() => { setSubmitted(false); }, [session?.slideIndex, session?.updatedAt]);

  const activeSlide = useMemo((): SessionSlide | null => {
    if (!session || session.slides.length === 0) return null;
    return session.slides[Math.min(session.slideIndex, session.slides.length - 1)] ?? null;
  }, [session]);

  const slideData = useMemo((): SlideData | null => {
    if (!activeSlide) return null;
    return toSlideData(activeSlide);
  }, [activeSlide]);

  const handleSubmit = useCallback(
    async (payload: ResponsePayload) => {
      if (!slideData) return;
      const endpoint = getEndpointForType(slideData.type);
      const isRepeatable = slideData.type === "word_cloud" || slideData.type === "qa" || slideData.type === "comments" || slideData.type === "reactions";
      if (!isRepeatable) setSubmitted(true);

      // Build request body based on endpoint type
      let body: any;
      if (endpoint === "responses") {
        body = { slideId: slideData.id, payload, participantId };
      } else if (endpoint === "qa") {
        const q = payload as { type: "qa"; question: string };
        body = { question: { text: q.question, participantId } };
      } else if (endpoint === "comments") {
        const c = payload as { type: "comment"; message: string };
        body = { message: { message: c.message, participantId } };
      } else if (endpoint === "reactions") {
        const r = payload as { type: "reaction"; emoji: string };
        body = { reaction: { emoji: r.emoji, participantId } };
      } else if (endpoint === "participants") {
        const n = payload as { type: "name"; name: string };
        body = { participant: { name: n.name, participantId } };
      } else {
        body = { slideId: slideData.id, payload, participantId };
      }

      try {
        await fetch(`/api/sync?code=${joinCode}&type=${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch { /* network error, ignore */ }
    },
    [slideData, joinCode, participantId]
  );

  const questionTitle = activeSlide?.title || "Waiting for a question\u2026";
  const questionHint = activeSlide?.objective || "Respond to the question to join the live session.";
  const isReadOnly = slideData?.type === "timer" || slideData?.type === "instructions" || slideData?.type === "content" || slideData?.type === "leaderboard";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#111" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:active:not(:disabled) { transform: scale(0.97); }
        input:focus, textarea:focus { border-color: #6b5cff !important; box-shadow: 0 0 0 3px rgba(107,92,255,0.15); }
      `}</style>

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 8px" }}>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "0.02em" }}>INZPHIRE</span>
        <span style={{ fontSize: 13, color: "#6b7280", background: "#f3f4f6", padding: "4px 12px", borderRadius: 8, fontWeight: 500 }}>{joinCode}</span>
      </header>

      <main style={{ width: "min(520px, calc(100% - 44px))", margin: "4px auto 12px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px", color: "#111" }}>{questionTitle}</h1>
          {!isReadOnly && <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>{questionHint}</p>}
        </div>

        {slideData ? (
          <SlideInput slide={slideData} onSubmit={handleSubmit} submitted={submitted} />
        ) : (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", background: "#fff", borderRadius: 16, border: "2px dashed #e5e7eb" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Waiting for presentation to begin...</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Stay on this page. It will update automatically.</div>
          </div>
        )}

        <button type="button" aria-label="Like" onClick={() => setLiked((v) => !v)} style={{ opacity: liked ? 1 : 0.4, background: "none", border: "none", cursor: "pointer", padding: 8, transition: "opacity 200ms ease" }}>
          <ThumbsUp size={18} />
        </button>
      </main>

      <footer style={{ padding: "16px 22px", fontSize: 13, color: "#9ca3af" }}>
        <p>Create your own INZPHIRE at <a href="https://inzphire.com" target="_blank" rel="noreferrer" style={{ color: "#6b5cff" }}>inzphire.com</a></p>
      </footer>
    </div>
  );
}
