import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";

import { templateLibrarySeed } from "./template-seed.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5174);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI in the environment.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB ?? "inzphire";
const collectionName = "template_library";
const client = new MongoClient(mongoUri);
let connected = false;

async function getCollection() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db(dbName).collection(collectionName);
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
    const collection = await getCollection();
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

async function start() {
  const collection = await getCollection();
  await ensureSeed(collection);
  app.listen(port, () => {
    console.log(`Template API listening on port ${port}`);
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
