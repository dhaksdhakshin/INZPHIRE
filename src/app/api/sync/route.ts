import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

let client: MongoClient | null = null;
const globalMemory: Record<string, any> = {};

async function getCollection(name: string) {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(process.env.MONGODB_DB ?? "inzphire").collection(name);
}

const COLLECTION_MAP: Record<string, string> = {
  session: "sessions",
  results: "results",
  responses: "responses",
  qa: "qa_questions",
  comments: "comments",
  reactions: "reactions",
  participants: "participants",
};

// ─── GET ────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (!code || !type) {
    return NextResponse.json({ error: "Missing code or type" }, { status: 400 });
  }

  try {
    const colName = COLLECTION_MAP[type] ?? "sessions";
    const col = await getCollection(colName);

    // ── Session: return full session snapshot ──
    if (type === "session") {
      if (col) {
        const doc = await col.findOne({ _id: code as any });
        return NextResponse.json({ data: doc?.data || null });
      }
      return NextResponse.json({ data: globalMemory[`session:${code}`] || null });
    }

    // ── Responses: return all responses grouped by slideId ──
    if (type === "responses") {
      if (col) {
        const doc = await col.findOne({ _id: code as any });
        return NextResponse.json({ data: doc?.responses || [] });
      }
      return NextResponse.json({ data: globalMemory[`responses:${code}`] || [] });
    }

    // ── Results: return presenter-aggregated results ──
    if (type === "results") {
      if (col) {
        const doc = await col.findOne({ _id: code as any });
        return NextResponse.json({ data: doc?.data || null });
      }
      return NextResponse.json({ data: globalMemory[`results:${code}`] || null });
    }

    // ── Q&A: return questions ──
    if (type === "qa") {
      if (col) {
        const doc = await col.findOne({ _id: code as any });
        return NextResponse.json({ data: doc?.questions || [] });
      }
      return NextResponse.json({ data: globalMemory[`qa:${code}`] || [] });
    }

    // ── Comments ──
    if (type === "comments") {
      if (col) {
        const doc = await col.findOne({ _id: code as any });
        return NextResponse.json({ data: doc?.messages || [] });
      }
      return NextResponse.json({ data: globalMemory[`comments:${code}`] || [] });
    }

    // ── Reactions ──
    if (type === "reactions") {
      if (col) {
        const doc = await col.findOne({ _id: code as any });
        return NextResponse.json({ data: doc?.items || [] });
      }
      return NextResponse.json({ data: globalMemory[`reactions:${code}`] || [] });
    }

    // ── Participants ──
    if (type === "participants") {
      if (col) {
        const doc = await col.findOne({ _id: code as any });
        return NextResponse.json({ data: doc?.participants || [] });
      }
      return NextResponse.json({ data: globalMemory[`participants:${code}`] || [] });
    }

    return NextResponse.json({ data: null });
  } catch (e) {
    return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
  }
}

// ─── POST ───────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (!code || !type) {
    return NextResponse.json({ error: "Missing code or type" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // ── Session: full snapshot from presenter ──
    if (type === "session") {
      const colName = COLLECTION_MAP.session;
      const col = await getCollection(colName);
      if (col) {
        await col.updateOne(
          { _id: code as any },
          { $set: { data: body.data, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
      } else {
        globalMemory[`session:${code}`] = body.data;
      }
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    // ── Responses: append a single participant response ──
    if (type === "responses") {
      const { slideId, payload, participantId } = body;
      const entry = {
        slideId,
        participantId: participantId || "anon",
        data: payload,
        createdAt: new Date().toISOString(),
      };
      const colName = COLLECTION_MAP.responses;
      const col = await getCollection(colName);
      if (col) {
        await col.updateOne(
          { _id: code as any },
          { $push: { responses: entry } as any, $setOnInsert: { code } },
          { upsert: true }
        );
      } else {
        if (!globalMemory[`responses:${code}`]) globalMemory[`responses:${code}`] = [];
        globalMemory[`responses:${code}`].push(entry);
      }
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    // ── Results: full results blob from presenter ──
    if (type === "results") {
      const colName = COLLECTION_MAP.results;
      const col = await getCollection(colName);
      if (col) {
        await col.updateOne(
          { _id: code as any },
          { $set: { data: body.data, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
      } else {
        globalMemory[`results:${code}`] = body.data;
      }
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    // ── Q&A: append a question ──
    if (type === "qa") {
      const q = body.question || body;
      const entry = {
        id: q.id || `q-${Date.now()}`,
        text: q.text || q.question || "",
        likes: 0,
        isAnswered: false,
        participantId: q.participantId || "anon",
        createdAt: new Date().toISOString(),
      };
      const col = await getCollection(COLLECTION_MAP.qa);
      if (col) {
        await col.updateOne(
          { _id: code as any },
          { $push: { questions: entry } as any, $setOnInsert: { code } },
          { upsert: true }
        );
      } else {
        if (!globalMemory[`qa:${code}`]) globalMemory[`qa:${code}`] = [];
        globalMemory[`qa:${code}`].push(entry);
      }
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    // ── Comments: append a comment ──
    if (type === "comments") {
      const m = body.message || body;
      const entry = {
        id: m.id || `c-${Date.now()}`,
        participantId: m.participantId || "anon",
        message: m.message || m.text || "",
        createdAt: new Date().toISOString(),
      };
      const col = await getCollection(COLLECTION_MAP.comments);
      if (col) {
        await col.updateOne(
          { _id: code as any },
          { $push: { messages: entry } as any, $setOnInsert: { code } },
          { upsert: true }
        );
      } else {
        if (!globalMemory[`comments:${code}`]) globalMemory[`comments:${code}`] = [];
        globalMemory[`comments:${code}`].push(entry);
      }
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    // ── Reactions: append a reaction ──
    if (type === "reactions") {
      const r = body.reaction || body;
      const entry = {
        emoji: r.emoji || "👍",
        participantId: r.participantId || "anon",
        createdAt: new Date().toISOString(),
      };
      const col = await getCollection(COLLECTION_MAP.reactions);
      if (col) {
        await col.updateOne(
          { _id: code as any },
          { $push: { items: entry } as any, $setOnInsert: { code } },
          { upsert: true }
        );
      } else {
        if (!globalMemory[`reactions:${code}`]) globalMemory[`reactions:${code}`] = [];
        globalMemory[`reactions:${code}`].push(entry);
      }
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    // ── Participants: register a participant name ──
    if (type === "participants") {
      const p = body.participant || body;
      const entry = {
        id: p.id || `p-${Date.now()}`,
        name: p.name || "Anonymous",
        participantId: p.participantId || "anon",
        joinedAt: new Date().toISOString(),
      };
      const col = await getCollection(COLLECTION_MAP.participants);
      if (col) {
        await col.updateOne(
          { _id: code as any },
          { $push: { participants: entry } as any, $setOnInsert: { code } },
          { upsert: true }
        );
      } else {
        if (!globalMemory[`participants:${code}`]) globalMemory[`participants:${code}`] = [];
        globalMemory[`participants:${code}`].push(entry);
      }
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
  }
}
