import { MongoClient } from "mongodb";
import type { RoomDoc } from "@/lib/types";

const uri = process.env.MONGODB_URI;

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Copy .env.example to .env.local and set your MongoDB Atlas connection string."
    );
  }
  const cached = globalThis.__mongoClientPromise;
  if (cached) return cached;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  const promise = client.connect();
  globalThis.__mongoClientPromise = promise;
  return promise;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db("tachkila");
}

export async function getRoomsCollection() {
  const db = await getDb();
  return db.collection<RoomDoc>("rooms");
}

export async function getPlayersCollection() {
  const db = await getDb();
  return db.collection("players");
}