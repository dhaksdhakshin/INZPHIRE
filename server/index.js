import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";

import { templateLibrarySeed } from "./template-seed.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5174);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI in the environment.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB ?? "inzphire";
const client = new MongoClient(mongoUri);
let connected = false;

async function getDb() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db(dbName);
}

function col(name) {
  return getDb().then((db) => db.collection(name));
}

async function ensureSeed(collection) {
  const existing = await collection.findOne({ _id: "library" });
  if (!existing) {
    await collection.insertOne({
      _id: "library",
      ...templateLibrarySeed,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  if (!existing.featureTemplateLibrary || !existing.templateCards) {
    await collection.updateOne(
      { _id: "library" },
      {
        $set: {
          ...templateLibrarySeed,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/templates", async (_req, res) => {
  try {
    const collection = await col("template_library");
    const doc = await collection.findOne({ _id: "library" });
    const payload = doc ?? templateLibrarySeed;

    res.json({
      featureTemplateLibrary:
        payload.featureTemplateLibrary ?? templateLibrarySeed.featureTemplateLibrary,
      templateCards: payload.templateCards ?? templateLibrarySeed.templateCards,
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to load template library", error);
    res.status(500).json({ error: "Failed to load template library." });
  }
});

const SYNC_COLLECTIONS = {
  session: "sessions",
  results: "results",
  leaderboard: "leaderboards",
  qa: "qa_questions",
  comments: "comments",
  reactions: "reactions",
  participants: "sessions",
};

const SYNC_GET_PROJECTIONS = {
  session: { projection: { code: 1, slideIndex: 1, slides: 1, updatedAt: 1, participantCount: 1 } },
  results: { projection: { code: 1, data: 1 } },
  leaderboard: { projection: { code: 1, entries: 1 } },
  qa: { projection: { code: 1, questions: 1 } },
  comments: { projection: { code: 1, messages: 1 } },
  reactions: { projection: { code: 1, items: 1 } },
  participants: { projection: { code: 1, participantCount: 1 } },
};

app.get("/api/sync", async (req, res) => {
  try {
    const code = req.query.code;
    const type = req.query.type;

    if (!code || !type) {
      return res.status(400).json({ error: "Missing code or type query parameter." });
    }

    const collectionName = SYNC_COLLECTIONS[type];
    if (!collectionName) {
      return res.status(400).json({ error: `Unknown sync type: ${type}` });
    }

    const collection = await col(collectionName);
    const options = SYNC_GET_PROJECTIONS[type] || {};
    const doc = await collection.findOne({ code }, options);

    if (!doc) {
      return res.json({ code, found: false });
    }

    res.json({ ...doc, found: true });
  } catch (error) {
    console.error("GET /api/sync error", error);
    res.status(500).json({ error: "Sync GET failed." });
  }
});

app.post("/api/sync", async (req, res) => {
  try {
    const code = req.query.code;
    const type = req.query.type;

    if (!code || !type) {
      return res.status(400).json({ error: "Missing code or type query parameter." });
    }

    const collectionName = SYNC_COLLECTIONS[type];
    if (!collectionName) {
      return res.status(400).json({ error: `Unknown sync type: ${type}` });
    }

    const collection = await col(collectionName);
    const body = req.body;

    if (type === "session") {
      await collection.updateOne(
        { code },
        {
          $set: {
            code,
            slideIndex: body.slideIndex ?? 0,
            slides: body.slides ?? [],
            updatedAt: new Date().toISOString(),
            participantCount: body.participantCount ?? 0,
          },
        },
        { upsert: true },
      );
    } else if (type === "results") {
      await collection.updateOne(
        { code },
        {
          $set: {
            code,
            data: body.data ?? {},
          },
        },
        { upsert: true },
      );
    } else if (type === "leaderboard") {
      await collection.updateOne(
        { code },
        {
          $set: {
            code,
            entries: body.entries ?? [],
          },
        },
        { upsert: true },
      );
    } else if (type === "qa") {
      if (body.questions) {
        await collection.updateOne(
          { code },
          {
            $set: {
              code,
              questions: body.questions,
            },
          },
          { upsert: true },
        );
      } else if (body.newQuestion) {
        const q = body.newQuestion;
        await collection.updateOne(
          { code },
          {
            $push: {
              questions: {
                id: q.id,
                text: q.text,
                likes: q.likes ?? 0,
                isAnswered: q.isAnswered ?? false,
                participantId: q.participantId ?? null,
                createdAt: new Date().toISOString(),
              },
            },
            $setOnInsert: { code },
          },
          { upsert: true },
        );
      }
    } else if (type === "comments") {
      if (body.messages) {
        await collection.updateOne(
          { code },
          {
            $set: {
              code,
              messages: body.messages,
            },
          },
          { upsert: true },
        );
      } else if (body.newMessage) {
        const m = body.newMessage;
        await collection.updateOne(
          { code },
          {
            $push: {
              messages: {
                id: m.id,
                participantId: m.participantId ?? null,
                message: m.message,
                createdAt: new Date().toISOString(),
              },
            },
            $setOnInsert: { code },
          },
          { upsert: true },
        );
      }
    } else if (type === "reactions") {
      if (body.items) {
        await collection.updateOne(
          { code },
          {
            $set: {
              code,
              items: body.items,
            },
          },
          { upsert: true },
        );
      } else if (body.newReaction) {
        const r = body.newReaction;
        await collection.updateOne(
          { code },
          {
            $push: {
              items: {
                participantId: r.participantId ?? null,
                emoji: r.emoji,
                createdAt: new Date().toISOString(),
              },
            },
            $setOnInsert: { code },
          },
          { upsert: true },
        );
      }
    } else if (type === "participants") {
      await collection.updateOne(
        { code },
        {
          $inc: { participantCount: body.increment ?? 1 },
          $set: {
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            code,
            slideIndex: 0,
            slides: [],
          },
        },
        { upsert: true },
      );
      const doc = await collection.findOne({ code }, { projection: { participantCount: 1 } });
      return res.json({ code, participantCount: doc?.participantCount ?? 0, found: true });
    }

    res.json({ code, ok: true });
  } catch (error) {
    console.error("POST /api/sync error", error);
    res.status(500).json({ error: "Sync POST failed." });
  }
});

async function start() {
  const collection = await col("template_library");
  await ensureSeed(collection);
  app.listen(port, () => {
    console.log(`INZPHIRE API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API server", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await client.close();
  process.exit(0);
});
