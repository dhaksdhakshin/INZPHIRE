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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "session" or "results"

  if (!code || !type) {
    return NextResponse.json({ error: "Missing code or type" }, { status: 400 });
  }

  try {
    const colName = type === "session" ? "sessions" : "results";
    const col = await getCollection(colName);
    if (col) {
      const doc = await col.findOne({ _id: code as any });
      return NextResponse.json({ data: doc?.data || null });
    }
    return NextResponse.json({ data: globalMemory[`${type}:${code}`] || null });
  } catch (e) {
    return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "session" or "results"

  if (!code || !type) {
    return NextResponse.json({ error: "Missing code or type" }, { status: 400 });
  }

  try {
    const { data } = await req.json();
    const colName = type === "session" ? "sessions" : "results";
    const col = await getCollection(colName);
    if (col) {
      await col.updateOne(
        { _id: code as any },
        { $set: { data, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    } else {
      globalMemory[`${type}:${code}`] = data;
    }
    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (e) {
    return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
  }
}
